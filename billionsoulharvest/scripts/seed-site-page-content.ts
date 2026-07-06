import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Local Supabase connection
// ---------------------------------------------------------------------------
const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------------------------------------------------------------------------
// Helper: create a Craft.js node
// ---------------------------------------------------------------------------
type CraftNode = {
  type: { resolvedName: string };
  isCanvas: boolean;
  props: Record<string, unknown>;
  nodes: string[];
  linkedNodes: Record<string, never>;
  parent: string | null;
};

function node(
  type: string,
  isCanvas: boolean,
  props: Record<string, unknown>,
  children: string[],
  parent: string | null
): CraftNode {
  return {
    type: { resolvedName: type },
    isCanvas,
    props,
    nodes: children,
    linkedNodes: {},
    parent,
  };
}

// Shorthand helpers
function container(
  props: Record<string, unknown>,
  children: string[],
  parent: string | null
): CraftNode {
  return node("CraftContainer", true, props, children, parent);
}

function text(
  props: Record<string, unknown>,
  parent: string
): CraftNode {
  return node("CraftText", false, props, [], parent);
}

function image(
  props: Record<string, unknown>,
  parent: string
): CraftNode {
  return node("CraftImage", false, props, [], parent);
}

function button(
  props: Record<string, unknown>,
  parent: string
): CraftNode {
  return node("CraftButton", false, props, [], parent);
}

function row(
  props: Record<string, unknown>,
  children: string[],
  parent: string
): CraftNode {
  return node("CraftRow", true, props, children, parent);
}

function column(
  props: Record<string, unknown>,
  children: string[],
  parent: string
): CraftNode {
  return node("CraftColumn", true, props, children, parent);
}

function spacer(height: number, parent: string): CraftNode {
  return node("CraftSpacer", false, { height }, [], parent);
}

function divider(
  props: Record<string, unknown>,
  parent: string
): CraftNode {
  return node("CraftDivider", false, props, [], parent);
}

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const DARK = "#0f2744";
const DARKER = "#0a1e38";
const CYAN = "#29BDD6";
const GOLD = "#D4A843";
const WHITE = "#ffffff";
const LIGHT_GRAY = "#f9fafb";

