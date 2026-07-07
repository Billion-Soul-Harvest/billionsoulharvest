import { brand, styles } from "@/features/email/templates/shared";

/** Escape a string for safe use in HTML attributes */
function escAttr(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface SerializedNode {
  type: { resolvedName: string };
  props: Record<string, unknown>;
  nodes: string[];
  linkedNodes?: Record<string, string>;
}

type NodeMap = Record<string, { type: { resolvedName: string }; props: Record<string, unknown>; nodes: string[]; linkedNodes?: Record<string, string> }>;

function renderNode(nodeId: string, nodes: NodeMap): string {
  const node = nodes[nodeId];
  if (!node) return "";

  const childrenHtml = (node.nodes || []).map((id) => renderNode(id, nodes)).join("");
  const linkedHtml = Object.values(node.linkedNodes || {})
    .map((id) => renderNode(id, nodes))
    .join("");

  switch (node.type.resolvedName) {
    case "EmailContainer":
      return `<div style="background-color:${node.props.backgroundColor || "transparent"};padding:${node.props.padding || 0}px;width:100%;">${childrenHtml}${linkedHtml}</div>`;

    case "EmailText": {
      const p = node.props;
      return `<div style="font-family:'Work Sans',sans-serif;font-size:${p.fontSize || 16}px;color:${p.color || "#44474c"};text-align:${p.textAlign || "left"};line-height:1.625;padding-top:${p.paddingTop || 8}px;padding-bottom:${p.paddingBottom || 8}px;padding-left:${p.paddingLeft || 0}px;padding-right:${p.paddingRight || 0}px;">${p.text || ""}</div>`;
    }

    case "EmailImage": {
      const p = node.props;
      const imgStyle = `width:${p.width || 100}%;max-width:100%;height:auto;display:block;`;
      const img = `<img src="${escAttr(p.src)}" alt="${escAttr(p.alt)}" style="${imgStyle}" />`;
      const wrapped = p.href ? `<a href="${escAttr(p.href)}" style="display:inline-block;">${img}</a>` : img;
      return `<div style="text-align:${p.alignment || "center"};padding:4px 0;">${wrapped}</div>`;
    }

    case "EmailButton": {
      const p = node.props;
      return `<div style="text-align:center;padding:12px 0;"><a href="${escAttr(p.href || "#")}" style="background-color:${p.backgroundColor || "#006a62"};color:${p.textColor || "#ffffff"};padding:${p.paddingY || 12}px ${p.paddingX || 48}px;border-radius:${p.borderRadius || 8}px;font-family:Manrope,sans-serif;font-size:${p.fontSize || 16}px;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:0.05em;text-transform:uppercase;">${escAttr(p.text || "Click Here")}</a></div>`;
    }

    case "EmailDivider": {
      const p = node.props;
      return `<hr style="border:none;border-top:${p.thickness || 1}px solid ${p.color || "#c4c6cc"};margin-top:${p.marginTop || 16}px;margin-bottom:${p.marginBottom || 16}px;width:100%;" />`;
    }

    case "EmailSpacer":
      return `<div style="height:${node.props.height || 32}px;"></div>`;

    case "EmailColumns": {
      const ratio = String(node.props.ratio || "50-50");
      const gap = Number(node.props.gap || 0);
      const ratioWidths: Record<string, [string, string]> = {
        "50-50": ["50%", "50%"],
        "60-40": ["60%", "40%"],
        "40-60": ["40%", "60%"],
        "70-30": ["70%", "30%"],
        "30-70": ["30%", "70%"],
      };
      const [w1, w2] = ratioWidths[ratio] || ["50%", "50%"];
      // Render children with ratio widths applied
      const cellIds = [...(node.nodes || []), ...Object.values(node.linkedNodes || {})];
      const cellsHtml = cellIds.map((id, i) => {
        const cellNode = nodes[id];
        if (!cellNode) return "";
        const width = i === 0 ? w1 : w2;
        const cellChildrenHtml = (cellNode.nodes || []).map((cid) => renderNode(cid, nodes)).join("");
        const cellLinkedHtml = Object.values(cellNode.linkedNodes || {}).map((cid) => renderNode(cid, nodes)).join("");
        const padding = cellNode.props.padding || 8;
        const paddingStyle = gap > 0
          ? (i === 0 ? `${padding}px ${gap / 2}px ${padding}px ${padding}px` : `${padding}px ${padding}px ${padding}px ${gap / 2}px`)
          : `${padding}px`;
        return `<td style="width:${width};vertical-align:top;padding:${paddingStyle};">${cellChildrenHtml}${cellLinkedHtml}</td>`;
      }).join("");
      return `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;"><tbody><tr>${cellsHtml}</tr></tbody></table>`;
    }

    case "EmailColumnCell": {
      const p = node.props;
      return `<td style="width:${p.widthPercent || "50%"};vertical-align:top;padding:${p.padding || 8}px;">${childrenHtml}${linkedHtml}</td>`;
    }

    default:
      return childrenHtml + linkedHtml;
  }
}

export function renderEmailJson(json: string): string {
  let nodes: NodeMap;
  try {
    nodes = JSON.parse(json);
  } catch {
    return "";
  }

  const rootNode = nodes["ROOT"];
  if (!rootNode) return "";

  const contentHtml = (rootNode.nodes || []).map((id) => renderNode(id, nodes)).join("");

  // Wrap in BSH email layout with inline styles
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:${brand.surfaceContainerLow};font-family:${brand.fontBody};">
<table cellpadding="0" cellspacing="0" style="width:100%;background-color:${brand.surfaceContainerLow};">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${brand.surfaceContainerLowest};">
<!-- Header -->
<tr><td style="background-color:${brand.surfaceContainerLowest};padding:16px 20px;text-align:center;border-bottom:1px solid ${brand.outlineVariant};">
<p style="color:${brand.primary};font-family:${brand.fontHeadline};font-size:22px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin:0;">Billion Soul Harvest</p>
</td></tr>
<!-- Content -->
<tr><td style="padding:40px 20px;">
${contentHtml}
</td></tr>
<!-- Footer -->
<tr><td style="background-color:${brand.surfaceContainerLow};border-top:1px solid ${brand.outlineVariant};padding:40px 20px;">
<p style="font-family:${brand.fontHeadline};font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${brand.onSurface};text-align:center;margin:0 0 12px;">Billion Soul Harvest</p>
<p style="font-size:14px;color:${brand.onSurfaceVariant};text-align:center;margin:0 0 12px;line-height:1.6;">
<a href="#" style="color:${brand.onSurfaceVariant};text-decoration:none;">Privacy Policy</a>
&nbsp;&middot;&nbsp;
<a href="#" style="color:${brand.onSurfaceVariant};text-decoration:none;">Contact Us</a>
&nbsp;&middot;&nbsp;
<a href="{{unsubscribe_url}}" style="color:${brand.onSurfaceVariant};text-decoration:none;">Unsubscribe</a>
</p>
<p style="color:${brand.onSurfaceVariant};font-size:12px;text-align:center;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} Billion Soul Harvest. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
