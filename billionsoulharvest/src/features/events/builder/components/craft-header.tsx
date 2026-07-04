"use client";

import { useNode } from "@craftjs/core";
import { useEventData } from "../event-context";
import { usePageContext } from "../page-context";

interface CraftHeaderProps {
  backgroundColor?: string;
  textColor?: string;
  logoText?: string;
  height?: number;
  sticky?: boolean;
}

export function CraftHeader({
  backgroundColor = "#0f2744",
  textColor = "#ffffff",
  logoText = "",
  height = 56,
  sticky = false,
}: CraftHeaderProps) {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));
  const event = useEventData();
  const { pages } = usePageContext();

  const displayLogo = logoText || event.title;

  return (
    <header
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full flex items-center px-4 sm:px-6 overflow-hidden ${selected ? "outline outline-2 outline-blue-400" : ""}`}
      style={{
        backgroundColor,
        height: `${height}px`,
        position: sticky ? "sticky" : "relative",
        top: sticky ? 0 : undefined,
        zIndex: sticky ? 50 : undefined,
      }}
    >
      {/* Logo / Title */}
      <span
        className="font-bold text-sm sm:text-base truncate mr-6"
        style={{ color: textColor }}
      >
        {displayLogo}
      </span>

      {/* Nav Links — auto-generated from actual pages */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        <span
          className="px-3 py-1.5 rounded-lg text-sm font-medium cursor-default"
          style={{ color: textColor, opacity: 0.7 }}
        >
          Home
        </span>
        {pages.map((page) => (
          <span
            key={page.id}
            className="px-3 py-1.5 rounded-lg text-sm font-medium cursor-default"
            style={{ color: textColor, opacity: 0.7 }}
          >
            {page.title}
          </span>
        ))}
      </nav>

    </header>
  );
}

function CraftHeaderSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as CraftHeaderProps,
  }));

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">Logo Text</label>
        <input
          type="text"
          value={props.logoText ?? ""}
          placeholder="Event title (default)"
          onChange={(e) => setProp((p: CraftHeaderProps) => { p.logoText = e.target.value; })}
          className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
        />
      </div>

      <div className="bg-gray-50 rounded-md p-2">
        <p className="text-[10px] text-gray-500">Nav links are auto-generated from your pages. Add pages in the Pages tab.</p>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.backgroundColor ?? "#0f2744"}
            onChange={(e) => setProp((p: CraftHeaderProps) => { p.backgroundColor = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
          />
          <input
            type="text"
            value={props.backgroundColor ?? "#0f2744"}
            onChange={(e) => setProp((p: CraftHeaderProps) => { p.backgroundColor = e.target.value; })}
            className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1.5"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">Text Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.textColor ?? "#ffffff"}
            onChange={(e) => setProp((p: CraftHeaderProps) => { p.textColor = e.target.value; })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
          />
          <input
            type="text"
            value={props.textColor ?? "#ffffff"}
            onChange={(e) => setProp((p: CraftHeaderProps) => { p.textColor = e.target.value; })}
            className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1.5"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">
          Height ({props.height ?? 56}px)
        </label>
        <input
          type="range"
          min={40}
          max={100}
          value={props.height ?? 56}
          onChange={(e) => setProp((p: CraftHeaderProps) => { p.height = parseInt(e.target.value); })}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="header-sticky"
          checked={props.sticky ?? false}
          onChange={(e) => setProp((p: CraftHeaderProps) => { p.sticky = e.target.checked; })}
          className="rounded"
        />
        <label htmlFor="header-sticky" className="text-xs font-medium text-gray-700">Sticky header</label>
      </div>

    </div>
  );
}

CraftHeader.craft = {
  displayName: "Header",
  props: {
    backgroundColor: "#0f2744",
    textColor: "#ffffff",
    logoText: "",
    height: 56,
    sticky: false,
  },
  related: { settings: CraftHeaderSettings },
};
