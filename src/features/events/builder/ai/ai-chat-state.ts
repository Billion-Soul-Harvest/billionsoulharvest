"use client";

import { useState, useCallback, useRef } from "react";
import { useEditor } from "@craftjs/core";
import type { ChatMessage, AIOperation, AIBuilderRequest, Attachment } from "@/shared/utils/ai/types";
import {
  applyFullPageGeneration,
  applyNodeEdits,
  applyAddNodes,
  applyRemoveNodes,
  getCanvasSnapshot,
} from "./ai-canvas-bridge";

interface EventData {
  title: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  slug: string;
}

export function useAIChat(eventData: EventData) {
  const { query, actions } = useEditor();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const snapshotRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string, selectedNodeId?: string, attachments?: Attachment[]) => {
      setError(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        attachments,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      // Take canvas snapshot for undo
      snapshotRef.current = getCanvasSnapshot(query);

      // Get selected node data
      let selectedNodeJson: string | undefined;
      if (selectedNodeId) {
        try {
          const serialized = query.serialize();
          const parsed = JSON.parse(serialized);
          if (parsed[selectedNodeId]) {
            selectedNodeJson = JSON.stringify(parsed[selectedNodeId]);
          }
        } catch {
          // Ignore serialization errors
        }
      }

      // Build request — strip JSON blocks from history to save tokens
      const historyMessages = messages.map((m) => ({
        role: m.role,
        content: m.role === "assistant"
          ? m.content.split("```")[0].trim()
          : m.content,
      }));
      const requestBody: AIBuilderRequest = {
        messages: [
          ...historyMessages,
          { role: "user" as const, content: userMessage, attachments },
        ],
        context: {
          currentCanvasJson: getCanvasSnapshot(query),
          selectedNodeId,
          selectedNodeJson,
          eventData: {
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            startDate: eventData.start_date,
            endDate: eventData.end_date,
            slug: eventData.slug,
          },
        },
      };

      const payloadSize = JSON.stringify(requestBody).length;
      console.log("[AI] Sending request, selectedNodeId:", selectedNodeId, "history:", historyMessages.length, "payload:", Math.round(payloadSize / 1024) + "KB");

      if (payloadSize > 3.5 * 1024 * 1024) {
        setError("Canvas is too large to send with attachments. Try removing attachments or simplifying the page first.");
        setIsStreaming(false);
        return;
      }

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const response = await fetch("/api/ai/builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
          credentials: "same-origin",
        });

        if (!response.ok) {
          const errText = await response.text();
          let errMsg = `Request failed (${response.status})`;
          try {
            const errJson = JSON.parse(errText);
            errMsg = errJson.error || errMsg;
          } catch {
            errMsg = errText || errMsg;
          }
          throw new Error(errMsg);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const assistantMsgId = crypto.randomUUID();
        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Stream the response
        let fullContent = await streamResponse(response, assistantMsgId, setMessages);

        // Auto-continuation: if response was truncated, request continuation (up to 2 retries)
        // Detect truncation via sentinel (Anthropic max_tokens), unclosed code block (Vercel timeout),
        // or explanation text with no JSON block (cut off before JSON started)
        const isTruncated = (text: string) => {
          if (text.endsWith("<!--STOP:max_tokens-->")) return true;
          // Unclosed code block = stream died mid-JSON (Vercel timeout)
          const hasOpenBlock = text.includes("```") && text.split("```").length % 2 === 0;
          if (hasOpenBlock) return true;
          // Response has explanation text but no JSON block at all — AI was cut off before producing JSON
          const hasNoJsonBlock = !text.includes("```");
          if (hasNoJsonBlock && text.trim().length > 50) return true;
          return false;
        };

        const MAX_CONTINUATIONS = 2;
        for (let i = 0; i < MAX_CONTINUATIONS; i++) {
          if (!isTruncated(fullContent)) break;

          console.log(`[AI] Response truncated, requesting continuation ${i + 1}/${MAX_CONTINUATIONS}`);
          // Strip the sentinel marker
          fullContent = fullContent.replace(/\n<!--STOP:max_tokens-->$/, "");

          // Update display
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: fullContent + "\n\n[Continuing...]" } : m
            )
          );

          const hasJsonStarted = fullContent.includes("```");
          const continuationPrompt = hasJsonStarted
            ? "Continue generating from where you stopped. Output ONLY the remaining JSON, no explanation."
            : "Now output the JSON code block. Skip the explanation — go straight to the ```json block with the operation.";

          const continuationBody: AIBuilderRequest = {
            messages: [
              ...requestBody.messages.slice(0, -1),
              { role: "user" as const, content: userMessage },
              { role: "assistant" as const, content: fullContent },
              { role: "user" as const, content: continuationPrompt },
            ],
            context: requestBody.context,
          };

          const contResponse = await fetch("/api/ai/builder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(continuationBody),
            signal: abortController.signal,
            credentials: "same-origin",
          });

          if (!contResponse.ok || !contResponse.body) break;

          const contPayloadSize = JSON.stringify(continuationBody).length;
          console.log(`[AI] Continuation ${i + 1} payload: ${Math.round(contPayloadSize / 1024)}KB`);

          const contContent = await streamResponse(contResponse, assistantMsgId, setMessages, fullContent);
          fullContent = contContent;
        }

        // Strip any remaining sentinel marker
        fullContent = fullContent.replace(/\n<!--STOP:max_tokens-->$/, "");

        // Parse operation from the full response
        console.log("[AI] Full response length:", fullContent.length);
        console.log("[AI] Response tail:", fullContent.slice(-200));
        const operation = parseOperation(fullContent);
        console.log("[AI] Parsed operation:", operation ? operation.type : "none");
        if (operation) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: fullContent, operation } : m
            )
          );
        } else if (fullContent.length > 0) {
          // Check if response has an incomplete JSON block (truncated)
          const hasOpenBlock = fullContent.includes("```") && fullContent.split("```").length % 2 === 0;
          if (hasOpenBlock) {
            setError("Response was truncated — the JSON block was cut off. Try a simpler request or edit fewer sections at once.");
          } else {
            setError("AI responded without a JSON code block. The response may have been too long. Try a simpler request or click Retry.");
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, query, eventData]
  );

  const applyOperation = useCallback(
    (operation: AIOperation): { success: boolean; error?: string } => {
      // Save snapshot before applying
      snapshotRef.current = getCanvasSnapshot(query);

      switch (operation.type) {
        case "generate_full_page":
          if (!operation.fullPageJson) {
            return { success: false, error: "No page JSON provided" };
          }
          return applyFullPageGeneration(actions, operation.fullPageJson);

        case "edit_node":
          if (!operation.nodeEdits) {
            return { success: false, error: "No node edits provided" };
          }
          return applyNodeEdits(actions, operation.nodeEdits, query);

        case "add_nodes":
          if (!operation.nodesToAdd) {
            return { success: false, error: "No nodes to add" };
          }
          return applyAddNodes(actions, query, {
            parentId: operation.nodesToAdd.parentId,
            index: operation.nodesToAdd.index,
            nodes: operation.nodesToAdd.tree as Record<string, unknown>,
          });

        case "remove_nodes":
          if (!operation.nodesToRemove || operation.nodesToRemove.length === 0) {
            return { success: false, error: "No node IDs to remove" };
          }
          return applyRemoveNodes(actions, query, operation.nodesToRemove);

        case "suggest_content":
          return { success: true };

        default:
          return { success: false, error: `Unknown operation type: ${operation.type}` };
      }
    },
    [actions, query]
  );

  const undoLastApply = useCallback(() => {
    if (snapshotRef.current) {
      actions.clearEvents();
      actions.deserialize(snapshotRef.current);
      snapshotRef.current = null;
    }
  }, [actions]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    snapshotRef.current = null;
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    applyOperation,
    undoLastApply,
    stopStreaming,
    clearChat,
  };
}

