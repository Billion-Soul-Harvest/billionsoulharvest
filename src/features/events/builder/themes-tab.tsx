"use client";

import { useEditor } from "@craftjs/core";

interface ThemePreset {
  name: string;
  colors: string[];
  backgroundColor: string;
  textColor: string;
}

const themes: ThemePreset[] = [
  {
    name: "Default",
    colors: ["#0d223f", "#00b8d4", "#ffffff", "#44474d", "#a9edff"],
    backgroundColor: "#0d223f",
    textColor: "#ffffff",
  },
  {
    name: "Light",
    colors: ["#ffffff", "#1f2937", "#6b7280", "#e5e7eb", "#f9fafb"],
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
  },
  {
    name: "Warm",
    colors: ["#fef7ed", "#92400e", "#b45309", "#fbbf24", "#78350f"],
    backgroundColor: "#fef7ed",
    textColor: "#78350f",
  },
  {
    name: "Bold",
    colors: ["#000000", "#D4A843", "#ffffff", "#374151", "#1f2937"],
    backgroundColor: "#000000",
    textColor: "#ffffff",
  },
  {
    name: "Fresh",
    colors: ["#042f2e", "#14b8a6", "#ffffff", "#99f6e4", "#0d9488"],
    backgroundColor: "#042f2e",
    textColor: "#ffffff",
  },
];

export function ThemesTab() {
  const { actions, query } = useEditor();

  const applyTheme = (theme: ThemePreset) => {
    const rootNodeId = "ROOT";
    const rootNode = query.node(rootNodeId).get();
    if (!rootNode) return;

    actions.setProp(rootNodeId, (props: Record<string, unknown>) => {
      props.backgroundColor = theme.backgroundColor;
    });
  };

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Theme Presets</p>
      <div className="space-y-2">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => applyTheme(theme)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#29BDD6] hover:bg-[#29BDD6]/5 transition-colors text-left"
          >
            <div className="flex gap-0.5">
              {theme.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700">{theme.name}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center pt-2">
        Applies background color to the root container.
      </p>
    </div>
  );
}
