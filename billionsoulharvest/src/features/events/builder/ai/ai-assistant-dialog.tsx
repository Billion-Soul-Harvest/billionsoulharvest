"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor } from "@craftjs/core";
import { useAIChat } from "./ai-chat-state";
import type { ChatMessage, AIOperation, Attachment } from "@/shared/utils/ai/types";

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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

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
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;
    const nodeId = capturedNodeId || getSelectedNodeId();
    sendMessage(input.trim(), nodeId, attachments.length > 0 ? attachments : undefined);
    setInput("");
    setAttachments([]);
    setCapturedNodeId(undefined);
  };

  const processFiles = (files: FileList | File[]) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        setApplyError(`File "${file.name}" exceeds 10MB limit`);
        return;
      }
      const allowed = file.type.startsWith("image/") || file.type === "application/pdf";
      if (!allowed) {
        setApplyError(`Unsupported file type: ${file.type}. Use images or PDFs.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setAttachments((prev) => [...prev, { name: file.name, type: file.type, data: base64 }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
    <div
      className={`fixed bottom-4 right-4 w-[400px] h-[560px] bg-white rounded-xl shadow-2xl border flex flex-col z-50 overflow-hidden transition-colors ${
        isDragging ? "border-blue-400 border-2" : "border-gray-200"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 bg-blue-50/90 flex flex-col items-center justify-center rounded-xl pointer-events-none">
          <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-blue-600">Drop files here</p>
          <p className="text-xs text-blue-400 mt-1">Images or PDFs</p>
        </div>
      )}

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
            isLastAssistant={!isStreaming && idx === messages.length - 1 && msg.role === "assistant"}
            error={!isStreaming && idx === messages.length - 1 && msg.role === "assistant" ? (error || applyError) : null}
            onApply={() => handleApply(msg)}
            onDiscard={() => handleDiscard(msg)}
            onRetry={() => {
              const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
              if (lastUserMsg) {
                setApplyError(null);
                sendMessage(lastUserMsg.content, undefined, lastUserMsg.attachments);
              }
            }}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex gap-2">
        <QuickActionChip label="Generate Page" onClick={() => handleQuickAction("generate")} />
        <QuickActionChip label="Edit Selected" onClick={() => handleQuickAction("edit")} />
        <QuickActionChip label="Suggest Content" onClick={() => handleQuickAction("suggest")} />
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-1.5">
          {attachments.map((att, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200"
            >
              {att.type === "application/pdf" ? (
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              <span className="truncate max-w-[120px]">{att.name}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="text-blue-400 hover:text-blue-600 shrink-0"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t bg-gray-50 flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          title="Attach image or PDF"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
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
            disabled={!input.trim() && attachments.length === 0}
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
  isLastAssistant,
  error,
  onApply,
  onDiscard,
  onRetry,
}: {
  message: ChatMessage;
  isApplied: boolean;
  isStreaming?: boolean;
  isLastAssistant?: boolean;
  error?: string | null;
  onApply: () => void;
  onDiscard: () => void;
  onRetry: () => void;
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

        {/* Attachment indicators */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {message.attachments.map((att, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] bg-blue-500/30 text-blue-100 px-1.5 py-0.5 rounded"
              >
                {att.type === "application/pdf" ? "PDF" : "IMG"}: {att.name}
              </span>
            ))}
          </div>
        )}

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

        {/* Error — no actionable changes from AI */}
        {!isUser && isLastAssistant && !message.operation && !isStreaming && error && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1.5 border border-amber-200">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={onRetry}
              className="mt-1.5 text-xs bg-blue-600 text-white px-2.5 py-1 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* No operation, no error — show hint */}
        {!isUser && isLastAssistant && !message.operation && !isStreaming && !error && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No changes generated. Try a more specific request.</span>
            </div>
            <button
              onClick={onRetry}
              className="mt-1.5 text-xs bg-blue-600 text-white px-2.5 py-1 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
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
