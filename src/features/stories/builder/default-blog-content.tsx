import { Element } from "@craftjs/core";
import { CraftContainer } from "@/features/events/builder/components/craft-container";
import { CraftSpacer } from "@/features/events/builder/components/craft-spacer";
import { CraftText } from "@/features/events/builder/components/craft-text";
import { CraftImage } from "@/features/events/builder/components/craft-image";
import { CraftDivider } from "@/features/events/builder/components/craft-divider";

const BANNER_IMG =
  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1400&q=80";
const BODY_IMG =
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80";

export const defaultBlogContentChildren = [
  /* ═══════════════════════════════════════════════════════
     BANNER — full-width background image, no text overlay
     ═══════════════════════════════════════════════════════ */
  <Element
    key="banner"
    is={CraftContainer}
    canvas
    backgroundColor="transparent"
    backgroundImage={BANNER_IMG}
    width={1200}
    minHeight={350}
    padding={0}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftSpacer height={350} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     TITLE + META — centered heading and author/date line
     ═══════════════════════════════════════════════════════ */
  <Element
    key="title-meta"
    is={CraftContainer}
    canvas
    backgroundColor="#ffffff"
    width={1200}
    minHeight={100}
    padding={40}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftSpacer height={20} />
    <CraftText
      text="<h1>Your Story Title Here</h1>"
      fontSize={40}
      color="#0d223f"
      textAlign="center"
      width={720}
      height={55}
    />
    <CraftSpacer height={12} />
    <CraftText
      text="<p>By Author Name &bull; July 15, 2026</p>"
      fontSize={14}
      color="#999999"
      textAlign="center"
      width={720}
      height={24}
    />
    <CraftSpacer height={20} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     LEAD PARAGRAPH — intro text
     ═══════════════════════════════════════════════════════ */
  <Element
    key="lead"
    is={CraftContainer}
    canvas
    backgroundColor="#ffffff"
    width={1200}
    minHeight={80}
    padding={0}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftText
      text="<p>Write your opening paragraph here. This is the lead — a compelling introduction that draws readers in and sets the stage for the story that follows. Make it vivid, make it personal, make them want to keep reading.</p>"
      fontSize={18}
      color="#333333"
      textAlign="left"
      width={720}
      height={80}
    />
    <CraftSpacer height={32} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     BODY SECTION 1 — subheading, text, image, caption
     ═══════════════════════════════════════════════════════ */
  <Element
    key="body-1"
    is={CraftContainer}
    canvas
    backgroundColor="#ffffff"
    width={1200}
    minHeight={200}
    padding={0}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftText
      text="<h2>The Beginning</h2>"
      fontSize={28}
      color="#0d223f"
      textAlign="left"
      width={720}
      height={40}
    />
    <CraftSpacer height={16} />
    <CraftText
      text="<p>Continue your story here with the first major section. Describe the setting, the people involved, and the circumstances that brought everything together. Use concrete details and let the narrative unfold naturally.</p>"
      fontSize={16}
      color="#44474d"
      textAlign="left"
      width={720}
      height={70}
    />
    <CraftSpacer height={12} />
    <CraftText
      text="<p>Add another paragraph to develop this section further. Good storytelling builds momentum — each paragraph should pull the reader forward into the next.</p>"
      fontSize={16}
      color="#44474d"
      textAlign="left"
      width={720}
      height={60}
    />
    <CraftSpacer height={24} />
    <CraftImage
      src={BODY_IMG}
      alt="Story image"
      width={720}
      height={400}
      borderRadius={8}
      objectFit="cover"
    />
    <CraftSpacer height={8} />
    <CraftText
      text="<p><em>A caption describing this image and its relevance to the story.</em></p>"
      fontSize={13}
      color="#999999"
      textAlign="center"
      width={720}
      height={24}
    />
    <CraftSpacer height={40} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     BODY SECTION 2 — subheading and more body paragraphs
     ═══════════════════════════════════════════════════════ */
  <Element
    key="body-2"
    is={CraftContainer}
    canvas
    backgroundColor="#ffffff"
    width={1200}
    minHeight={200}
    padding={0}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftText
      text="<h2>What Happened Next</h2>"
      fontSize={28}
      color="#0d223f"
      textAlign="left"
      width={720}
      height={40}
    />
    <CraftSpacer height={16} />
    <CraftText
      text="<p>This section covers the heart of the story — the turning point, the key moments, the transformation. Write with specificity: names, places, dialogue, and sensory details make stories come alive.</p>"
      fontSize={16}
      color="#44474d"
      textAlign="left"
      width={720}
      height={70}
    />
    <CraftSpacer height={12} />
    <CraftText
      text="<p>Continue building the narrative. What challenges were faced? What breakthroughs occurred? Let the reader experience the journey alongside the people in the story.</p>"
      fontSize={16}
      color="#44474d"
      textAlign="left"
      width={720}
      height={60}
    />
    <CraftSpacer height={40} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     CONCLUSION — divider and closing paragraph
     ═══════════════════════════════════════════════════════ */
  <Element
    key="conclusion"
    is={CraftContainer}
    canvas
    backgroundColor="#ffffff"
    width={1200}
    minHeight={100}
    padding={0}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftDivider
      color="#e5e7eb"
      thickness={1}
      widthPercent={60}
    />
    <CraftSpacer height={32} />
    <CraftText
      text="<p>Close the story with reflection and forward-looking thoughts. What was the lasting impact? What does this mean for the future? Leave the reader with something to carry with them.</p>"
      fontSize={16}
      color="#44474d"
      textAlign="left"
      width={720}
      height={70}
    />
    <CraftSpacer height={40} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     FOOTER — dark background with copyright
     ═══════════════════════════════════════════════════════ */
  <Element
    key="footer-section"
    is={CraftContainer}
    canvas
    backgroundColor="#0d223f"
    width={1200}
    minHeight={40}
    padding={32}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftText
      text="<p>&copy; 2026 Billion Soul Harvest. All rights reserved.</p>"
      fontSize={12}
      color="rgba(255,255,255,0.5)"
      textAlign="center"
      width={400}
      height={20}
    />
  </Element>,
];
