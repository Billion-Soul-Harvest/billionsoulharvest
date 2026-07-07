"use client";

import { useEditor } from "@craftjs/core";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsPanel() {
  const { selected, actions, query } = useEditor((state, query) => {
    const currentNodeId = query.getEvent("selected").last();
    let selected: {
      id: string;
      name: string;
      settings: React.ComponentType | undefined;
      isDeletable: boolean;
    } | null = null;

    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      if (node) {
        selected = {
          id: currentNodeId,
          name: node.data.displayName || node.data.type?.toString() || "Element",
          settings: node.related?.settings as React.ComponentType | undefined,
          isDeletable: query.node(currentNodeId).isDeletable(),
        };
      }
    }

    return { selected };
  });

  if (!selected) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        <p>Click an element to edit its settings</p>
      </div>
    );
  }

  const SettingsComponent = selected.settings;

  const handleMoveUp = () => {
    const node = query.node(selected!.id).get();
    const parent = node.data.parent;
    if (!parent) return;
    const siblings = query.node(parent).get().data.nodes || [];
    const idx = siblings.indexOf(selected!.id);
    if (idx > 0) {
      actions.move(selected!.id, parent, idx - 1);
    }
  };

  const handleMoveDown = () => {
    const node = query.node(selected!.id).get();
    const parent = node.data.parent;
    if (!parent) return;
    const siblings = query.node(parent).get().data.nodes || [];
    const idx = siblings.indexOf(selected!.id);
    if (idx < siblings.length - 1) {
      actions.move(selected!.id, parent, idx + 2);
    }
  };

  const handleDelete = () => {
    if (selected!.isDeletable) {
      actions.delete(selected!.id);
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">{selected.name}</p>
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={handleMoveUp} title="Move up">
            <ArrowUp className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={handleMoveDown} title="Move down">
            <ArrowDown className="w-3.5 h-3.5" />
          </Button>
          {selected.isDeletable && (
            <Button size="icon-sm" variant="ghost" onClick={handleDelete} title="Delete" className="text-red-500 hover:text-red-700">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      {SettingsComponent && <SettingsComponent />}
    </div>
  );
}
