"use client";

import { useNode, useEditor, type UserComponent } from "@craftjs/core";
import { craftRef } from "@/features/events/builder/craft-utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface ColumnsProps {
  ratio?: "50-50" | "60-40" | "40-60" | "70-30" | "30-70";
  gap?: number;
  children?: ReactNode;
}

const RATIOS: Record<string, [string, string]> = {
  "50-50": ["50%", "50%"],
  "60-40": ["60%", "40%"],
  "40-60": ["40%", "60%"],
  "70-30": ["70%", "30%"],
  "30-70": ["30%", "70%"],
};

export const EmailColumns: UserComponent<ColumnsProps> = ({
  ratio = "50-50",
  gap = 16,
  children,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    id,
    linkedNodes,
  } = useNode((state) => ({
    selected: state.events.selected,
    linkedNodes: state.data.linkedNodes,
  }));

  const { actions: editorActions } = useEditor();

  // Sync ratio widths to child cells when ratio changes
  useEffect(() => {
    if (!linkedNodes) return;
    const widths = RATIOS[ratio] || RATIOS["50-50"];
    const cellIds = Object.values(linkedNodes);
    cellIds.forEach((cellId, i) => {
      try {
        editorActions.setProp(cellId, (p: ColumnCellProps) => {
          p.widthPercent = widths[i] || widths[0];
        });
      } catch {
        // Cell may not exist yet during initialization
      }
    });
  }, [ratio, linkedNodes, editorActions]);

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        cursor: "grab",
        outline: selected ? "2px solid #2563eb" : "1px dashed transparent",
        outlineOffset: "2px",
      }}
    >
      {/* Using table for email compatibility */}
      <table
        cellPadding="0"
        cellSpacing={gap > 0 ? String(gap / 2) : "0"}
        style={{ width: "100%", borderCollapse: gap > 0 ? "separate" : "collapse" }}
      >
        <tbody>
          <tr>
            {children}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

interface ColumnCellProps {
  widthPercent?: string;
  padding?: number;
  children?: ReactNode;
}

export const EmailColumnCell: UserComponent<ColumnCellProps> = ({
  widthPercent = "50%",
  padding = 8,
  children,
}) => {
  const {
    connectors: { connect },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <td
      ref={craftRef(connect)}
      style={{
        width: widthPercent,
        verticalAlign: "top",
        padding: `${padding}px`,
        outline: selected ? "1px dashed #2563eb" : "none",
      }}
    >
      {children}
    </td>
  );
};

function ColumnsSettings() {
  const {
    actions: { setProp },
    ratio,
    gap,
  } = useNode((node) => ({
    ratio: node.data.props.ratio as string,
    gap: node.data.props.gap as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Column Ratio</Label>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {Object.keys(RATIOS).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={ratio === r ? "default" : "outline"}
              onClick={() => setProp((p: ColumnsProps) => { p.ratio = r as ColumnsProps["ratio"]; })}
              className="text-xs"
            >
              {r}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <Label>Gap (px)</Label>
        <input
          type="number"
          min={0}
          max={32}
          value={gap}
          onChange={(e) => setProp((p: ColumnsProps) => { p.gap = Number(e.target.value); })}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}

function ColumnCellSettings() {
  const {
    actions: { setProp },
    padding,
  } = useNode((node) => ({
    padding: node.data.props.padding as number,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Padding (px)</Label>
        <input
          type="number"
          min={0}
          max={40}
          value={padding}
          onChange={(e) => setProp((p: ColumnCellProps) => { p.padding = Number(e.target.value); })}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}

EmailColumns.craft = {
  displayName: "Columns",
  props: {
    ratio: "50-50",
    gap: 16,
  },
  related: {
    settings: ColumnsSettings,
  },
  rules: {
    canDrag: () => true,
  },
};

EmailColumnCell.craft = {
  displayName: "Column",
  props: {
    widthPercent: "50%",
    padding: 8,
  },
  related: {
    settings: ColumnCellSettings,
  },
  rules: {
    canDrag: () => false,
    canMoveIn: () => true,
  },
};
