"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor } from "@craftjs/core";
import { useAIChat } from "./ai-chat-state";
import type { ChatMessage, AIOperation } from "@/shared/utils/ai/types";

interface Props {
  open: boolean;
  onClose: () => void;
  eventData: {
    title: string;
    description: string | null;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    slug: string;
  };
}

export function AIAssistantDialog({ open, onClose, eventData }: Props) {
  const { query } = useEditor();
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    applyOperation,
    undoLastApply,
    stopStreaming,
    clearChat,
  } = useAIChat(eventData);

  const [input, setInput] = useState("");
  const [appliedOps, setAppliedOps] = useState<Set<string>>(new Set());
  const [capturedNodeId, setCapturedNodeId] = useState<string | undefined>();
  const [applyError, setApplyError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open) return null;

  const getSelectedNodeId = (): string | undefined => {
    try {
      const state = query.getState();
      const selected = state.events?.selected;
      if (selected && selected.size > 0) {
        return Array.from(selected)[0] as string;
      }
    } catch {
      // Ignore
    }
    return undefined;
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    // Use captured node ID (from Edit Selected) or current selection
    const nodeId = capturedNodeId || getSelectedNodeId();
    sendMessage(input.trim(), nodeId);
    setInput("");
    setCapturedNodeId(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApply = (msg: ChatMessage) => {
    if (!msg.operation) return;
    setApplyError(null);
    const result = applyOperation(msg.operation);
    if (result.success) {
      setAppliedOps((prev) => new Set(prev).add(msg.id));
    } else {
      setApplyError(result.error || "Failed to apply changes");
    }
  };

  const handleDiscard = (msg: ChatMessage) => {
    if (appliedOps.has(msg.id)) {
      undoLastApply();
      setAppliedOps((prev) => {
        const next = new Set(prev);
        next.delete(msg.id);
        return next;
      });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "generate":
        setInput("Generate a full page layout for this event");
        break;
      case "edit": {
        const nodeId = getSelectedNodeId();
        if (nodeId) {
          setCapturedNodeId(nodeId);
          setInput("Edit the selected element: ");
        } else {
          setInput("(No element selected — select one on the canvas first) ");
        }
        break;
      }
      case "suggest":
        setInput("Suggest content ideas for this event page");
        break;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-[400px] h-[560px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p className="mb-2">Ask me to help build your event page.</p>
            <p className="text-xs text-gray-300">
              I can generate layouts, edit blocks, or suggest content.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isApplied={appliedOps.has(msg.id)}
            isStreaming={isStreaming && idx === messages.length - 1 && msg.role === "assistant"}
            onApply={() => handleApply(msg)}
            onDiscard={() => handleDiscard(msg)}
          />
        ))}

        {(error || applyError) && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error || applyError}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex gap-2">
        <QuickActionChip label="Generate Page" onClick={() => handleQuickAction("generate")} />
        <QuickActionChip label="Edit Selected" onClick={() => handleQuickAction("edit")} />
        <QuickActionChip label="Suggest Content" onClick={() => handleQuickAction("suggest")} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t bg-gray-50 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isStreaming ? (
          <button
            onClick={stopStreaming}
            className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shrink-0"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isApplied,
  isStreaming,
  onApply,
  onDiscard,
}: {
  message: ChatMessage;
  isApplied: boolean;
  isStreaming?: boolean;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const isUser = message.role === "user";
  const hasJsonBlock = !isUser && message.content.includes("```");
  const jsonComplete = hasJsonBlock && message.content.split("```").length >= 3;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {isUser
            ? message.content
            : message.content.split("```")[0].trim() || message.content}
        </p>

        {/* Streaming indicator when JSON is being generated */}
        {isStreaming && hasJsonBlock && !jsonComplete && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-blue-600">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating layout...
          </div>
        )}

        {isStreaming && !hasJsonBlock && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            <span className="animate-pulse">...</span>
          </div>
        )}

        {/* Apply/Discard buttons for assistant messages with operations */}
        {!isUser && message.operation && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex gap-2">
            {isApplied ? (
              <>
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Applied
                </span>
                <button
                  onClick={onDiscard}
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  Undo
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onApply}
                  className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply to Canvas
                </button>
                <button
                  onClick={onDiscard}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Discard
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
    >
      {label}
    </button>
  );
}
