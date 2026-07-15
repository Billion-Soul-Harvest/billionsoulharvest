import { Element } from "@craftjs/core";
import { CraftContainer } from "@/features/events/builder/components/craft-container";
import { CraftSpacer } from "@/features/events/builder/components/craft-spacer";
import { CraftText } from "@/features/events/builder/components/craft-text";
import { CraftImage } from "@/features/events/builder/components/craft-image";
import { CraftCarousel } from "@/features/events/builder/components/craft-carousel";
import { CraftRow } from "@/features/events/builder/components/craft-row";
import { CraftColumn } from "@/features/events/builder/components/craft-column";
import { CraftDivider } from "@/features/events/builder/components/craft-divider";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80",
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&q=80",
  "https://images.unsplash.com/photo-1501770118606-b1d640526693?w=1200&q=80",
];

const GRID_IMG_1 =
  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80";
const GRID_IMG_2 =
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80";
const GRID_IMG_3 =
  "https://images.unsplash.com/photo-1501770118606-b1d640526693?w=600&q=80";

export const defaultGalleryContentChildren = [
  /* ═══════════════════════════════════════════════════════
     HERO CAROUSEL — full-width image slideshow
     ═══════════════════════════════════════════════════════ */
  <Element
    key="hero-carousel"
    is={CraftContainer}
    canvas
    backgroundColor="#0d223f"
    width={1200}
    minHeight={500}
    padding={0}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftCarousel
      images={GALLERY_IMAGES}
      width={1200}
      height={500}
      borderRadius={0}
      autoPlay
      interval={5000}
    />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     TITLE + DESCRIPTION
     ═══════════════════════════════════════════════════════ */
  <Element
    key="title-section"
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
      text="<h1><strong>Photo Gallery Title</strong></h1>"
      fontSize={40}
      color="#0d223f"
      textAlign="center"
      width={720}
      height={55}
    />
    <CraftSpacer height={12} />
    <CraftText
      text="<p>A brief description of this photo collection and the story behind the images.</p>"
      fontSize={16}
      color="#666666"
      textAlign="center"
      width={720}
      height={30}
    />
    <CraftSpacer height={20} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     TEXT SECTION — introduction
     ═══════════════════════════════════════════════════════ */
  <Element
    key="intro-text"
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
      text="<p>Write the story behind these photos. Describe the event, the location, the people, and the moments captured. Let the images speak, but give your readers the context to truly appreciate what they're seeing.</p>"
      fontSize={18}
      color="#44474d"
      textAlign="left"
      width={720}
      height={70}
    />
    <CraftSpacer height={40} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     IMAGE GRID — 3-column with captions
     ═══════════════════════════════════════════════════════ */
  <Element
    key="image-grid"
    is={CraftContainer}
    canvas
    backgroundColor="#f9f9ff"
    width={1200}
    minHeight={200}
    padding={40}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <Element
      is={CraftRow}
      canvas
      gap={24}
      padding={0}
      alignItems="flex-start"
      justifyContent="center"
      flexWrap="wrap"
    >
      <Element
        is={CraftColumn}
        canvas
        width="auto"
        minWidth={200}
        padding={0}
        alignItems="center"
        gap={0}
      >
        <CraftImage
          src={GRID_IMG_1}
          alt="Gallery image 1"
          width={340}
          height={260}
          borderRadius={8}
          objectFit="cover"
        />
        <CraftSpacer height={8} />
        <CraftText
          text="<p><em>Caption for this photo</em></p>"
          fontSize={13}
          color="#999999"
          textAlign="center"
          width={340}
          height={24}
        />
      </Element>

      <Element
        is={CraftColumn}
        canvas
        width="auto"
        minWidth={200}
        padding={0}
        alignItems="center"
        gap={0}
      >
        <CraftImage
          src={GRID_IMG_2}
          alt="Gallery image 2"
          width={340}
          height={260}
          borderRadius={8}
          objectFit="cover"
        />
        <CraftSpacer height={8} />
        <CraftText
          text="<p><em>Caption for this photo</em></p>"
          fontSize={13}
          color="#999999"
          textAlign="center"
          width={340}
          height={24}
        />
      </Element>

      <Element
        is={CraftColumn}
        canvas
        width="auto"
        minWidth={200}
        padding={0}
        alignItems="center"
        gap={0}
      >
        <CraftImage
          src={GRID_IMG_3}
          alt="Gallery image 3"
          width={340}
          height={260}
          borderRadius={8}
          objectFit="cover"
        />
        <CraftSpacer height={8} />
        <CraftText
          text="<p><em>Caption for this photo</em></p>"
          fontSize={13}
          color="#999999"
          textAlign="center"
          width={340}
          height={24}
        />
      </Element>
    </Element>
  </Element>,

  /* ═══════════════════════════════════════════════════════
     CLOSING TEXT
     ═══════════════════════════════════════════════════════ */
  <Element
    key="closing"
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
    <CraftSpacer height={40} />
    <CraftDivider
      color="#e5e7eb"
      thickness={1}
      widthPercent={60}
    />
    <CraftSpacer height={32} />
    <CraftText
      text="<p>Close with final thoughts about the photo collection. Share what these moments mean and how they connect to the larger story.</p>"
      fontSize={18}
      color="#44474d"
      textAlign="left"
      width={720}
      height={50}
    />
    <CraftSpacer height={40} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     FOOTER
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
