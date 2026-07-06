import type { AIOperation } from "@/shared/utils/ai/types";
import { componentSchemas } from "./craft-schema";

const validResolvedNames = new Set(componentSchemas.map((s) => s.resolvedName));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CraftActions = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CraftQuery = any;

export function validateCraftJson(json: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!json.ROOT) {
    errors.push("Missing ROOT node");
    return { valid: false, errors };
  }

  const root = json.ROOT as Record<string, unknown>;
  if (!root.type || !(root.type as Record<string, unknown>).resolvedName) {
    errors.push("ROOT node missing type.resolvedName");
  }
  if (!root.isCanvas) {
    errors.push("ROOT node must be a canvas (isCanvas: true)");
  }
  if (!Array.isArray(root.nodes)) {
    errors.push("ROOT node missing nodes array");
  }

  // Validate all nodes
  for (const [nodeId, node] of Object.entries(json)) {
    if (nodeId === "ROOT") continue;
    const n = node as Record<string, unknown>;

    if (!n.type || !(n.type as Record<string, unknown>).resolvedName) {
      errors.push(`Node "${nodeId}" missing type.resolvedName`);
      continue;
    }

    const resolvedName = (n.type as Record<string, unknown>).resolvedName as string;
    if (!validResolvedNames.has(resolvedName)) {
      errors.push(`Node "${nodeId}" has unknown component: ${resolvedName}`);
    }

    if (!n.parent) {
      errors.push(`Node "${nodeId}" missing parent reference`);
    }

    if (!Array.isArray(n.nodes)) {
      errors.push(`Node "${nodeId}" missing nodes array`);
    }
  }

  // Validate parent-child consistency
  const rootNodes = (root.nodes as string[]) || [];
  for (const childId of rootNodes) {
    if (!json[childId]) {
      errors.push(`ROOT references child "${childId}" which doesn't exist`);
    }
  }

  for (const [nodeId, node] of Object.entries(json)) {
    if (nodeId === "ROOT") continue;
    const n = node as Record<string, unknown>;
    const childNodes = (n.nodes as string[]) || [];
    for (const childId of childNodes) {
      if (!json[childId]) {
        errors.push(`Node "${nodeId}" references child "${childId}" which doesn't exist`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// Map resolvedName → expected isCanvas value from the schema
const canvasComponentNames = new Set(
  componentSchemas.filter((s) => s.isCanvas).map((s) => s.resolvedName)
);

/**
 * Sanitize AI-generated JSON to fix common structural issues before deserialization.
 * Craft.js is strict about node structure — missing fields cause silent crashes.
 */
function sanitizeCraftJson(json: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [nodeId, rawNode] of Object.entries(json)) {
    const node = { ...(rawNode as Record<string, unknown>) };
    const typeDef = node.type as Record<string, unknown> | undefined;
    const resolvedName = typeDef?.resolvedName as string | undefined;

    // Ensure linkedNodes exists
    if (!node.linkedNodes) {
      node.linkedNodes = {};
    }

    // Ensure nodes is an array
    if (!Array.isArray(node.nodes)) {
      node.nodes = [];
    }

    // Fix isCanvas based on schema (AI often gets this wrong)
    if (resolvedName && nodeId !== "ROOT") {
      node.isCanvas = canvasComponentNames.has(resolvedName);
    }

    // Non-canvas nodes must not have children
    if (!node.isCanvas && Array.isArray(node.nodes) && (node.nodes as string[]).length > 0) {
      node.nodes = [];
    }

    sanitized[nodeId] = node;
  }

  // Remove child references to nodes that don't exist
  for (const [, rawNode] of Object.entries(sanitized)) {
    const node = rawNode as Record<string, unknown>;
    if (Array.isArray(node.nodes)) {
      node.nodes = (node.nodes as string[]).filter((childId) => sanitized[childId]);
    }
  }

  // Fix parent references — ensure every non-ROOT node points to a valid parent
  for (const [nodeId, rawNode] of Object.entries(sanitized)) {
    if (nodeId === "ROOT") continue;
    const node = rawNode as Record<string, unknown>;
    if (node.parent && !sanitized[node.parent as string]) {
      node.parent = "ROOT";
    }
  }

  return sanitized;
}

export function applyFullPageGeneration(
  actions: CraftActions,
  pageJson: Record<string, unknown>
): { success: boolean; error?: string } {
  const sanitized = sanitizeCraftJson(pageJson);
  const { valid, errors } = validateCraftJson(sanitized);
  if (!valid) {
    return { success: false, error: `Invalid JSON: ${errors.join(", ")}` };
  }

  try {
    console.log("[AI] Sanitized JSON node types:", Object.entries(sanitized).map(([id, n]) => {
      const node = n as Record<string, unknown>;
      const t = node.type as Record<string, unknown> | undefined;
      return `${id}: ${t?.resolvedName} (isCanvas: ${node.isCanvas}, children: ${(node.nodes as string[])?.length ?? 0})`;
    }));
    actions.deserialize(JSON.stringify(sanitized));
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to deserialize";
    console.error("[AI] Deserialize failed:", msg, err);
    return { success: false, error: msg };
  }
}

export function applyNodeEdits(
  actions: CraftActions,
  edits: Array<{ nodeId: string; props: Record<string, unknown> }>,
  query?: CraftQuery
): { success: boolean; error?: string } {
  try {
    const nodes = query ? query.getState().nodes : null;
    const errors: string[] = [];

    if (nodes) {
      console.log(`[AI] Canvas has ${Object.keys(nodes).length} nodes:`, Object.keys(nodes));
    }

    for (const edit of edits) {
      let targetId = edit.nodeId;

      // Check if node exists; if not, try to find by component type hint
      if (nodes && !nodes[targetId]) {
        console.log(`[AI] Node "${targetId}" not found, searching by name pattern...`);
        const matched = findNodeByHint(nodes, targetId);
        if (matched) {
          console.log(`[AI] Matched "${targetId}" → "${matched}"`);
          targetId = matched;
        } else {
          errors.push(`Node "${targetId}" not found in canvas`);
          continue;
        }
      }

      // Log the node's current props before editing
      if (nodes && nodes[targetId]) {
        const n = nodes[targetId] as any;
        console.log(`[AI] Node "${targetId}" type:`, n?.data?.type?.resolvedName, "current props:", n?.data?.props);
      }

      actions.setProp(targetId, (currentProps: Record<string, unknown>) => {
        for (const [key, value] of Object.entries(edit.props)) {
          currentProps[key] = value;
        }
      });
      console.log(`[AI] Set props on "${targetId}":`, edit.props);
    }

    if (errors.length > 0) {
      return { success: false, error: errors.join("; ") };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to apply edits",
    };
  }
}

function findNodeByHint(nodes: Record<string, unknown>, hint: string): string | null {
  const hintLower = hint.toLowerCase();
  // Map common hint patterns to resolvedNames
  const typeHints: Record<string, string> = {
    hero: "CraftContainer",
    header: "CraftHeader",
    title: "CraftEventTitle",
    button: "CraftButton",
    register: "CraftRegisterButton",
    text: "CraftText",
    image: "CraftImage",
    spacer: "CraftSpacer",
    row: "CraftRow",
    column: "CraftColumn",
    icon: "CraftIcon",
    map: "CraftMap",
    youtube: "CraftYouTube",
    dates: "CraftEventDates",
    location: "CraftEventLocation",
  };

  // Find the best matching resolvedName
  let targetType: string | null = null;
  for (const [pattern, type] of Object.entries(typeHints)) {
    if (hintLower.includes(pattern)) {
      targetType = type;
      break;
    }
  }

  if (!targetType) return null;

  // Get ROOT's direct children for priority matching
  const rootNode = nodes["ROOT"] as any;
  const rootChildIds: string[] = rootNode?.data?.nodes || [];

  // Prefer ROOT's direct children (these are "sections")
  for (const childId of rootChildIds) {
    const n = nodes[childId] as any;
    if (n?.data?.type?.resolvedName === targetType) {
      return childId;
    }
  }

  // Fallback: search all nodes except ROOT itself
  for (const [nodeId, node] of Object.entries(nodes)) {
    if (nodeId === "ROOT") continue;
    const n = node as any;
    if (n?.data?.type?.resolvedName === targetType) {
      return nodeId;
    }
  }
  return null;
}

export function applyAddNodes(
  actions: CraftActions,
  query: CraftQuery,
  data: { parentId: string; index?: number; nodes: Record<string, unknown> }
): { success: boolean; error?: string } {
  try {
    // Build a tree structure for Craft.js to parse
    const nodeEntries = Object.entries(data.nodes);
    for (const [, nodeData] of nodeEntries) {
      const parsed = query.parseSerializedNode(nodeData);
      const node = parsed.toNode();
      actions.add(node, data.parentId, data.index);
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add nodes",
    };
  }
}

export function getCanvasSnapshot(query: CraftQuery): string {
  return query.serialize();
}
