import { Element } from "@craftjs/core";
import { CraftContainer } from "@/features/events/builder/components/craft-container";
import { CraftSpacer } from "@/features/events/builder/components/craft-spacer";
import { CraftText } from "@/features/events/builder/components/craft-text";
import { CraftImage } from "@/features/events/builder/components/craft-image";
import { CraftRow } from "@/features/events/builder/components/craft-row";
import { CraftColumn } from "@/features/events/builder/components/craft-column";
import { CraftButton } from "@/features/events/builder/components/craft-button";

const HERO_IMG =
  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1400&q=80";
const BODY_IMG =
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80";
const QUOTE_IMG =
  "https://images.unsplash.com/photo-1501770118606-b1d640526693?w=800&q=80";

export const defaultStoryContentChildren = [
  /* ═══════════════════════════════════════════════════════
     HERO SECTION — full-width background image with title
     ═══════════════════════════════════════════════════════ */
  <Element
    key="hero"
    is={CraftContainer}
    canvas
    backgroundImage={HERO_IMG}
    backgroundColor="#0d223f"
    width={1200}
    minHeight={480}
    padding={40}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftSpacer height={100} />
    <CraftText
      text="<p><strong>STORY</strong></p>"
      fontSize={12}
      color="#a9edff"
      textAlign="center"
      width={400}
      height={20}
    />
    <CraftSpacer height={12} />
    <CraftText
      text="<h1>Your Story Title Here</h1>"
      fontSize={52}
      color="#ffffff"
      textAlign="center"
      width={700}
      height={70}
    />
    <CraftSpacer height={16} />
    <CraftText
      text="<p>A brief description or subtitle that captures the essence of this story and draws the reader in.</p>"
      fontSize={17}
      color="rgba(255,255,255,0.8)"
      textAlign="center"
      width={560}
      height={50}
    />
    <CraftSpacer height={100} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     INTRO SECTION — white background with lead paragraph
     ═══════════════════════════════════════════════════════ */
  <Element
    key="intro-section"
    is={CraftContainer}
    canvas
    backgroundColor="#ffffff"
    width={1200}
    minHeight={200}
    padding={60}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftText
      text="<p><strong>THE STORY</strong></p>"
      fontSize={12}
      color="#00b8d4"
      textAlign="center"
      width={400}
      height={20}
    />
    <CraftSpacer height={10} />
    <CraftText
      text="<h2>Introduction</h2>"
      fontSize={36}
      color="#0d223f"
      textAlign="center"
      width={500}
      height={50}
    />
    <CraftSpacer height={24} />
    <CraftText
      text="<p>Write the opening of your story here. This is your chance to set the scene, introduce the key people involved, and give the reader context for what follows. A strong opening draws the reader in and makes them want to keep reading.</p>"
      fontSize={16}
      color="#44474d"
      textAlign="center"
      width={640}
      height={80}
    />
    <CraftSpacer height={12} />
    <CraftText
      text="<p>Continue with additional context or background. You can describe the setting, the challenge that was faced, or the opportunity that arose. Let the narrative unfold naturally.</p>"
      fontSize={16}
      color="#44474d"
      textAlign="center"
      width={640}
      height={70}
    />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     IMAGE + TEXT SECTION — two-column layout
     ═══════════════════════════════════════════════════════ */
  <Element
    key="body-section"
    is={CraftContainer}
    canvas
    backgroundColor="#f9f9ff"
    width={1200}
    minHeight={200}
    padding={60}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <Element
      is={CraftRow}
      canvas
      gap={40}
      padding={0}
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
    >
      <Element
        is={CraftColumn}
        canvas
        width="auto"
        minWidth={280}
        padding={0}
        alignItems="center"
        gap={0}
      >
        <CraftImage
          src={BODY_IMG}
          alt="Story image"
          width={380}
          height={380}
          borderRadius={4}
          objectFit="cover"
        />
      </Element>

      <Element
        is={CraftColumn}
        canvas
        width="auto"
        minWidth={280}
        padding={8}
        alignItems="flex-start"
        gap={0}
      >
        <CraftText
          text="<p><strong>THE JOURNEY</strong></p>"
          fontSize={12}
          color="#00b8d4"
          textAlign="left"
          width={460}
          height={20}
        />
        <CraftSpacer height={10} />
        <CraftText
          text="<h2>What Happened</h2>"
          fontSize={36}
          color="#0d223f"
          textAlign="left"
          width={460}
          height={50}
        />
        <CraftSpacer height={16} />
        <CraftText
          text="<p>Share the heart of the story here. Describe the key moments, turning points, and transformations that took place. Use vivid language to bring the experience to life for the reader.</p>"
          fontSize={16}
          color="#44474d"
          textAlign="left"
          width={460}
          height={80}
        />
        <CraftSpacer height={12} />
        <CraftText
          text="<p>Continue the narrative with additional details. What challenges were overcome? What impact was made? Let the story speak for itself through specific examples and moments.</p>"
          fontSize={16}
          color="#44474d"
          textAlign="left"
          width={460}
          height={70}
        />
      </Element>
    </Element>
  </Element>,

  /* ═══════════════════════════════════════════════════════
     QUOTE / HIGHLIGHT SECTION — dark background
     ═══════════════════════════════════════════════════════ */
  <Element
    key="quote-section"
    is={CraftContainer}
    canvas
    backgroundImage={QUOTE_IMG}
    backgroundColor="#0d223f"
    width={1200}
    minHeight={200}
    padding={80}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftText
      text='<p><em>"Place a powerful quote or key takeaway from the story here. Something that captures the heart of the message and resonates with the reader."</em></p>'
      fontSize={24}
      color="#ffffff"
      textAlign="center"
      width={640}
      height={80}
    />
    <CraftSpacer height={16} />
    <CraftText
      text="<p>— Attribution or Speaker Name</p>"
      fontSize={14}
      color="#a9edff"
      textAlign="center"
      width={400}
      height={24}
    />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     CLOSING / IMPACT SECTION — white background
     ═══════════════════════════════════════════════════════ */
  <Element
    key="closing-section"
    is={CraftContainer}
    canvas
    backgroundColor="#ffffff"
    width={1200}
    minHeight={200}
    padding={60}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftText
      text="<p><strong>THE IMPACT</strong></p>"
      fontSize={12}
      color="#00b8d4"
      textAlign="center"
      width={400}
      height={20}
    />
    <CraftSpacer height={10} />
    <CraftText
      text="<h2>Looking Forward</h2>"
      fontSize={36}
      color="#0d223f"
      textAlign="center"
      width={500}
      height={50}
    />
    <CraftSpacer height={20} />
    <CraftText
      text="<p>Conclude the story with reflections on the impact and what lies ahead. What was accomplished? What seeds were planted for the future? How does this story connect to the larger mission?</p>"
      fontSize={16}
      color="#44474d"
      textAlign="center"
      width={640}
      height={80}
    />
    <CraftSpacer height={32} />
    <CraftButton
      text="Learn More"
      link="#"
      fontSize={16}
      paddingX={36}
      paddingY={16}
      borderRadius={4}
      bgColor="#00b8d4"
      textColor="#ffffff"
    />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     FOOTER — dark background
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