// ---------------------------------------------------------------------------
// PAGE 1: HOME
// ---------------------------------------------------------------------------
function buildHomePage(): Record<string, CraftNode> {
  const nodes: Record<string, CraftNode> = {};

  // ROOT
  nodes["ROOT"] = container(
    { backgroundColor: DARK, padding: 0, width: 1200, minHeight: 800, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 0 },
    ["home_hero", "home_what", "home_mission", "home_dna", "home_stats", "home_cta"],
    null
  );

  // --- HERO ---
  nodes["home_hero"] = container(
    { backgroundColor: DARK, backgroundImage: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1920&q=80", padding: 100, width: 1200, minHeight: 500, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 16 },
    ["home_hero_title", "home_hero_subtitle", "home_hero_spacer", "home_hero_buttons"],
    "ROOT"
  );
  nodes["home_hero_title"] = text(
    { text: "<h1>Reaching 1 Billion Souls by 2033</h1>", fontSize: 52, textAlign: "center", color: WHITE, width: 900, height: 80 },
    "home_hero"
  );
  nodes["home_hero_subtitle"] = text(
    { text: "<p>A global movement uniting the Body of Christ to fulfill the Great Commission in our generation.</p>", fontSize: 20, textAlign: "center", color: "#cbd5e1", width: 700, height: 60 },
    "home_hero"
  );
  nodes["home_hero_spacer"] = spacer(16, "home_hero");
  nodes["home_hero_buttons"] = row(
    { gap: 16, padding: 0, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", minHeight: 60 },
    ["home_hero_btn1", "home_hero_btn2"],
    "home_hero"
  );
  nodes["home_hero_btn1"] = button(
    { text: "View Gatherings", link: "/gatherings", bgColor: CYAN, textColor: WHITE, fontSize: 16, paddingX: 32, paddingY: 14, borderRadius: 8, width: 200 },
    "home_hero_buttons"
  );
  nodes["home_hero_btn2"] = button(
    { text: "Learn More", link: "/about", bgColor: "transparent", textColor: WHITE, fontSize: 16, paddingX: 32, paddingY: 14, borderRadius: 8, width: 200 },
    "home_hero_buttons"
  );

  // --- WHAT IS BSH ---
  nodes["home_what"] = container(
    { backgroundColor: WHITE, padding: 80, width: 1200, minHeight: 400, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["home_what_title", "home_what_row"],
    "ROOT"
  );
  nodes["home_what_title"] = text(
    { text: "<h2>What is Billion Soul Harvest?</h2>", fontSize: 36, textAlign: "center", color: DARK, width: 800, height: 60 },
    "home_what"
  );
  nodes["home_what_row"] = row(
    { gap: 40, padding: 0, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", minHeight: 300 },
    ["home_what_col_text", "home_what_col_img"],
    "home_what"
  );
  nodes["home_what_col_text"] = column(
    { width: "55%", minWidth: 300, padding: 0, backgroundColor: "transparent", alignItems: "flex-start", justifyContent: "center", gap: 16 },
    ["home_what_desc"],
    "home_what_row"
  );
  nodes["home_what_desc"] = text(
    { text: "<p>Billion Soul Harvest (BSH) is a global coalition of churches, ministries, and leaders committed to reaching one billion souls with the Gospel of Jesus Christ by the year 2033. Through evangelism, discipleship, and multiplication, BSH connects leaders across nations to accelerate the fulfillment of the Great Commission.</p>", fontSize: 16, textAlign: "left", color: "#374151", width: 500, height: 160 },
    "home_what_col_text"
  );
  nodes["home_what_col_img"] = column(
    { width: "40%", minWidth: 300, padding: 0, backgroundColor: "transparent", alignItems: "center", justifyContent: "center", gap: 0 },
    ["home_what_img"],
    "home_what_row"
  );
  nodes["home_what_img"] = image(
    { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=960&q=80", alt: "Community gathering", width: 440, height: 300, borderRadius: 12, objectFit: "cover" },
    "home_what_col_img"
  );

  // --- MISSION ---
  nodes["home_mission"] = container(
    { backgroundColor: DARKER, padding: 80, width: 1200, minHeight: 350, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["home_mission_title", "home_mission_row"],
    "ROOT"
  );
  nodes["home_mission_title"] = text(
    { text: "<h2>Evangelize. Disciple. Multiply.</h2>", fontSize: 36, textAlign: "center", color: GOLD, width: 800, height: 60 },
    "home_mission"
  );
  nodes["home_mission_row"] = row(
    { gap: 24, padding: 0, alignItems: "flex-start", justifyContent: "center", backgroundColor: "transparent", minHeight: 200 },
    ["home_mission_col1", "home_mission_col2", "home_mission_col3"],
    "home_mission"
  );
  nodes["home_mission_col1"] = column(
    { width: "30%", minWidth: 250, padding: 24, backgroundColor: DARK, alignItems: "center", justifyContent: "flex-start", gap: 12 },
    ["home_mission_t1", "home_mission_d1"],
    "home_mission_row"
  );
  nodes["home_mission_t1"] = text(
    { text: "<h3>Evangelize</h3>", fontSize: 22, textAlign: "center", color: CYAN, width: 220, height: 40 },
    "home_mission_col1"
  );
  nodes["home_mission_d1"] = text(
    { text: "<p>Proclaiming the Gospel to every nation, tribe, and tongue through coordinated global outreach and harvest events.</p>", fontSize: 15, textAlign: "center", color: "#cbd5e1", width: 220, height: 100 },
    "home_mission_col1"
  );
  nodes["home_mission_col2"] = column(
    { width: "30%", minWidth: 250, padding: 24, backgroundColor: DARK, alignItems: "center", justifyContent: "flex-start", gap: 12 },
    ["home_mission_t2", "home_mission_d2"],
    "home_mission_row"
  );
  nodes["home_mission_t2"] = text(
    { text: "<h3>Disciple</h3>", fontSize: 22, textAlign: "center", color: CYAN, width: 220, height: 40 },
    "home_mission_col2"
  );
  nodes["home_mission_d2"] = text(
    { text: "<p>Equipping believers to grow in faith, training leaders to shepherd communities, and building a foundation for lasting transformation.</p>", fontSize: 15, textAlign: "center", color: "#cbd5e1", width: 220, height: 100 },
    "home_mission_col2"
  );
  nodes["home_mission_col3"] = column(
    { width: "30%", minWidth: 250, padding: 24, backgroundColor: DARK, alignItems: "center", justifyContent: "flex-start", gap: 12 },
    ["home_mission_t3", "home_mission_d3"],
    "home_mission_row"
  );
  nodes["home_mission_t3"] = text(
    { text: "<h3>Multiply</h3>", fontSize: 22, textAlign: "center", color: CYAN, width: 220, height: 40 },
    "home_mission_col3"
  );
  nodes["home_mission_d3"] = text(
    { text: "<p>Sending trained leaders to plant churches and raise up the next generation of disciple-makers across every continent.</p>", fontSize: 15, textAlign: "center", color: "#cbd5e1", width: 220, height: 100 },
    "home_mission_col3"
  );

  // --- OUR DNA ---
  nodes["home_dna"] = container(
    { backgroundColor: WHITE, padding: 80, width: 1200, minHeight: 300, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["home_dna_title", "home_dna_row"],
    "ROOT"
  );
  nodes["home_dna_title"] = text(
    { text: "<h2>Holy. Humble. Hidden.</h2>", fontSize: 36, textAlign: "center", color: DARK, width: 800, height: 60 },
    "home_dna"
  );
  nodes["home_dna_row"] = row(
    { gap: 24, padding: 0, alignItems: "flex-start", justifyContent: "center", backgroundColor: "transparent", minHeight: 180 },
    ["home_dna_col1", "home_dna_col2", "home_dna_col3"],
    "home_dna"
  );
  nodes["home_dna_col1"] = column(
    { width: "30%", minWidth: 250, padding: 24, backgroundColor: LIGHT_GRAY, alignItems: "center", justifyContent: "flex-start", gap: 12 },
    ["home_dna_h1", "home_dna_p1"],
    "home_dna_row"
  );
  nodes["home_dna_h1"] = text(
    { text: "<h3>Holy</h3>", fontSize: 22, textAlign: "center", color: DARK, width: 220, height: 40 },
    "home_dna_col1"
  );
  nodes["home_dna_p1"] = text(
    { text: "<p>Set apart for God's purposes, pursuing righteousness and purity in all we do.</p>", fontSize: 15, textAlign: "center", color: "#374151", width: 220, height: 80 },
    "home_dna_col1"
  );
  nodes["home_dna_col2"] = column(
    { width: "30%", minWidth: 250, padding: 24, backgroundColor: LIGHT_GRAY, alignItems: "center", justifyContent: "flex-start", gap: 12 },
    ["home_dna_h2", "home_dna_p2"],
    "home_dna_row"
  );
  nodes["home_dna_h2"] = text(
    { text: "<h3>Humble</h3>", fontSize: 22, textAlign: "center", color: DARK, width: 220, height: 40 },
    "home_dna_col2"
  );
  nodes["home_dna_p2"] = text(
    { text: "<p>Serving with a posture of humility, putting others above ourselves and seeking unity over recognition.</p>", fontSize: 15, textAlign: "center", color: "#374151", width: 220, height: 80 },
    "home_dna_col2"
  );
  nodes["home_dna_col3"] = column(
    { width: "30%", minWidth: 250, padding: 24, backgroundColor: LIGHT_GRAY, alignItems: "center", justifyContent: "flex-start", gap: 12 },
    ["home_dna_h3", "home_dna_p3"],
    "home_dna_row"
  );
  nodes["home_dna_h3"] = text(
    { text: "<h3>Hidden</h3>", fontSize: 22, textAlign: "center", color: DARK, width: 220, height: 40 },
    "home_dna_col3"
  );
  nodes["home_dna_p3"] = text(
    { text: "<p>Working behind the scenes to lift up the name of Jesus, not our own brands or platforms.</p>", fontSize: 15, textAlign: "center", color: "#374151", width: 220, height: 80 },
    "home_dna_col3"
  );

  // --- STATS ---
  nodes["home_stats"] = container(
    { backgroundColor: DARKER, padding: 80, width: 1200, minHeight: 200, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["home_stats_row"],
    "ROOT"
  );
  nodes["home_stats_row"] = row(
    { gap: 40, padding: 0, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", minHeight: 120 },
    ["home_stat1", "home_stat2", "home_stat3", "home_stat4"],
    "home_stats"
  );
  const statItems = [
    { id: "home_stat1", val: "50+", label: "Nations" },
    { id: "home_stat2", val: "5,000+", label: "Leaders Connected" },
    { id: "home_stat3", val: "12", label: "Global Summits" },
    { id: "home_stat4", val: "2033", label: "Vision Year" },
  ];
  for (const s of statItems) {
    nodes[s.id] = column(
      { width: "22%", minWidth: 150, padding: 16, backgroundColor: "transparent", alignItems: "center", justifyContent: "center", gap: 8 },
      [`${s.id}_val`, `${s.id}_label`],
      "home_stats_row"
    );
    nodes[`${s.id}_val`] = text(
      { text: `<h2>${s.val}</h2>`, fontSize: 40, textAlign: "center", color: CYAN, width: 180, height: 55 },
      s.id
    );
    nodes[`${s.id}_label`] = text(
      { text: `<p>${s.label}</p>`, fontSize: 16, textAlign: "center", color: "#cbd5e1", width: 180, height: 30 },
      s.id
    );
  }

  // --- CTA ---
  nodes["home_cta"] = container(
    { backgroundColor: DARK, padding: 80, width: 1200, minHeight: 300, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 20 },
    ["home_cta_title", "home_cta_subtitle", "home_cta_spacer", "home_cta_buttons"],
    "ROOT"
  );
  nodes["home_cta_title"] = text(
    { text: "<h2>Gather for Vision. Scatter for Harvest. Unite for the Kingdom.</h2>", fontSize: 32, textAlign: "center", color: WHITE, width: 800, height: 80 },
    "home_cta"
  );
  nodes["home_cta_subtitle"] = text(
    { text: "<p>Be part of a movement that is changing the course of history.</p>", fontSize: 18, textAlign: "center", color: "#cbd5e1", width: 600, height: 40 },
    "home_cta"
  );
  nodes["home_cta_spacer"] = spacer(12, "home_cta");
  nodes["home_cta_buttons"] = row(
    { gap: 16, padding: 0, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", minHeight: 60 },
    ["home_cta_btn1", "home_cta_btn2"],
    "home_cta"
  );
  nodes["home_cta_btn1"] = button(
    { text: "Join the Movement", link: "/connect", bgColor: GOLD, textColor: DARK, fontSize: 16, paddingX: 32, paddingY: 14, borderRadius: 8, width: 220 },
    "home_cta_buttons"
  );
  nodes["home_cta_btn2"] = button(
    { text: "Learn More", link: "/about", bgColor: "transparent", textColor: WHITE, fontSize: 16, paddingX: 32, paddingY: 14, borderRadius: 8, width: 180 },
    "home_cta_buttons"
  );

  return nodes;
}

// ---------------------------------------------------------------------------
// PAGE 2: ABOUT
// ---------------------------------------------------------------------------
function buildAboutPage(): Record<string, CraftNode> {
  const nodes: Record<string, CraftNode> = {};

  nodes["ROOT"] = container(
    { backgroundColor: DARK, padding: 0, width: 1200, minHeight: 800, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 0 },
    ["about_hero", "about_story", "about_quote", "about_timeline", "about_leadership"],
    null
  );

  // --- HERO ---
  nodes["about_hero"] = container(
    { backgroundColor: DARK, backgroundImage: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1920&q=80", padding: 100, width: 1200, minHeight: 400, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 16 },
    ["about_hero_title", "about_hero_subtitle"],
    "ROOT"
  );
  nodes["about_hero_title"] = text(
    { text: "<h1>A Vision Born for Such a Time as This</h1>", fontSize: 48, textAlign: "center", color: WHITE, width: 800, height: 80 },
    "about_hero"
  );
  nodes["about_hero_subtitle"] = text(
    { text: "<p>Discover how God is uniting His people for the greatest harvest in history.</p>", fontSize: 20, textAlign: "center", color: "#cbd5e1", width: 600, height: 50 },
    "about_hero"
  );

  // --- OUR STORY ---
  nodes["about_story"] = container(
    { backgroundColor: WHITE, padding: 80, width: 1200, minHeight: 400, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["about_story_title", "about_story_row"],
    "ROOT"
  );
  nodes["about_story_title"] = text(
    { text: "<h2>Our Story</h2>", fontSize: 36, textAlign: "center", color: DARK, width: 800, height: 60 },
    "about_story"
  );
  nodes["about_story_row"] = row(
    { gap: 40, padding: 0, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", minHeight: 300 },
    ["about_story_col_text", "about_story_col_img"],
    "about_story"
  );
  nodes["about_story_col_text"] = column(
    { width: "55%", minWidth: 300, padding: 0, backgroundColor: "transparent", alignItems: "flex-start", justifyContent: "center", gap: 16 },
    ["about_story_text"],
    "about_story_row"
  );
  nodes["about_story_text"] = text(
    { text: "<p>Billion Soul Harvest was born from a divine burden — the realization that while millions come to faith each year, billions remain unreached. Founded to unite the global Church under one mission, BSH brings together pastors, evangelists, church planters, and ministry leaders from every continent. Through strategic summits, leadership training, and collaborative partnerships, BSH is building a network of leaders committed to seeing one billion souls come to Christ by 2033.</p>", fontSize: 16, textAlign: "left", color: "#374151", width: 500, height: 200 },
    "about_story_col_text"
  );
  nodes["about_story_col_img"] = column(
    { width: "40%", minWidth: 300, padding: 0, backgroundColor: "transparent", alignItems: "center", justifyContent: "center", gap: 0 },
    ["about_story_img"],
    "about_story_row"
  );
  nodes["about_story_img"] = image(
    { src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=960&q=80", alt: "BSH leaders gathering", width: 440, height: 300, borderRadius: 12, objectFit: "cover" },
    "about_story_col_img"
  );

  // --- QUOTE ---
  nodes["about_quote"] = container(
    { backgroundColor: DARKER, padding: 80, width: 1200, minHeight: 200, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 16 },
    ["about_quote_text", "about_quote_divider"],
    "ROOT"
  );
  nodes["about_quote_text"] = text(
    { text: '<p><strong>"To unite the Body of Christ in the common vision of reaching one billion souls for Jesus Christ by the year 2033."</strong></p>', fontSize: 24, textAlign: "center", color: GOLD, width: 800, height: 80 },
    "about_quote"
  );
  nodes["about_quote_divider"] = divider(
    { thickness: 2, color: CYAN, widthPercent: 20, marginY: 16 },
    "about_quote"
  );

  // --- TIMELINE ---
  nodes["about_timeline"] = container(
    { backgroundColor: DARKER, padding: 80, width: 1200, minHeight: 300, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["about_timeline_title", "about_timeline_text"],
    "ROOT"
  );
  nodes["about_timeline_title"] = text(
    { text: "<h2>From Commission to Harvest</h2>", fontSize: 36, textAlign: "center", color: GOLD, width: 800, height: 60 },
    "about_timeline"
  );
  nodes["about_timeline_text"] = text(
    { text: "<p>From our founding days of intimate prayer gatherings to hosting global summits across 50+ nations, BSH has grown into a movement that transcends denominations, cultures, and borders. Each summit, training initiative, and partnership is a step closer to fulfilling the Great Commission. Our journey has been marked by faithful obedience, divine orchestration, and the relentless pursuit of the lost.</p>", fontSize: 16, textAlign: "center", color: "#cbd5e1", width: 700, height: 140 },
    "about_timeline"
  );

  // --- LEADERSHIP ---
  nodes["about_leadership"] = container(
    { backgroundColor: WHITE, padding: 80, width: 1200, minHeight: 400, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["about_lead_title", "about_lead_row"],
    "ROOT"
  );
  nodes["about_lead_title"] = text(
    { text: "<h2>Leadership</h2>", fontSize: 36, textAlign: "center", color: DARK, width: 800, height: 60 },
    "about_leadership"
  );
  nodes["about_lead_row"] = row(
    { gap: 24, padding: 0, alignItems: "flex-start", justifyContent: "center", backgroundColor: "transparent", minHeight: 300 },
    ["about_lead1", "about_lead2", "about_lead3"],
    "about_leadership"
  );

  const leaders = [
    { id: "about_lead1", name: "Dr. James Hwang", role: "Chairman & Co-Founder" },
    { id: "about_lead2", name: "Rev. Dr. Young Cho", role: "President & Co-Founder" },
    { id: "about_lead3", name: "Pastor Rick Warren", role: "Strategic Advisor" },
  ];
  for (const l of leaders) {
    nodes[l.id] = column(
      { width: "30%", minWidth: 250, padding: 32, backgroundColor: LIGHT_GRAY, alignItems: "center", justifyContent: "flex-start", gap: 12 },
      [`${l.id}_name`, `${l.id}_role`],
      "about_lead_row"
    );
    nodes[`${l.id}_name`] = text(
      { text: `<h3>${l.name}</h3>`, fontSize: 20, textAlign: "center", color: DARK, width: 220, height: 35 },
      l.id
    );
    nodes[`${l.id}_role`] = text(
      { text: `<p>${l.role}</p>`, fontSize: 15, textAlign: "center", color: "#6b7280", width: 220, height: 30 },
      l.id
    );
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// PAGE 3: INITIATIVES
// ---------------------------------------------------------------------------
function buildInitiativesPage(): Record<string, CraftNode> {
  const nodes: Record<string, CraftNode> = {};

  nodes["ROOT"] = container(
    { backgroundColor: DARK, padding: 0, width: 1200, minHeight: 800, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 0 },
    ["init_hero", "init_summits", "init_ili", "init_ftf", "init_care", "init_partners"],
    null
  );

  // --- HERO ---
  nodes["init_hero"] = container(
    { backgroundColor: DARK, backgroundImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80", padding: 100, width: 1200, minHeight: 400, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 16 },
    ["init_hero_title", "init_hero_subtitle"],
    "ROOT"
  );
  nodes["init_hero_title"] = text(
    { text: "<h1>Our Global Initiatives</h1>", fontSize: 48, textAlign: "center", color: WHITE, width: 800, height: 80 },
    "init_hero"
  );
  nodes["init_hero_subtitle"] = text(
    { text: "<p>Strategic programs advancing the Great Commission across every nation.</p>", fontSize: 20, textAlign: "center", color: "#cbd5e1", width: 600, height: 50 },
    "init_hero"
  );

  // Initiative sections (alternating white/dark)
  const initiatives = [
    { id: "init_summits", bg: WHITE, textColor: DARK, subColor: "#374151", title: "Global & National Harvest Summits", desc: "Large-scale gatherings that unite thousands of leaders from around the world for vision-casting, training, and strategic planning. These summits serve as catalysts for regional and national harvest movements, equipping leaders to mobilize their communities for evangelism and discipleship." },
    { id: "init_ili", bg: DARKER, textColor: GOLD, subColor: "#cbd5e1", title: "International Leadership Institute (ILI)", desc: "A comprehensive leadership training program that has equipped tens of thousands of leaders across multiple continents. ILI provides practical, biblical training in leadership principles that can be immediately applied to grow churches, plant new congregations, and multiply disciple-makers." },
    { id: "init_ftf", bg: WHITE, textColor: DARK, subColor: "#374151", title: "Fanning the Flame", desc: "Built on three pillars — Find, Fuel, Finish — this initiative identifies emerging leaders, fuels their growth through mentorship and resources, and sends them out to finish the task of the Great Commission in their regions. Fanning the Flame is creating a pipeline of next-generation leaders." },
    { id: "init_care", bg: DARKER, textColor: GOLD, subColor: "#cbd5e1", title: "Billion Soul Care", desc: "Addressing the holistic needs of communities through compassionate care initiatives. Billion Soul Care provides practical support — clean water, medical aid, educational resources — alongside the proclamation of the Gospel, demonstrating the love of Christ in tangible ways." },
    { id: "init_partners", bg: WHITE, textColor: DARK, subColor: "#374151", title: "Strategic Partnerships", desc: "BSH collaborates with denominations, parachurch organizations, and mission agencies worldwide. These strategic alliances amplify impact, share resources, and create synergies that no single organization could achieve alone, accelerating progress toward the one-billion-soul vision." },
  ];

  for (const ini of initiatives) {
    nodes[ini.id] = container(
      { backgroundColor: ini.bg, padding: 80, width: 1200, minHeight: 250, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 16 },
      [`${ini.id}_title`, `${ini.id}_desc`],
      "ROOT"
    );
    nodes[`${ini.id}_title`] = text(
      { text: `<h2>${ini.title}</h2>`, fontSize: 32, textAlign: "center", color: ini.textColor, width: 800, height: 50 },
      ini.id
    );
    nodes[`${ini.id}_desc`] = text(
      { text: `<p>${ini.desc}</p>`, fontSize: 16, textAlign: "center", color: ini.subColor, width: 700, height: 120 },
      ini.id
    );
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// PAGE 4: MEDIA
// ---------------------------------------------------------------------------
function buildMediaPage(): Record<string, CraftNode> {
  const nodes: Record<string, CraftNode> = {};

  nodes["ROOT"] = container(
    { backgroundColor: DARK, padding: 0, width: 1200, minHeight: 800, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 0 },
    ["media_hero", "media_stories", "media_resources"],
    null
  );

  // --- HERO ---
  nodes["media_hero"] = container(
    { backgroundColor: DARK, backgroundImage: "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1920&q=80", padding: 100, width: 1200, minHeight: 400, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 16 },
    ["media_hero_title", "media_hero_subtitle"],
    "ROOT"
  );
  nodes["media_hero_title"] = text(
    { text: "<h1>Stories of a Global Movement</h1>", fontSize: 48, textAlign: "center", color: WHITE, width: 800, height: 80 },
    "media_hero"
  );
  nodes["media_hero_subtitle"] = text(
    { text: "<p>Witness what God is doing across the nations.</p>", fontSize: 20, textAlign: "center", color: "#cbd5e1", width: 600, height: 50 },
    "media_hero"
  );

  // --- STORIES ---
  nodes["media_stories"] = container(
    { backgroundColor: WHITE, padding: 80, width: 1200, minHeight: 350, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["media_stories_title", "media_stories_row"],
    "ROOT"
  );
  nodes["media_stories_title"] = text(
    { text: "<h2>Stories & Media</h2>", fontSize: 36, textAlign: "center", color: DARK, width: 800, height: 60 },
    "media_stories"
  );
  nodes["media_stories_row"] = row(
    { gap: 20, padding: 0, alignItems: "flex-start", justifyContent: "center", backgroundColor: "transparent", minHeight: 180 },
    ["media_card1", "media_card2", "media_card3", "media_card4"],
    "media_stories"
  );

  const storyCards = [
    { id: "media_card1", label: "Videos" },
    { id: "media_card2", label: "Testimonies" },
    { id: "media_card3", label: "News" },
    { id: "media_card4", label: "Photos" },
  ];
  for (const c of storyCards) {
    nodes[c.id] = column(
      { width: "22%", minWidth: 180, padding: 32, backgroundColor: LIGHT_GRAY, alignItems: "center", justifyContent: "center", gap: 12 },
      [`${c.id}_title`, `${c.id}_soon`],
      "media_stories_row"
    );
    nodes[`${c.id}_title`] = text(
      { text: `<h3>${c.label}</h3>`, fontSize: 20, textAlign: "center", color: DARK, width: 160, height: 35 },
      c.id
    );
    nodes[`${c.id}_soon`] = text(
      { text: "<p>Coming Soon</p>", fontSize: 14, textAlign: "center", color: "#9ca3af", width: 160, height: 25 },
      c.id
    );
  }

  // --- RESOURCES ---
  nodes["media_resources"] = container(
    { backgroundColor: DARKER, padding: 80, width: 1200, minHeight: 350, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["media_res_title", "media_res_row"],
    "ROOT"
  );
  nodes["media_res_title"] = text(
    { text: "<h2>Resources</h2>", fontSize: 36, textAlign: "center", color: GOLD, width: 800, height: 60 },
    "media_resources"
  );
  nodes["media_res_row"] = row(
    { gap: 20, padding: 0, alignItems: "flex-start", justifyContent: "center", backgroundColor: "transparent", minHeight: 180 },
    ["media_res1", "media_res2", "media_res3", "media_res4"],
    "media_resources"
  );

  const resCards = [
    { id: "media_res1", label: "Downloads" },
    { id: "media_res2", label: "Brochures" },
    { id: "media_res3", label: "Guides" },
    { id: "media_res4", label: "Presentations" },
  ];
  for (const c of resCards) {
    nodes[c.id] = column(
      { width: "22%", minWidth: 180, padding: 32, backgroundColor: DARK, alignItems: "center", justifyContent: "center", gap: 12 },
      [`${c.id}_title`, `${c.id}_soon`],
      "media_res_row"
    );
    nodes[`${c.id}_title`] = text(
      { text: `<h3>${c.label}</h3>`, fontSize: 20, textAlign: "center", color: WHITE, width: 160, height: 35 },
      c.id
    );
    nodes[`${c.id}_soon`] = text(
      { text: "<p>Coming Soon</p>", fontSize: 14, textAlign: "center", color: "#6b7280", width: 160, height: 25 },
      c.id
    );
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// PAGE 5: CONNECT
// ---------------------------------------------------------------------------
function buildConnectPage(): Record<string, CraftNode> {
  const nodes: Record<string, CraftNode> = {};

  nodes["ROOT"] = container(
    { backgroundColor: DARK, padding: 0, width: 1200, minHeight: 800, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 0 },
    ["connect_hero", "connect_cards", "connect_newsletter", "connect_contact"],
    null
  );

  // --- HERO ---
  nodes["connect_hero"] = container(
    { backgroundColor: DARK, backgroundImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80", padding: 100, width: 1200, minHeight: 400, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 16 },
    ["connect_hero_title", "connect_hero_subtitle"],
    "ROOT"
  );
  nodes["connect_hero_title"] = text(
    { text: "<h1>Join the Movement</h1>", fontSize: 48, textAlign: "center", color: WHITE, width: 800, height: 80 },
    "connect_hero"
  );
  nodes["connect_hero_subtitle"] = text(
    { text: "<p>There is a place for you in the Billion Soul Harvest.</p>", fontSize: 20, textAlign: "center", color: "#cbd5e1", width: 600, height: 50 },
    "connect_hero"
  );

  // --- CARDS ---
  nodes["connect_cards"] = container(
    { backgroundColor: WHITE, padding: 80, width: 1200, minHeight: 350, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 24 },
    ["connect_cards_row"],
    "ROOT"
  );
  nodes["connect_cards_row"] = row(
    { gap: 20, padding: 0, alignItems: "flex-start", justifyContent: "center", backgroundColor: "transparent", minHeight: 250 },
    ["connect_c1", "connect_c2", "connect_c3", "connect_c4"],
    "connect_cards"
  );

  const connectCards = [
    { id: "connect_c1", title: "Partner With Us", desc: "Bring your church, ministry, or organization into alignment with the billion-soul vision." },
    { id: "connect_c2", title: "Invite BSH", desc: "Host a Billion Soul Harvest summit or training event in your city or nation." },
    { id: "connect_c3", title: "Pray With Us", desc: "Join our global prayer network and intercede for the harvest across the nations." },
    { id: "connect_c4", title: "Support the Mission", desc: "Your generosity fuels leader training, summits, and outreach in unreached regions." },
  ];
  for (const c of connectCards) {
    nodes[c.id] = column(
      { width: "23%", minWidth: 200, padding: 24, backgroundColor: LIGHT_GRAY, alignItems: "center", justifyContent: "flex-start", gap: 12 },
      [`${c.id}_title`, `${c.id}_desc`],
      "connect_cards_row"
    );
    nodes[`${c.id}_title`] = text(
      { text: `<h3>${c.title}</h3>`, fontSize: 20, textAlign: "center", color: DARK, width: 200, height: 35 },
      c.id
    );
    nodes[`${c.id}_desc`] = text(
      { text: `<p>${c.desc}</p>`, fontSize: 14, textAlign: "center", color: "#374151", width: 200, height: 80 },
      c.id
    );
  }

  // --- NEWSLETTER ---
  nodes["connect_newsletter"] = container(
    { backgroundColor: DARKER, backgroundImage: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1920&q=80", padding: 80, width: 1200, minHeight: 300, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 20 },
    ["connect_nl_title", "connect_nl_text", "connect_nl_spacer", "connect_nl_btn"],
    "ROOT"
  );
  nodes["connect_nl_title"] = text(
    { text: "<h2>Stay Connected</h2>", fontSize: 36, textAlign: "center", color: WHITE, width: 800, height: 55 },
    "connect_newsletter"
  );
  nodes["connect_nl_text"] = text(
    { text: "<p>Subscribe to our newsletter for updates on global gatherings, testimonials, and ways to get involved in the movement.</p>", fontSize: 16, textAlign: "center", color: "#cbd5e1", width: 600, height: 60 },
    "connect_newsletter"
  );
  nodes["connect_nl_spacer"] = spacer(8, "connect_newsletter");
  nodes["connect_nl_btn"] = button(
    { text: "Subscribe", link: "#", bgColor: CYAN, textColor: WHITE, fontSize: 16, paddingX: 40, paddingY: 14, borderRadius: 8, width: 200 },
    "connect_newsletter"
  );

  // --- CONTACT ---
  nodes["connect_contact"] = container(
    { backgroundColor: WHITE, padding: 80, width: 1200, minHeight: 250, borderRadius: 0, borderColor: "transparent", borderWidth: 0, alignItems: "center", gap: 16 },
    ["connect_contact_title", "connect_contact_text", "connect_contact_email"],
    "ROOT"
  );
  nodes["connect_contact_title"] = text(
    { text: "<h2>Contact Us</h2>", fontSize: 36, textAlign: "center", color: DARK, width: 800, height: 55 },
    "connect_contact"
  );
  nodes["connect_contact_text"] = text(
    { text: "<p>Have questions or want to learn more? We would love to hear from you.</p>", fontSize: 16, textAlign: "center", color: "#374151", width: 600, height: 40 },
    "connect_contact"
  );
  nodes["connect_contact_email"] = text(
    { text: '<p><strong><a href="mailto:info@billionsoulharvest.org">info@billionsoulharvest.org</a></strong></p>', fontSize: 18, textAlign: "center", color: CYAN, width: 400, height: 35 },
    "connect_contact"
  );

  return nodes;
}

// ---------------------------------------------------------------------------
// Main: seed all pages
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding site_pages with Craft.js content...\n");

  const pages = [
    { slug: "home", content: buildHomePage() },
    { slug: "about", content: buildAboutPage() },
    { slug: "initiatives", content: buildInitiativesPage() },
    { slug: "media", content: buildMediaPage() },
    { slug: "connect", content: buildConnectPage() },
  ];

  for (const page of pages) {
    const { data, error } = await supabase
      .from("site_pages")
      .update({ page_content: page.content })
      .eq("slug", page.slug)
      .select("id, slug, title");

    if (error) {
      console.error(`ERROR updating "${page.slug}":`, error.message);
    } else if (!data || data.length === 0) {
      console.warn(`WARN: No row found for slug "${page.slug}" — skipping.`);
    } else {
      const nodeCount = Object.keys(page.content).length;
      console.log(`  Updated "${data[0].title}" (${page.slug}) — ${nodeCount} nodes`);
    }
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