async function streamResponse(
  response: Response,
  msgId: string,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
  existingContent = ""
): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = existingContent;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    fullContent += chunk;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, content: fullContent } : m
      )
    );
  }

  return fullContent;
}

function parseOperation(content: string): AIOperation | undefined {
  // Look for JSON code block in the response (greedy to capture the last/largest block)
  const jsonBlocks = [...content.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
  if (jsonBlocks.length === 0) {
    // Fallback: try to find an unclosed JSON block (truncated response) and repair it
    const unclosedMatch = content.match(/```(?:json)?\s*([\s\S]+)$/);
    if (unclosedMatch) {
      console.log("[AI] Found unclosed JSON block, attempting repair...");
      const repaired = repairTruncatedJson(unclosedMatch[1].trim());
      if (repaired) {
        const explanation = content.split("```")[0].trim();
        return tryParseJsonToOperation(repaired, explanation);
      }
    }
    console.log("[AI] No JSON code block found in response");
    return undefined;
  }

  const explanation = content.split("```")[0].trim();

  // Try each JSON block (prefer the largest one)
  const sortedBlocks = jsonBlocks.sort((a, b) => b[1].length - a[1].length);

  for (const match of sortedBlocks) {
    const result = tryParseJsonToOperation(match[1], explanation);
    if (result) return result;
  }

  // If no blocks parsed successfully, try merging all blocks (continuation artifact)
  if (jsonBlocks.length > 1) {
    console.log("[AI] Trying to merge", jsonBlocks.length, "JSON blocks...");
    const merged = jsonBlocks.map((m) => m[1].trim()).join("");
    const result = tryParseJsonToOperation(merged, explanation);
    if (result) {
      console.log("[AI] Merged blocks parsed successfully");
      return result;
    }
    // Try repairing merged content
    const repaired = repairTruncatedJson(merged);
    if (repaired) {
      const repairedResult = tryParseJsonToOperation(repaired, explanation);
      if (repairedResult) {
        console.log("[AI] Repaired merged blocks parsed successfully");
        return repairedResult;
      }
    }
  }

  return undefined;
}

