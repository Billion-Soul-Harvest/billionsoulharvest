import { Element } from "@craftjs/core";
import { CraftContainer } from "./components/craft-container";
import { CraftHeader } from "./components/craft-header";
import { CraftSpacer } from "./components/craft-spacer";
import { CraftText } from "./components/craft-text";
import { CraftDivider } from "./components/craft-divider";
import { CraftImage } from "./components/craft-image";
import { CraftRow } from "./components/craft-row";
import { CraftColumn } from "./components/craft-column";
import {
  CraftEventTitle,
  CraftEventDates,
  CraftEventLocation,
  CraftRegisterButton,
} from "./components/event-data";

// Speaker headshots from reference design
const SPEAKER_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDdI4ywQTUjfM2buoyhTuf-VpWZPfamvA-4oeR-mj-p-D6RVWIIIxXpcunqd2dX5yaYrtbVu3rltAWOoodT3OOHONmr_T92cQrb6LhBnQDvW1TBuirn7pMLEJE6892TX7q7jXTvKZ9-6kHR8VPCGTGDKwJx20AHteOgYTDNoSEsKB0K0ypR30U6EAlZzPcLv05j3QOsi5LFARFruHSR6DksIr0EjFamUVHmii2jDGCXI2Yi9m_b5srAT1NdHBf275eIvFo-I1uIKCuI";
const SPEAKER_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAcRofMucw9D9ABs4Cbo3CFutUwhGCw6LUnpc4q6nmreMLxv873GyxNqPZB3UP-phhl8kGhmhD88jq4LA_XXSJyL_aaOsixZemKk2PY5Vnpjacd0yr_QYKpaK5nX0xXDw81bdrClnieXWQ5fCDw0o9D9gYN74juKLd8wov0lbEiz0ArseisVfCFF9bL3D2clN_ciuc0RIlaat0bm2vrLsQ8dTdQlkVZ-uGxAJuFFtQGQY1BGgWK7SlYrQVB96Ve9D3pdfNDkN2F5ahr";
const SPEAKER_3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBPkRnjfdNeVHK6TiXG_d5SdNRMTkTNwSXU2P4ebnI7QTHIxW4qp5PKv8pg1iUcgZxmoaHjeLE6h6QF5RZ-5YNs7BrOYMdTnTgjTKOSIvRHLLcWrm2AgqHFZLaMqvUcd00bSzeBmzDFoUU9xk5vSp6_KJqVef-4bfBOgZosrlGQAGhMGqWMalXvJ3AZ65ns6ndq8w2_Cz-8WO0m15yuaob1ybi3YSFh-8ZS6F-EuMbfLV2eL7qIj7SCNFOz5gLZtNc2yiypQDjDBR7q";
const ABOUT_IMG =
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80";
const HERO_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80";

