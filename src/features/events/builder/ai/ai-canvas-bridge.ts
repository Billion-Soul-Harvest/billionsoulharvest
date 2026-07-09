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
      console.warn(`[AI] Node "${nodeId}" has unknown component: ${resolvedName}, removing`);
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

    // Skip nodes with missing or invalid type (except ROOT which is always valid)
    if (nodeId !== "ROOT" && (!typeDef || !resolvedName)) {
      console.warn(`[AI] Removing node "${nodeId}" with missing type/resolvedName`);
      continue;
    }

    // Skip nodes with unknown component types (except ROOT)
    if (nodeId !== "ROOT" && resolvedName && !validResolvedNames.has(resolvedName)) {
      console.warn(`[AI] Removing node "${nodeId}" with unknown component: ${resolvedName}`);
      continue;
    }

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
    const raw = err instanceof Error ? err.message : "Failed to deserialize";
    console.error("[AI] Deserialize failed:", raw, err);
    return { success: false, error: "Failed to apply layout — the AI generated an invalid node structure. Try regenerating with a simpler prompt." };
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
  if (!data.nodes || typeof data.nodes !== "object") {
    return { success: false, error: "No valid nodes provided" };
  }

  // Fallback strategy: merge new nodes into the existing canvas JSON and deserialize the whole thing.
  // This is more reliable than using query.parseSerializedNode which is picky about node format.
  try {
    const currentJson = JSON.parse(query.serialize()) as Record<string, unknown>;
    const parentId = data.parentId || "ROOT";
    const parent = currentJson[parentId] as Record<string, unknown> | undefined;

    if (!parent) {
      return { success: false, error: `Parent node "${parentId}" not found in canvas` };
    }

    // Add new nodes to the canvas JSON
    const newNodeIds: string[] = [];
    for (const [nodeId, rawNode] of Object.entries(data.nodes)) {
      const node = rawNode as Record<string, unknown>;
      // Ensure parent reference and required fields
      node.parent = parentId;
      if (!node.linkedNodes) node.linkedNodes = {};
      if (!Array.isArray(node.nodes)) node.nodes = [];

      // Fix isCanvas based on schema
      const resolvedName = (node.type as Record<string, unknown>)?.resolvedName as string;
      if (resolvedName) {
        node.isCanvas = canvasComponentNames.has(resolvedName);
      }

      currentJson[nodeId] = node;
      newNodeIds.push(nodeId);
    }

    // Append new node IDs to parent's children
    const parentNodes = (parent.nodes as string[]) || [];
    if (data.index !== undefined) {
      parentNodes.splice(data.index, 0, ...newNodeIds);
    } else {
      parentNodes.push(...newNodeIds);
    }
    parent.nodes = parentNodes;

    const sanitized = sanitizeCraftJson(currentJson);
    actions.deserialize(JSON.stringify(sanitized));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add nodes",
    };
  }
}

export function applyRemoveNodes(
  actions: CraftActions,
  query: CraftQuery,
  nodeIds: string[]
): { success: boolean; error?: string } {
  try {
    const currentJson = JSON.parse(query.serialize()) as Record<string, unknown>;
    const removeSet = new Set(nodeIds);

    // Recursively collect all descendants of removed nodes
    function collectDescendants(nodeId: string) {
      const node = currentJson[nodeId] as Record<string, unknown> | undefined;
      if (!node) return;
      const children = (node.nodes as string[]) || [];
      for (const childId of children) {
        removeSet.add(childId);
        collectDescendants(childId);
      }
    }
    for (const id of nodeIds) collectDescendants(id);

    // Remove nodes from the JSON
    for (const id of removeSet) {
      delete currentJson[id];
    }

    // Clean up parent references — remove deleted IDs from all nodes' children arrays
    for (const [, rawNode] of Object.entries(currentJson)) {
      const node = rawNode as Record<string, unknown>;
      if (Array.isArray(node.nodes)) {
        node.nodes = (node.nodes as string[]).filter((id) => !removeSet.has(id));
      }
    }

    actions.deserialize(JSON.stringify(currentJson));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to remove nodes",
    };
  }
}

export function getCanvasSnapshot(query: CraftQuery): string {
  return query.serialize();
}
