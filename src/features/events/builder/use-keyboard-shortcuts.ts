"use client";

import { useEffect, useCallback, useRef } from "react";
import { useEditor } from "@craftjs/core";
import type { Node } from "@craftjs/core";
import { toast } from "sonner";

// Store just the node ID on copy — re-serialize fresh at paste time
let copiedNodeId: string | null = null;

const MAX_UNDO_STACK = 50;

// Shared undo stack — accessible by element-toolbar for delete undo
const undoStack: string[] = [];

export function getUndoStack() {
  return undoStack;
}

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  return false;
}

/**
 * Clone an entire node subtree (including children) with fresh IDs.
 * Returns a NodeTree suitable for actions.addNodeTree().
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cloneSubtree(query: any, nodeId: string) {
  // Get full subtree with all child nodes
  const tree = query.node(nodeId).toNodeTree("childNodes");
  const oldToNew = new Map<string, string>();
  const newNodes: Record<string, Node> = {};

  // First pass: serialize each node and create fresh copies with new IDs
  for (const oldId of Object.keys(tree.nodes)) {
    const serialized = query.node(oldId).toSerializedNode();
    const freshNode = query.parseSerializedNode(serialized).toNode();
    oldToNew.set(oldId, freshNode.id);
    newNodes[freshNode.id] = freshNode;
  }

  // Second pass: remap child and linked node references to new IDs
  for (const node of Object.values(newNodes)) {
    node.data.nodes = node.data.nodes.map(
      (childId: string) => oldToNew.get(childId) ?? childId
    );
    if (node.data.linkedNodes) {
      const remapped: Record<string, string> = {};
      for (const [key, linkedId] of Object.entries(node.data.linkedNodes)) {
        remapped[key] = oldToNew.get(linkedId as string) ?? (linkedId as string);
      }
      node.data.linkedNodes = remapped;
    }
  }

  return {
    rootNodeId: oldToNew.get(tree.rootNodeId)!,
    nodes: newNodes,
  };
}

// Flag to skip snapshot during undo/deserialize operations
let isUndoing = false;

export function useBuilderKeyboardShortcuts() {
  const { actions, query } = useEditor();
  const lastSnapshotRef = useRef<string>("");

  const pushUndo = useCallback(() => {
    try {
      const snapshot = query.serialize();
      undoStack.push(snapshot);
      if (undoStack.length > MAX_UNDO_STACK) {
        undoStack.shift();
      }
    } catch {
      // Ignore serialization errors
    }
  }, [query]);

  // Auto-capture undo snapshots on state changes (debounced)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (isUndoing) return;
      try {
        const current = query.serialize();
        if (current !== lastSnapshotRef.current) {
          // State changed — push the previous state (before the change) to undo stack
          if (lastSnapshotRef.current) {
            undoStack.push(lastSnapshotRef.current);
            if (undoStack.length > MAX_UNDO_STACK) {
              undoStack.shift();
            }
          }
          lastSnapshotRef.current = current;
        }
      } catch {
        // Ignore serialization errors
      }
    }, 1000);

    // Capture initial state
    try {
      lastSnapshotRef.current = query.serialize();
    } catch {
      // Ignore
    }

    return () => clearInterval(checkInterval);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Delete/Backspace — no modifier required
      if (e.key === "Delete" || e.key === "Backspace") {
        if (isEditableTarget(e.target)) return;

        let selectedId: string | undefined;
        try {
          selectedId = query.getEvent("selected").last();
        } catch {
          return;
        }
        if (!selectedId) return;

        try {
          const node = query.node(selectedId).get();
          if (!node.data.parent) return; // Don't delete ROOT
          const resolvedName = (node.data.type as { resolvedName?: string })?.resolvedName;
          if (resolvedName === "CraftFooter") return; // Don't delete footer
        } catch {
          return;
        }

        e.preventDefault();
        pushUndo();
        try {
          actions.delete(selectedId);
          toast("Element deleted", { duration: 1500 });
        } catch (err) {
          console.error("[builder-shortcuts] delete failed:", err);
        }
        return;
      }

      if (!(e.metaKey || e.ctrlKey)) return;
      if (isEditableTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (key === "c") {
        let selectedId: string | undefined;
        try {
          selectedId = query.getEvent("selected").last();
        } catch {
          return;
        }
        if (!selectedId) return;

        try {
          const node = query.node(selectedId).get();
          if (!node.data.parent) return; // Don't copy ROOT
          copiedNodeId = selectedId;
          e.preventDefault();
          toast("Element copied", { duration: 1500 });
        } catch (err) {
          console.error("[builder-shortcuts] copy failed:", err);
        }
      } else if (key === "v") {
        if (!copiedNodeId) return;

        // Verify copied node still exists
        let sourceNode;
        try {
          sourceNode = query.node(copiedNodeId).get();
        } catch {
          copiedNodeId = null;
          return;
        }
        if (!sourceNode?.data?.parent) {
          copiedNodeId = null;
          return;
        }

        e.preventDefault();
        pushUndo();

        try {
          const sourceParent = sourceNode.data.parent;
          let parentId = sourceParent;
          let insertIndex: number | undefined;

          // If something else is selected, paste after it
          let selectedId: string | undefined;
          try {
            selectedId = query.getEvent("selected").last();
          } catch {
            // No selection
          }

          if (selectedId && selectedId !== copiedNodeId) {
            try {
              const selectedNode = query.node(selectedId).get();
              if (selectedNode?.data?.parent) {
                parentId = selectedNode.data.parent;
                const parentNode = query.node(parentId).get();
                if (parentNode?.data?.nodes) {
                  const siblings = parentNode.data.nodes;
                  const idx = siblings.indexOf(selectedId);
                  insertIndex = idx + 1;
                }
              }
            } catch {
              parentId = sourceParent;
            }
          } else {
            // Paste after the copied node
            try {
              const parentNode = query.node(sourceParent).get();
              if (parentNode?.data?.nodes) {
                const siblings = parentNode.data.nodes;
                const idx = siblings.indexOf(copiedNodeId);
                insertIndex = idx + 1;
              }
            } catch {
              // just append
            }
          }

          // Clone full subtree (handles containers with children)
          const clonedTree = cloneSubtree(query, copiedNodeId);
          actions.addNodeTree(clonedTree, parentId, insertIndex);
          toast("Element pasted", { duration: 1500 });
        } catch (err) {
          console.error("[builder-shortcuts] paste failed:", err);
          toast.error("Paste failed", { duration: 2000 });
        }
      } else if (key === "z" && !e.shiftKey) {
        if (undoStack.length === 0) return;

        e.preventDefault();
        const snapshot = undoStack.pop()!;
        try {
          isUndoing = true;
          actions.deserialize(snapshot);
          lastSnapshotRef.current = snapshot;
          toast("Undone", { duration: 1500 });
        } catch (err) {
          console.error("[builder-shortcuts] undo failed:", err);
        } finally {
          // Delay reset so the interval doesn't capture this as a new change
          setTimeout(() => { isUndoing = false; }, 200);
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [actions, query, pushUndo]);

  return { pushUndo };
}
