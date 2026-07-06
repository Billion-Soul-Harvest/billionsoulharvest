import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { getProvider, type AIMessage, type ContentBlock } from "@/shared/utils/ai/provider";
import { buildSystemPrompt } from "@/shared/utils/ai/system-prompt";
import type { AIBuilderRequest } from "@/shared/utils/ai/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: AIBuilderRequest = await request.json();
    const { messages, context } = body;

    if (!messages || !context) {
      return NextResponse.json(
        { error: "messages and context are required" },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(context.eventData);

    // Build augmented messages with canvas context and attachments
    const augmentedMessages: AIMessage[] = messages.map((msg, idx) => {
      if (idx === messages.length - 1 && msg.role === "user") {
        let augmented = msg.content;
        if (context.currentCanvasJson) {
          // Add a summary of node IDs for easy reference
          try {
            const canvasObj = JSON.parse(context.currentCanvasJson);
            const nodeSummary = Object.entries(canvasObj)
              .map(([id, node]) => {
                const n = node as Record<string, unknown>;
                const type = (n.type as Record<string, string>)?.resolvedName || "unknown";
                return `  "${id}" → ${type}`;
              })
              .join("\n");
            augmented += `\n\n[Canvas node IDs — use these EXACT IDs for edit_node operations]:\n${nodeSummary}`;
          } catch {
            // Fall through to raw JSON
          }
          augmented += `\n\n[Current canvas JSON]:\n${context.currentCanvasJson}`;
        }
        if (context.selectedNodeId && context.selectedNodeJson) {
          augmented += `\n\n[Selected node ID]: ${context.selectedNodeId}\n[Selected node JSON]: ${context.selectedNodeJson}`;
        }

        // Build multimodal content blocks if attachments are present
        if (msg.attachments && msg.attachments.length > 0) {
          const contentBlocks: ContentBlock[] = [{ type: "text", text: augmented }];
          for (const att of msg.attachments) {
            if (att.type === "application/pdf") {
              contentBlocks.push({
                type: "document",
                source: { type: "base64", media_type: att.type, data: att.data },
              });
            } else if (att.type.startsWith("image/")) {
              contentBlocks.push({
                type: "image",
                source: { type: "base64", media_type: att.type, data: att.data },
              });
            }
          }
          return { role: msg.role, content: contentBlocks } as AIMessage;
        }

        return { role: msg.role, content: augmented } as AIMessage;
      }
      return { role: msg.role, content: msg.content } as AIMessage;
    });

    const provider = getProvider();
    const stream = await provider.streamChat(systemPrompt, augmentedMessages);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