function tryParseJsonToOperation(jsonStr: string, explanation: string): AIOperation | undefined {
  try {
    const parsed = JSON.parse(jsonStr);

    // Format 1: { operation: "...", data: { ... } }
    if (parsed.operation) {
      const opType = parsed.operation;
      switch (opType) {
        case "generate_full_page":
          return { type: "generate_full_page", fullPageJson: parsed.data, explanation };
        case "edit_node":
          return {
            type: "edit_node",
            nodeEdits: Array.isArray(parsed.data) ? parsed.data : parsed.data?.edits,
            explanation,
          };
        case "add_nodes": {
          const addData = parsed.data || parsed;
          if (!addData.parentId && !addData.nodes) {
            console.log("[AI] add_nodes missing data fields:", Object.keys(parsed));
            break;
          }
          return {
            type: "add_nodes",
            nodesToAdd: {
              parentId: addData.parentId || "ROOT",
              index: addData.index,
              tree: addData.nodes || addData.tree,
            },
            explanation,
          };
        }
        case "remove_nodes": {
          const removeData = parsed.data;
          const ids = Array.isArray(removeData) ? removeData : removeData?.nodeIds;
          if (!Array.isArray(ids)) {
            console.log("[AI] remove_nodes missing nodeIds array");
            break;
          }
          return {
            type: "remove_nodes",
            nodesToRemove: ids,
            explanation,
          };
        }
        case "suggest_content":
          return { type: "suggest_content", explanation };
      }
    }

    // Format 2: Raw Craft.js JSON with ROOT node (AI returned page JSON directly)
    if (parsed.ROOT) {
      console.log("[AI] Detected raw Craft.js JSON (has ROOT node)");
      return { type: "generate_full_page", fullPageJson: parsed, explanation };
    }

    // Format 3: Array of edits [{ nodeId, props }]
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].nodeId) {
      console.log("[AI] Detected array of node edits");
      return { type: "edit_node", nodeEdits: parsed, explanation };
    }

    console.log("[AI] JSON parsed but unrecognized format:", Object.keys(parsed));
  } catch (e) {
    console.log("[AI] Failed to parse JSON block:", (e as Error).message?.slice(0, 100));
  }
  return undefined;
}

/**
 * Attempt to repair truncated JSON by closing open braces/brackets.
 * Returns the repaired string or null if it can't be fixed.
 */
function repairTruncatedJson(json: string): string | null {
  // Strip trailing commas, partial strings, and whitespace
  let trimmed = json.replace(/,\s*$/, "");

  // If it's inside a string value, close the string
  const quoteCount = (trimmed.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    // Find last unescaped quote and truncate any partial value after it
    const lastQuoteIdx = trimmed.lastIndexOf('"');
    const afterQuote = trimmed.slice(lastQuoteIdx + 1);
    // If there's no colon/comma/brace after the last quote, we're mid-string
    if (!/[,:}\]]/.test(afterQuote.trim())) {
      trimmed = trimmed.slice(0, lastQuoteIdx) + '"';
    }
  }

  // Strip trailing partial key-value pairs (e.g., `"key":` with no value)
  trimmed = trimmed.replace(/,?\s*"[^"]*"\s*:\s*$/, "");
  // Strip trailing comma
  trimmed = trimmed.replace(/,\s*$/, "");

  // Count open/close braces and brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let prevChar = "";

  for (const ch of trimmed) {
    if (ch === '"' && prevChar !== "\\") {
      inString = !inString;
    } else if (!inString) {
      if (ch === "{") openBraces++;
      if (ch === "}") openBraces--;
      if (ch === "[") openBrackets++;
      if (ch === "]") openBrackets--;
    }
    prevChar = ch;
  }

  if (openBraces < 0 || openBrackets < 0) return null; // More closes than opens = broken
  if (openBraces === 0 && openBrackets === 0) {
    // Already balanced — try parsing directly
    try { JSON.parse(trimmed); return trimmed; } catch { return null; }
  }

  // Close remaining brackets and braces
  let repaired = trimmed;
  for (let i = 0; i < openBrackets; i++) repaired += "]";
  for (let i = 0; i < openBraces; i++) repaired += "}";

  try {
    JSON.parse(repaired);
    console.log(`[AI] Repaired JSON by closing ${openBraces} braces and ${openBrackets} brackets`);
    return repaired;
  } catch {
    return null;
  }
}
