import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/utils/supabase/server";
import { getProvider } from "@/shared/utils/ai/provider";
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

    // Build augmented messages with canvas context
    const augmentedMessages = messages.map((msg, idx) => {
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
        return { role: msg.role, content: augmented };
      }
      return msg;
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
