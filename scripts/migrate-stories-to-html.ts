/**
 * Migrate stories from Craft.js page_content JSON to content_html + gallery_images.
 *
 * Usage:
 *   npx tsx scripts/migrate-stories-to-html.ts                 # local
 *   npx tsx scripts/migrate-stories-to-html.ts --production    # production (with confirmation)
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

interface CraftNode {
  type: { resolvedName: string };
  props: Record<string, unknown>;
  nodes: string[];
  linkedNodes?: Record<string, string>;
}

interface CraftJSON {
  [nodeId: string]: CraftNode;
}

interface GalleryImage {
  url: string;
  caption?: string;
}

const isProduction = process.argv.includes("--production");

const SUPABASE_URL = isProduction
  ? process.env.SUPABASE_URL!
  : process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";

const SUPABASE_KEY = isProduction
  ? process.env.SUPABASE_SERVICE_ROLE_KEY!
  : process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

function extractFromCraftJSON(content: CraftJSON): { html: string; galleryImages: GalleryImage[] } {
  const htmlParts: string[] = [];
  const galleryImages: GalleryImage[] = [];

  function walkNode(nodeId: string) {
    const node = content[nodeId];
    if (!node) return;

    const name = node.type?.resolvedName;

    if (name === "CraftText") {
      const text = node.props?.text as string | undefined;
      if (text) {
        htmlParts.push(text);
      }
    }

    if (name === "CraftImage") {
      const src = node.props?.src as string | undefined;
      const alt = (node.props?.alt as string) || "";
      if (src) {
        htmlParts.push(`<img src="${src}" alt="${alt}" />`);
      }
    }

    if (name === "CraftCarousel") {
      const images = node.props?.images as string[] | undefined;
      if (images) {
        for (const url of images) {
          galleryImages.push({ url });
        }
      }
    }

    // Recurse into child nodes
    if (node.nodes) {
      for (const childId of node.nodes) {
        walkNode(childId);
      }
    }

    // Recurse into linked nodes (canvas children)
    if (node.linkedNodes) {
      for (const linkedId of Object.values(node.linkedNodes)) {
        walkNode(linkedId);
      }
    }
  }

  // Start from ROOT
  walkNode("ROOT");

  return { html: htmlParts.join("\n"), galleryImages };
}

async function main() {
  console.log(`Target: ${isProduction ? "PRODUCTION" : "LOCAL"}`);
  console.log(`URL: ${SUPABASE_URL}\n`);

  if (isProduction) {
    const ok = await confirm("You are about to run this against PRODUCTION. Continue?");
    if (!ok) {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch stories that have page_content but no content_html
  const { data: stories, error } = await supabase
    .from("stories")
    .select("id, title, page_content, content_html")
    .not("page_content", "is", null);

  if (error) {
    console.error("Failed to fetch stories:", error.message);
    process.exit(1);
  }

  const toMigrate = (stories ?? []).filter((s) => !s.content_html && s.page_content);

  console.log(`Found ${stories?.length ?? 0} stories with page_content`);
  console.log(`${toMigrate.length} need migration (no content_html yet)\n`);

  if (toMigrate.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  let migrated = 0;
  let failed = 0;

  for (const story of toMigrate) {
    try {
      const craftJson = story.page_content as unknown as CraftJSON;
      const { html, galleryImages } = extractFromCraftJSON(craftJson);

      if (!html && galleryImages.length === 0) {
        console.log(`  SKIP: "${story.title}" — no extractable content`);
        continue;
      }

      const { error: updateError } = await supabase
        .from("stories")
        .update({
          content_html: html || null,
          gallery_images: galleryImages.length > 0 ? galleryImages : [],
        })
        .eq("id", story.id);

      if (updateError) {
        console.error(`  FAIL: "${story.title}" — ${updateError.message}`);
        failed++;
      } else {
        console.log(`  OK:   "${story.title}" — ${html.length} chars HTML, ${galleryImages.length} gallery images`);
        migrated++;
      }
    } catch (err) {
      console.error(`  FAIL: "${story.title}" — ${err}`);
      failed++;
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, Failed: ${failed}`);
}

main();
