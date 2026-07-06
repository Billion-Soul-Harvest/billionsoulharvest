"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "@craftjs/core";
import { SettingsPopover } from "./settings-popover";
import { getUndoStack } from "./use-keyboard-shortcuts";

export function ElementToolbar() {
  const { selected, actions, query } = useEditor((state, query) => {
    const currentNodeId = query.getEvent("selected").last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.displayName,
        settings: state.nodes[currentNodeId].related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return { selected };
  });

  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) {
      setPosition(null);
      setShowSettings(false);
      return;
    }

    const updatePosition = () => {
      const dom = query.node(selected.id).get().dom;
      if (!dom) return;

      const canvas = dom.closest("[class*='overflow-auto']");
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const nodeRect = dom.getBoundingClientRect();

      setPosition({
        top: nodeRect.top - canvasRect.top + canvas.scrollTop - 44,
        left: nodeRect.left - canvasRect.left + canvas.scrollLeft + nodeRect.width / 2,
      });
    };

    updatePosition();
    const interval = setInterval(updatePosition, 100);
    return () => clearInterval(interval);
  }, [selected, query]);

  const handleMoveUp = useCallback(() => {
    if (!selected) return;
    const node = query.node(selected.id).get();
    const parent = node.data.parent;
    if (!parent) return;
    const parentNode = query.node(parent).get();
    const siblings = parentNode.data.nodes;
    const idx = siblings.indexOf(selected.id);
    if (idx > 0) {
      actions.move(selected.id, parent, idx - 1);
    }
  }, [selected, actions, query]);

  const handleMoveDown = useCallback(() => {
    if (!selected) return;
    const node = query.node(selected.id).get();
    const parent = node.data.parent;
    if (!parent) return;
    const parentNode = query.node(parent).get();
    const siblings = parentNode.data.nodes;
    const idx = siblings.indexOf(selected.id);
    if (idx < siblings.length - 1) {
      actions.move(selected.id, parent, idx + 2);
    }
  }, [selected, actions, query]);

  const handleDuplicate = useCallback(() => {
    if (!selected) return;
    const node = query.node(selected.id).get();
    const parent = node.data.parent;
    if (!parent) return;
    const parentNode = query.node(parent).get();
    const siblings = parentNode.data.nodes;
    const idx = siblings.indexOf(selected.id);

    const tree = query.node(selected.id).toSerializedNode();
    const freshNode = query.parseSerializedNode(tree).toNode();
    actions.add(freshNode, parent, idx + 1);
  }, [selected, actions, query]);

  const handleDelete = useCallback(() => {
    if (!selected) return;
    try {
      const snapshot = query.serialize();
      const stack = getUndoStack();
      stack.push(snapshot);
      if (stack.length > 50) stack.shift();
    } catch {
      // ignore
    }
    actions.delete(selected.id);
  }, [selected, actions, query]);

  if (!selected || !position) return null;

  return (
    <>
      <div
        ref={toolbarRef}
        className="absolute z-50 flex items-center gap-0.5 bg-white rounded-lg shadow-lg border border-gray-200 px-1 py-1"
        style={{
          top: `${Math.max(0, position.top)}px`,
          left: `${position.left}px`,
          transform: "translateX(-50%)",
        }}
      >
        <span className="text-[10px] font-medium text-gray-500 px-2">{selected.name}</span>
        <div className="w-px h-4 bg-gray-200" />

        <ToolbarButton onClick={handleMoveUp} title="Move Up">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={handleMoveDown} title="Move Down">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={handleDuplicate} title="Duplicate">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </ToolbarButton>

        {selected.settings && (
          <ToolbarButton onClick={() => setShowSettings(!showSettings)} title="Settings" active={showSettings}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </ToolbarButton>
        )}

        {selected.isDeletable && (
          <>
            <div className="w-px h-4 bg-gray-200" />
            <ToolbarButton onClick={handleDelete} title="Delete" destructive>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </ToolbarButton>
          </>
        )}
      </div>

      {showSettings && selected.settings && (
        <SettingsPopover
          settings={selected.settings}
          position={position}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
  active,
  destructive,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        destructive
          ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
          : active
          ? "text-[#29BDD6] bg-[#29BDD6]/10"
          : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
