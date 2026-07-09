export interface ComponentSchema {
  resolvedName: string;
  isCanvas: boolean;
  description: string;
  props: Array<{
    name: string;
    type: string;
    default: unknown;
    description?: string;
  }>;
}

export const componentSchemas: ComponentSchema[] = [
  {
    resolvedName: "CraftText",
    isCanvas: true,
    description: "Rich text block. The `text` prop accepts an HTML string.",
    props: [
      { name: "text", type: "string (HTML)", default: "<p>Edit me</p>" },
      { name: "fontSize", type: "number", default: 16 },
      { name: "textAlign", type: '"left" | "center" | "right"', default: "left" },
      { name: "color", type: "string (hex/rgba)", default: "#ffffff" },
      { name: "width", type: "number", default: 400 },
      { name: "height", type: "number", default: 40 },
    ],
  },
  {
    resolvedName: "CraftContainer",
    isCanvas: true,
    description: "General-purpose container. Can hold child nodes. Use as sections, wrappers, etc.",
    props: [
      { name: "backgroundColor", type: "string (hex/rgba)", default: "transparent" },
      { name: "backgroundImage", type: "string (URL)", default: "" },
      { name: "padding", type: "number", default: 20 },
      { name: "borderRadius", type: "number", default: 0 },
      { name: "borderColor", type: "string (hex/rgba)", default: "transparent" },
      { name: "borderWidth", type: "number", default: 0 },
      { name: "width", type: "number", default: 600 },
      { name: "minHeight", type: "number", default: 200 },
      { name: "alignItems", type: '"stretch" | "flex-start" | "center" | "flex-end"', default: undefined },
      { name: "gap", type: "number", default: 0 },
    ],
  },
  {
    resolvedName: "CraftRow",
    isCanvas: true,
    description: "Horizontal flex row. Children are laid out left-to-right.",
    props: [
      { name: "gap", type: "number", default: 16 },
      { name: "padding", type: "number", default: 0 },
      { name: "alignItems", type: '"flex-start" | "center" | "flex-end" | "stretch"', default: "stretch" },
      { name: "justifyContent", type: '"flex-start" | "center" | "flex-end" | "space-between" | "space-around"', default: "flex-start" },
      { name: "flexWrap", type: '"nowrap" | "wrap"', default: "wrap" },
      { name: "backgroundColor", type: "string (hex/rgba)", default: "transparent" },
      { name: "minHeight", type: "number", default: 60 },
    ],
  },
  {
    resolvedName: "CraftColumn",
    isCanvas: true,
    description: "Vertical flex column. Use inside CraftRow for multi-column layouts.",
    props: [
      { name: "width", type: 'string (e.g. "50%", "auto")', default: "50%" },
      { name: "minWidth", type: "number", default: 0 },
      { name: "padding", type: "number", default: 12 },
      { name: "backgroundColor", type: "string (hex/rgba)", default: "transparent" },
      { name: "alignItems", type: '"flex-start" | "center" | "flex-end" | "stretch"', default: "stretch" },
      { name: "justifyContent", type: '"flex-start" | "center" | "flex-end" | "space-between"', default: "flex-start" },
      { name: "gap", type: "number", default: 8 },
    ],
  },
  {
    resolvedName: "CraftImage",
    isCanvas: false,
    description: "Image element. Provide a URL in `src`.",
    props: [
      { name: "src", type: "string (URL)", default: "" },
      { name: "alt", type: "string", default: "" },
      { name: "width", type: "number", default: 400 },
      { name: "height", type: "number", default: 300 },
      { name: "borderRadius", type: "number", default: 0 },
      { name: "objectFit", type: '"cover" | "contain" | "fill"', default: "cover" },
    ],
  },
  {
    resolvedName: "CraftButton",
    isCanvas: false,
    description: "Button element with link.",
    props: [
      { name: "text", type: "string", default: "Click Me" },
      { name: "link", type: "string (URL)", default: "#" },
      { name: "bgColor", type: "string (hex/rgba)", default: "#29BDD6" },
      { name: "textColor", type: "string (hex/rgba)", default: "#ffffff" },
      { name: "fontSize", type: "number", default: 16 },
      { name: "paddingX", type: "number", default: 32 },
      { name: "paddingY", type: "number", default: 16 },
      { name: "borderRadius", type: "number", default: 12 },
      { name: "width", type: "number", default: 200 },
    ],
  },
  {
    resolvedName: "CraftHeader",
    isCanvas: true,
    description: "Site header/navigation bar.",
    props: [
      { name: "backgroundColor", type: "string (hex/rgba)", default: "#0f2744" },
      { name: "textColor", type: "string (hex/rgba)", default: "#ffffff" },
      { name: "logoText", type: "string", default: "" },
      { name: "height", type: "number", default: 56 },
      { name: "sticky", type: "boolean", default: false },
    ],
  },
  {
    resolvedName: "CraftFooter",
    isCanvas: true,
    description: "Site footer section. Persistent across all pages. Cannot be deleted. Contains child nodes for footer content (text, links, social icons, etc.).",
    props: [
      { name: "backgroundColor", type: "string (hex/rgba)", default: "#0a1e38" },
      { name: "padding", type: "number", default: 48 },
      { name: "width", type: "number", default: 1200 },
      { name: "minHeight", type: "number", default: 100 },
      { name: "borderTopColor", type: "string (hex/rgba)", default: "rgba(255,255,255,0.1)" },
      { name: "borderTopWidth", type: "number", default: 1 },
    ],
  },
  {
    resolvedName: "CraftSpacer",
    isCanvas: true,
    description: "Vertical spacer. Used to add vertical spacing between elements.",
    props: [
      { name: "height", type: "number", default: 40 },
    ],
  },
  {
    resolvedName: "CraftDivider",
    isCanvas: true,
    description: "Horizontal line divider.",
    props: [
      { name: "color", type: "string (hex/rgba)", default: "#ffffff20" },
      { name: "thickness", type: "number", default: 1 },
      { name: "widthPercent", type: "number (0-100)", default: 100 },
      { name: "marginY", type: "number", default: 16 },
    ],
  },
  {
    resolvedName: "CraftVideo",
    isCanvas: false,
    description: "Embedded video player (iframe).",
    props: [
      { name: "url", type: "string (URL)", default: "" },
      { name: "width", type: "number", default: 560 },
      { name: "height", type: "number", default: 315 },
    ],
  },
  {
    resolvedName: "CraftEmbed",
    isCanvas: true,
    description: "Generic embed (iframe) for Google services or custom URLs.",
    props: [
      { name: "embedType", type: '"calendar" | "map" | "docs" | "slides" | "sheets" | "forms" | "charts" | "custom"', default: "custom" },
      { name: "url", type: "string (URL)", default: "" },
      { name: "width", type: "number", default: 600 },
      { name: "height", type: "number", default: 400 },
      { name: "borderRadius", type: "number", default: 4 },
    ],
  },
  {
    resolvedName: "CraftSocialLinks",
    isCanvas: true,
    description: "Row of social media icon links.",
    props: [
      { name: "links", type: 'Array<{ platform: string; url: string }>', default: [{ platform: "facebook", url: "" }, { platform: "instagram", url: "" }, { platform: "x", url: "" }, { platform: "youtube", url: "" }] },
      { name: "iconSize", type: "number", default: 24 },
      { name: "iconColor", type: "string (hex/rgba)", default: "#ffffff" },
      { name: "gap", type: "number", default: 16 },
      { name: "alignment", type: '"left" | "center" | "right"', default: "center" },
    ],
  },
  {
    resolvedName: "CraftMap",
    isCanvas: false,
    description: "Embedded Google Map by address.",
    props: [
      { name: "address", type: "string", default: "" },
      { name: "width", type: "number", default: 600 },
      { name: "height", type: "number", default: 400 },
      { name: "zoom", type: "number", default: 14 },
      { name: "borderRadius", type: "number", default: 8 },
    ],
  },
  {
    resolvedName: "CraftYouTube",
    isCanvas: false,
    description: "Embedded YouTube video player.",
    props: [
      { name: "url", type: "string (YouTube URL)", default: "" },
      { name: "width", type: "number", default: 600 },
      { name: "height", type: "number", default: 340 },
      { name: "borderRadius", type: "number", default: 8 },
    ],
  },
  {
    resolvedName: "CraftCarousel",
    isCanvas: false,
    description: "Image carousel/slideshow.",
    props: [
      { name: "images", type: "string[] (URLs)", default: [] },
      { name: "width", type: "number", default: 600 },
      { name: "height", type: "number", default: 400 },
      { name: "borderRadius", type: "number", default: 8 },
      { name: "autoPlay", type: "boolean", default: false },
      { name: "interval", type: "number (ms)", default: 5000 },
    ],
  },
  {
    resolvedName: "CraftIcon",
    isCanvas: false,
    description: "Icon element using Lucide icons. Renders an icon inside an optional circular background.",
    props: [
      { name: "icon", type: "string (icon name)", default: "star", description: "Available icons: megaphone, book-open, users, globe, heart, shield, eye-off, star, target, zap, award, crown, flame, handshake, church, cross, lightbulb, message-circle, music, send, trending-up, compass, flag, gift, hand-heart, layers, map, mic, rocket, sprout, sun" },
      { name: "size", type: "number", default: 28 },
      { name: "color", type: "string (hex/rgba)", default: "#06b6d4" },
      { name: "strokeWidth", type: "number", default: 1.5 },
      { name: "backgroundColor", type: "string (hex/rgba)", default: "#06b6d41a" },
      { name: "backgroundSize", type: "number", default: 56 },
      { name: "borderRadius", type: "number", default: 9999, description: "9999 for circle" },
    ],
  },
  {
    resolvedName: "CraftEventTitle",
    isCanvas: false,
    description: "Displays the event title dynamically from event data.",
    props: [
      { name: "fontSize", type: "number", default: 48 },
      { name: "color", type: "string (hex/rgba)", default: "#ffffff" },
      { name: "textAlign", type: '"left" | "center" | "right"', default: "center" },
    ],
  },
  {
    resolvedName: "CraftEventDates",
    isCanvas: false,
    description: "Displays event dates dynamically from event data.",
    props: [
      { name: "fontSize", type: "number", default: 16 },
      { name: "color", type: "string (hex/rgba)", default: "#d1d5db" },
      { name: "textAlign", type: '"left" | "center" | "right"', default: "center" },
    ],
  },
  {
    resolvedName: "CraftEventLocation",
    isCanvas: false,
    description: "Displays event location dynamically from event data.",
    props: [
      { name: "fontSize", type: "number", default: 16 },
      { name: "color", type: "string (hex/rgba)", default: "#d1d5db" },
      { name: "textAlign", type: '"left" | "center" | "right"', default: "center" },
    ],
  },
  {
    resolvedName: "CraftRegisterButton",
    isCanvas: false,
    description: "Registration button linked to the event registration form.",
    props: [
      { name: "text", type: "string", default: "Register Now" },
      { name: "bgColor", type: "string (hex/rgba)", default: "#29BDD6" },
      { name: "textColor", type: "string (hex/rgba)", default: "#ffffff" },
      { name: "fontSize", type: "number", default: 18 },
      { name: "paddingX", type: "number", default: 32 },
      { name: "paddingY", type: "number", default: 16 },
      { name: "borderRadius", type: "number", default: 12 },
    ],
  },
  {
    resolvedName: "CraftRegistrationForm",
    isCanvas: false,
    description: "Inline registration form. Reads field config from event registration_config. Style-only props.",
    props: [
      { name: "backgroundColor", type: "string (hex/rgba)", default: "#ffffff" },
      { name: "textColor", type: "string (hex/rgba)", default: "#111827" },
      { name: "labelColor", type: "string (hex/rgba)", default: "#374151" },
      { name: "buttonBgColor", type: "string (hex/rgba)", default: "#29BDD6" },
      { name: "buttonTextColor", type: "string (hex/rgba)", default: "#ffffff" },
      { name: "borderRadius", type: "number", default: 12 },
      { name: "padding", type: "number", default: 32 },
      { name: "width", type: "number", default: 500 },
    ],
  },
];

export function buildSchemaReference(): string {
  let output = "## Available Components\n\n";
  for (const schema of componentSchemas) {
    output += `### ${schema.resolvedName}${schema.isCanvas ? " (canvas - can have children)" : ""}\n`;
    output += `${schema.description}\n`;
    output += `Props:\n`;
    for (const prop of schema.props) {
      const defaultStr = prop.default === undefined ? "undefined" : JSON.stringify(prop.default);
      output += `  - ${prop.name}: ${prop.type} (default: ${defaultStr})\n`;
    }
    output += "\n";
  }
  return output;
}
