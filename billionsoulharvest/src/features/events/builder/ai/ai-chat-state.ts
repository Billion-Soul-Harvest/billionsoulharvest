"use client";

import { useState, useCallback, useRef } from "react";
import { useEditor } from "@craftjs/core";
import type { ChatMessage, AIOperation, AIBuilderRequest, Attachment } from "@/shared/utils/ai/types";
import {
  applyFullPageGeneration,
  applyNodeEdits,
  applyAddNodes,
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
        const MAX_CONTINUATIONS = 2;
        for (let i = 0; i < MAX_CONTINUATIONS; i++) {
          if (!fullContent.endsWith("<!--STOP:max_tokens-->")) break;

          console.log(`[AI] Response truncated, requesting continuation ${i + 1}/${MAX_CONTINUATIONS}`);
          // Strip the sentinel marker
          fullContent = fullContent.replace(/\n<!--STOP:max_tokens-->$/, "");

          // Update display
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: fullContent + "\n\n[Continuing...]" } : m
            )
          );

          const continuationBody: AIBuilderRequest = {
            messages: [
              ...requestBody.messages.slice(0, -1),
              { role: "user" as const, content: userMessage },
              { role: "assistant" as const, content: fullContent },
              { role: "user" as const, content: "Continue generating from where you stopped. Output ONLY the remaining JSON, no explanation." },
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
            setError("AI responded without actionable changes. Try being more specific, e.g. \"Update the heading text to: ...\"");
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
    console.log("[AI] No JSON code block found in response");
    return undefined;
  }

  const explanation = content.split("```")[0].trim();

  // Try each JSON block (prefer the largest one)
  const sortedBlocks = jsonBlocks.sort((a, b) => b[1].length - a[1].length);

  for (const match of sortedBlocks) {
    try {
      const parsed = JSON.parse(match[1]);

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
      console.log("[AI] Failed to parse JSON block:", e);
    }
  }

  return undefined;
}
