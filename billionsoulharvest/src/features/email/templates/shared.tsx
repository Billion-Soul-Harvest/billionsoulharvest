import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Font,
} from "@react-email/components";
import type { ReactNode } from "react";

// ── Brand constants (Celestial Harvest design system) ────────────────

export const brand = {
  primary: "#000000",
  primaryContainer: "#0f1c2c",
  secondary: "#006a62",
  cyanBright: "#00E5FF",
  surface: "#f9f9f9",
  surfaceContainerLow: "#f3f3f4",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#1a1c1c",
  onSurfaceVariant: "#44474c",
  outlineVariant: "#c4c6cc",
  white: "#ffffff",
  fontHeadline: "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontBody: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

// ── Shared style objects ─────────────────────────────────────────────

export const styles = {
  main: {
    backgroundColor: brand.surfaceContainerLow,
    fontFamily: brand.fontBody,
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: brand.surfaceContainerLowest,
    overflow: "hidden" as const,
  },
  header: {
    backgroundColor: brand.surfaceContainerLowest,
    padding: "16px 20px",
    textAlign: "center" as const,
    borderBottom: `1px solid ${brand.outlineVariant}`,
  },
  headerText: {
    color: brand.primary,
    fontFamily: brand.fontHeadline,
    fontSize: "22px",
    fontWeight: "800" as const,
    letterSpacing: "-0.02em",
    textTransform: "uppercase" as const,
    margin: "0",
  },
  hr: {
    borderColor: brand.outlineVariant,
    margin: "0",
  },
  footer: {
    backgroundColor: brand.surfaceContainerLow,
    padding: "40px 20px",
    borderTop: `1px solid ${brand.outlineVariant}`,
  },
  footerBrand: {
    fontFamily: brand.fontHeadline,
    fontSize: "14px",
    fontWeight: "700" as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: brand.onSurface,
    textAlign: "center" as const,
    margin: "0 0 12px",
  },
  footerLinks: {
    fontSize: "14px",
    color: brand.onSurfaceVariant,
    textAlign: "center" as const,
    margin: "0 0 12px",
    lineHeight: "1.6",
  },
  footerLink: {
    color: brand.onSurfaceVariant,
    textDecoration: "none",
  },
  footerSmall: {
    color: brand.onSurfaceVariant,
    fontSize: "12px",
    textAlign: "center" as const,
    margin: "0",
    lineHeight: "1.5",
  },
  content: {
    padding: "40px 20px",
  },
  heading: {
    fontFamily: brand.fontHeadline,
    color: brand.primary,
    fontSize: "32px",
    fontWeight: "700" as const,
    letterSpacing: "-0.01em",
    lineHeight: "1.25",
    margin: "0 0 24px",
  },
  paragraph: {
    fontFamily: brand.fontBody,
    color: brand.onSurfaceVariant,
    fontSize: "16px",
    lineHeight: "1.625",
    margin: "0 0 16px",
  },
  detailsBox: {
    backgroundColor: brand.surfaceContainerLow,
    borderRadius: "12px",
    padding: "24px",
    margin: "24px 0",
    border: `1px solid ${brand.outlineVariant}`,
  },
  detailsTitle: {
    fontFamily: brand.fontHeadline,
    color: brand.secondary,
    fontSize: "14px",
    fontWeight: "700" as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    margin: "0 0 16px",
  },
  detailItem: {
    fontFamily: brand.fontBody,
    color: brand.onSurface,
    fontSize: "15px",
    lineHeight: "1.4",
    margin: "0 0 8px",
  },
  unsubscribeLink: {
    color: brand.onSurfaceVariant,
    textDecoration: "underline",
  },
  eyebrowLabel: {
    fontFamily: brand.fontHeadline,
    fontSize: "14px",
    fontWeight: "700" as const,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: brand.onSurfaceVariant,
    margin: "0 0 8px",
  },
} as const;

// ── Button component ─────────────────────────────────────────────────

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
}

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
      <Link
        href={href}
        style={{
          backgroundColor: isPrimary ? brand.secondary : "transparent",
          color: isPrimary ? brand.white : brand.primary,
          border: isPrimary ? "none" : `2px solid ${brand.primary}`,
          padding: "12px 48px",
          borderRadius: "8px",
          fontFamily: brand.fontHeadline,
          fontSize: "16px",
          fontWeight: "600" as const,
          textDecoration: "none",
          display: "inline-block",
          letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

// ── EmailLayout component ────────────────────────────────────────────

interface EmailLayoutProps {
  previewText: string;
  children: ReactNode;
  footerNote?: string;
  unsubscribeUrl?: string;
}

export function EmailLayout({
  previewText,
  children,
  footerNote,
  unsubscribeUrl,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Manrope"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F87jxeN7B.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="Work Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/worksans/v19/QGY_z_wNahGAdqQ43RhVcIgYT2Xz5u32K0nXNigDp6_cOg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.headerText}>Billion Soul Harvest</Text>
          </Section>

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footer}>
            <Text style={styles.footerBrand}>Billion Soul Harvest</Text>
            <Text style={styles.footerLinks}>
              <Link href="#" style={styles.footerLink}>Privacy Policy</Link>
              {"  ·  "}
              <Link href="#" style={styles.footerLink}>Contact Us</Link>
              {unsubscribeUrl && (
                <>
                  {"  ·  "}
                  <Link href={unsubscribeUrl} style={styles.footerLink}>Unsubscribe</Link>
                </>
              )}
            </Text>
            <Text style={styles.footerSmall}>
              © {new Date().getFullYear()} Billion Soul Harvest. All rights reserved.
            </Text>
            {footerNote && (
              <Text style={{ ...styles.footerSmall, marginTop: "8px" }}>
                {footerNote}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