export const defaultContentChildren = [
  /* ═══════════════════════════════════════════════════════
     HEADER
     ═══════════════════════════════════════════════════════ */
  <CraftHeader
    key="header"
    backgroundColor="#0a1e35"
    navLinks="Home, About, Speakers, Schedule"
  />,

  /* ═══════════════════════════════════════════════════════
     HERO SECTION — background image with overlay content
     ═══════════════════════════════════════════════════════ */
  <Element
    key="hero"
    is={CraftContainer}
    canvas
    backgroundImage={HERO_IMG}
    backgroundColor="rgba(10,30,53,0.75)"
    width={1200}
    minHeight={560}
    padding={40}
    borderRadius={0}
    borderColor="transparent"
    borderWidth={0}
    alignItems="center"
  >
    <CraftSpacer height={80} />
    <CraftEventTitle fontSize={56} color="#ffffff" textAlign="center" />
    <CraftSpacer height={20} />
    <CraftEventDates fontSize={16} color="#D4A843" textAlign="center" />
    <CraftSpacer height={6} />
    <CraftEventLocation fontSize={15} color="#ffffff" textAlign="center" />
    <CraftSpacer height={20} />
    <CraftText
      text="<p>Join an assembly of world-class leaders, pastors, and missionaries for a transformative gathering advancing the Great Commission across every nation.</p>"
      fontSize={17}
      color="#d4e3ff"
      textAlign="center"
      width={560}
      height={60}
    />
    <CraftSpacer height={40} />
    <CraftRegisterButton
      fontSize={16}
      paddingX={36}
      paddingY={16}
      borderRadius={4}
    />
    <CraftSpacer height={80} />
  </Element>,

  /* ═══════════════════════════════════════════════════════
     ABOUT SECTION — two-column layout
     ═══════════════════════════════════════════════════════ */
  <CraftDivider key="div-about" color="#ffffff12" widthPercent={100} />,
  <CraftSpacer key="about-top" height={80} />,

  <Element
    key="about-row"
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
        src={ABOUT_IMG}
        alt="Event atmosphere"
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
        text="<p><strong>THE VISION</strong></p>"
        fontSize={12}
        color="#D4A843"
        textAlign="left"
        width={460}
        height={20}
      />
      <CraftSpacer height={10} />
      <CraftText
        text="<h2>About the Event</h2>"
        fontSize={36}
        color="#ffffff"
        textAlign="left"
        width={460}
        height={50}
      />
      <CraftSpacer height={16} />
      <CraftText
        text="<p>This is not just a conference — it is a catalytic gathering designed to equip and mobilize leaders for the harvest ahead. We bring together the brightest minds in missions, church planting, and leadership development.</p>"
        fontSize={16}
        color="#bcc9cc"
        textAlign="left"
        width={460}
        height={80}
      />
      <CraftSpacer height={12} />
      <CraftText
        text="<p>For multiple days we gather leaders from every continent, exploring strategies for church multiplication, unreached people engagement, and spiritual transformation.</p>"
        fontSize={16}
        color="#bcc9cc"
        textAlign="left"
        width={460}
        height={70}
      />
    </Element>
  </Element>,

  <CraftSpacer key="about-bottom" height={80} />,

  /* ═══════════════════════════════════════════════════════
     SPEAKERS SECTION — three-column layout
     ═══════════════════════════════════════════════════════ */
  <CraftDivider key="div-speakers" color="#ffffff12" widthPercent={100} />,
  <CraftSpacer key="spk-top" height={80} />,
  <CraftText
    key="spk-label"
    text="<p><strong>FEATURED SPEAKERS</strong></p>"
    fontSize={12}
    color="#D4A843"
    textAlign="center"
    width={400}
    height={20}
  />,
  <CraftSpacer key="spk-label-gap" height={10} />,
  <CraftText
    key="spk-heading"
    text="<h2>Our Speakers</h2>"
    fontSize={36}
    color="#ffffff"
    textAlign="center"
    width={500}
    height={50}
  />,
  <CraftSpacer key="spk-heading-gap" height={48} />,

  <Element
    key="speakers-row"
    is={CraftRow}
    canvas
    gap={16}
    padding={0}
    justifyContent="center"
    alignItems="flex-start"
    flexWrap="wrap"
  >
    {/* Speaker 1 */}
    <Element
      is={CraftColumn}
      canvas
      width="auto"
      minWidth={240}
      padding={16}
      alignItems="center"
      gap={6}
    >
      <CraftImage
        src={SPEAKER_1}
        alt="Speaker"
        width={200}
        height={200}
        borderRadius={100}
        objectFit="cover"
      />
      <CraftSpacer height={12} />
      <CraftText
        text="<p><strong>Dr. Elena Volkov</strong></p>"
        fontSize={18}
        color="#ffffff"
        textAlign="center"
        width={220}
        height={28}
      />
      <CraftText
        text="<p><strong>DIRECTOR OF OUTREACH</strong></p>"
        fontSize={11}
        color="#D4A843"
        textAlign="center"
        width={220}
        height={18}
      />
      <CraftSpacer height={4} />
      <CraftText
        text="<p>Pioneering global strategies for reaching unreached communities with the Gospel.</p>"
        fontSize={14}
        color="#bcc9cc"
        textAlign="center"
        width={220}
        height={50}
      />
    </Element>

    {/* Speaker 2 */}
    <Element
      is={CraftColumn}
      canvas
      width="auto"
      minWidth={240}
      padding={16}
      alignItems="center"
      gap={6}
    >
      <CraftImage
        src={SPEAKER_2}
        alt="Speaker"
        width={200}
        height={200}
        borderRadius={100}
        objectFit="cover"
      />
      <CraftSpacer height={12} />
      <CraftText
        text="<p><strong>Marcus Chen</strong></p>"
        fontSize={18}
        color="#ffffff"
        textAlign="center"
        width={220}
        height={28}
      />
      <CraftText
        text="<p><strong>LEAD PASTOR</strong></p>"
        fontSize={11}
        color="#D4A843"
        textAlign="center"
        width={220}
        height={18}
      />
      <CraftSpacer height={4} />
      <CraftText
        text="<p>Reshaping church culture through intentional discipleship and multiplication.</p>"
        fontSize={14}
        color="#bcc9cc"
        textAlign="center"
        width={220}
        height={50}
      />
    </Element>

    {/* Speaker 3 */}
    <Element
      is={CraftColumn}
      canvas
      width="auto"
      minWidth={240}
      padding={16}
      alignItems="center"
      gap={6}
    >
      <CraftImage
        src={SPEAKER_3}
        alt="Speaker"
        width={200}
        height={200}
        borderRadius={100}
        objectFit="cover"
      />
      <CraftSpacer height={12} />
      <CraftText
        text="<p><strong>Anya Sterling</strong></p>"
        fontSize={18}
        color="#ffffff"
        textAlign="center"
        width={220}
        height={28}
      />
      <CraftText
        text="<p><strong>MISSIONS STRATEGIST</strong></p>"
        fontSize={11}
        color="#D4A843"
        textAlign="center"
        width={220}
        height={18}
      />
      <CraftSpacer height={4} />
      <CraftText
        text="<p>Exploring the blueprints for tomorrow's mission fields and kingdom impact.</p>"
        fontSize={14}
        color="#bcc9cc"
        textAlign="center"
        width={220}
        height={50}
      />
    </Element>
  </Element>,

  <CraftSpacer key="spk-bottom" height={80} />,

  /* ═══════════════════════════════════════════════════════
     SCHEDULE SECTION
     ═══════════════════════════════════════════════════════ */
  <CraftDivider key="div-schedule" color="#ffffff12" widthPercent={100} />,
  <CraftSpacer key="sched-top" height={80} />,
  <CraftText
    key="sched-label"
    text="<p><strong>THE PROGRAM</strong></p>"
    fontSize={12}
    color="#D4A843"
    textAlign="center"
    width={400}
    height={20}
  />,
  <CraftSpacer key="sched-label-gap" height={10} />,
  <CraftText
    key="sched-heading"
    text="<h2>Schedule</h2>"
    fontSize={36}
    color="#ffffff"
    textAlign="center"
    width={500}
    height={50}
  />,
  <CraftSpacer key="sched-gap" height={20} />,
  <CraftText
    key="sched-body"
    text='<p><strong>Day 1</strong> — Registration &amp; Opening Ceremony<br><strong>Day 2</strong> — Keynote Sessions &amp; Workshops<br><strong>Day 3</strong> — Breakout Groups &amp; Networking<br><strong>Day 4</strong> — Commissioning &amp; Closing Celebration</p>'
    fontSize={16}
    color="#bcc9cc"
    textAlign="center"
    width={520}
    height={120}
  />,
  <CraftSpacer key="sched-bottom" height={80} />,

  /* ═══════════════════════════════════════════════════════
     CTA SECTION
     ═══════════════════════════════════════════════════════ */
  <CraftDivider key="div-cta" color="#ffffff12" widthPercent={100} />,
  <CraftSpacer key="cta-top" height={100} />,
  <CraftText
    key="cta-heading"
    text="<h2>Don't Miss Out</h2>"
    fontSize={42}
    color="#ffffff"
    textAlign="center"
    width={500}
    height={56}
  />,
  <CraftSpacer key="cta-text-gap" height={16} />,
  <CraftText
    key="cta-body"
    text="<p>Secure your spot today and be part of what God is doing across the nations. Space is limited.</p>"
    fontSize={17}
    color="#bcc9cc"
    textAlign="center"
    width={480}
    height={50}
  />,
  <CraftSpacer key="cta-btn-gap" height={36} />,
  <CraftRegisterButton
    key="cta-btn"
    fontSize={16}
    paddingX={36}
    paddingY={16}
    borderRadius={4}
  />,
  <CraftSpacer key="cta-bottom" height={100} />,

  /* ═══════════════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════════════ */
  <CraftDivider key="div-footer" color="#ffffff08" />,
  <CraftSpacer key="footer-top" height={32} />,
  <CraftText
    key="footer-text"
    text="<p>&copy; 2026 Billion Soul Harvest. All rights reserved.</p>"
    fontSize={12}
    color="#D4A843"
    textAlign="center"
    width={400}
    height={20}
  />,
  <CraftSpacer key="footer-bottom" height={32} />,
];
