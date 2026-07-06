import type { Event, RegistrationConfig } from "@/shared/types/database";
import Link from "next/link";
import { InlineRegistrationForm } from "@/features/registration/inline-registration-form";

function hexToRgba(hex: string, alpha: number): string {
  if (hex === "transparent") return `rgba(0,0,0,${alpha})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

interface CraftNode {
  type: { resolvedName: string };
  props: Record<string, unknown>;
  nodes: string[];
  linkedNodes?: Record<string, string>;
  isCanvas?: boolean;
}

interface CraftJSON {
  [nodeId: string]: CraftNode;
}

interface NavPage {
  title: string;
  slug: string;
}

interface Props {
  content: CraftJSON;
  event: Event;
  pages?: NavPage[];
}

export function CraftPageRenderer({ content, event, pages = [] }: Props) {
  const rootNode = content["ROOT"];
  if (!rootNode) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {rootNode.nodes.map((nodeId) => (
        <RenderNode key={nodeId} nodeId={nodeId} nodes={content} event={event} pages={pages} />
      ))}
    </div>
  );
}

function RenderNode({
  nodeId,
  nodes,
  event,
  pages = [],
}: {
  nodeId: string;
  nodes: CraftJSON;
  event: Event;
  pages?: NavPage[];
}) {
  const node = nodes[nodeId];
  if (!node) return null;

  const { resolvedName } = node.type;
  const props = node.props;
  const children = node.nodes.map((childId) => (
    <RenderNode key={childId} nodeId={childId} nodes={nodes} event={event} pages={pages} />
  ));

  switch (resolvedName) {
    case "CraftText":
      return (
        <div
          style={{
            fontSize: `${props.fontSize ?? 16}px`,
            textAlign: (props.textAlign as React.CSSProperties["textAlign"]) ?? "left",
            color: (props.color as string) ?? "#ffffff",
            width: `${props.width ?? 400}px`,
            maxWidth: "100%",
            minHeight: `${props.height ?? 40}px`,
          }}
          dangerouslySetInnerHTML={{ __html: (props.text as string) ?? "" }}
        />
      );

    case "CraftImage": {
      const imgW = (props.width as number) ?? 400;
      const imgH = (props.height as number) ?? 300;
      return (props.src as string) ? (
        <img
          src={props.src as string}
          alt={(props.alt as string) ?? ""}
          style={{
            width: imgW,
            maxWidth: "100%",
            aspectRatio: `${imgW} / ${imgH}`,
            height: "auto",
            borderRadius: (props.borderRadius as number) ?? 0,
            objectFit: (props.objectFit as React.CSSProperties["objectFit"]) ?? "cover",
            display: "block",
          }}
        />
      ) : null;
    }

    case "CraftButton": {
      const link = (props.link as string) ?? "#";
      return (
        <a
          href={link}
          style={{
            display: "inline-block",
            width: (props.width as number) ?? 200,
            maxWidth: "100%",
            backgroundColor: (props.bgColor as string) ?? "#29BDD6",
            color: (props.textColor as string) ?? "#ffffff",
            fontSize: (props.fontSize as number) ?? 16,
            paddingLeft: (props.paddingX as number) ?? 32,
            paddingRight: (props.paddingX as number) ?? 32,
            paddingTop: (props.paddingY as number) ?? 16,
            paddingBottom: (props.paddingY as number) ?? 16,
            borderRadius: (props.borderRadius as number) ?? 12,
            textAlign: "center",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {(props.text as string) ?? "Click Me"}
        </a>
      );
    }

    case "CraftVideo": {
      const url = (props.url as string) ?? "";
      const embedUrl = getEmbedUrl(url);
      return embedUrl ? (
        <iframe
          src={embedUrl}
          width={(props.width as number) ?? 560}
          height={(props.height as number) ?? 315}
          style={{ border: "none", borderRadius: 4, maxWidth: "100%" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : null;
    }

    case "CraftRow":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: `${props.gap ?? 16}px`,
            padding: `${props.padding ?? 0}px`,
            alignItems: (props.alignItems as React.CSSProperties["alignItems"]) ?? "stretch",
            justifyContent: (props.justifyContent as React.CSSProperties["justifyContent"]) ?? "flex-start",
            flexWrap: (props.flexWrap as React.CSSProperties["flexWrap"]) ?? "wrap",
            backgroundColor: (props.backgroundColor as string) ?? "transparent",
            minHeight: `${props.minHeight ?? 60}px`,
            width: "100%",
          }}
        >
          {children}
        </div>
      );

    case "CraftColumn": {
      const colWidth = (props.width as string) ?? "50%";
      const colMinWidth = (props.minWidth as number) ?? 0;
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: colWidth,
            flex: colWidth === "auto" ? "1 1 0%" : undefined,
            minWidth: colMinWidth > 0 ? `${colMinWidth}px` : 0,
            padding: `${props.padding ?? 12}px`,
            backgroundColor: (props.backgroundColor as string) ?? "transparent",
            alignItems: (props.alignItems as React.CSSProperties["alignItems"]) ?? "stretch",
            justifyContent: (props.justifyContent as React.CSSProperties["justifyContent"]) ?? "flex-start",
            gap: `${props.gap ?? 8}px`,
          }}
        >
          {children}
        </div>
      );
    }

    case "CraftContainer": {
      const bgImage = props.backgroundImage as string;
      const bgColor = (props.backgroundColor as string) ?? "transparent";
      const containerAlignItems = props.alignItems as string | undefined;
      const containerGap = (props.gap as number) ?? 0;
      return (
        <div
          style={{
            backgroundColor: bgImage ? undefined : bgColor,
            backgroundImage: bgImage
              ? `linear-gradient(${hexToRgba(bgColor, 0.6)}, ${hexToRgba(bgColor, 0.6)}), url(${bgImage})`
              : undefined,
            backgroundSize: bgImage ? "cover" : undefined,
            backgroundPosition: bgImage ? "center" : undefined,
            padding: `${props.padding ?? 20}px`,
            borderRadius: `${props.borderRadius ?? 0}px`,
            borderColor: (props.borderColor as string) ?? "transparent",
            borderWidth: `${props.borderWidth ?? 0}px`,
            borderStyle: ((props.borderWidth as number) ?? 0) > 0 ? "solid" : "none",
            width: `${props.width ?? 600}px`,
            maxWidth: "100%",
            minHeight: `${props.minHeight ?? 200}px`,
            ...(containerAlignItems ? {
              display: "flex",
              flexDirection: "column" as const,
              alignItems: containerAlignItems as React.CSSProperties["alignItems"],
            } : {}),
            ...(containerGap > 0 ? { gap: `${containerGap}px` } : {}),
          }}
        >
          {children}
        </div>
      );
    }

    case "CraftSpacer":
      return (
        <div style={{ height: `${props.height ?? 40}px`, width: "100%" }} />
      );

    case "CraftHeader":
      // Skip — the site-level EventSiteHeader already renders navigation
      return null;

    case "CraftDivider":
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: `${props.marginY ?? 16}px`,
            paddingBottom: `${props.marginY ?? 16}px`,
          }}
        >
          <hr
            style={{
              border: "none",
              borderTop: `${props.thickness ?? 1}px solid ${(props.color as string) ?? "#ffffff20"}`,
              width: `${props.widthPercent ?? 100}%`,
              margin: 0,
            }}
          />
        </div>
      );

    case "CraftEventTitle":
      return (
        <div
          style={{
            fontSize: `${props.fontSize ?? 48}px`,
            color: (props.color as string) ?? "#ffffff",
            textAlign: (props.textAlign as React.CSSProperties["textAlign"]) ?? "center",
            maxWidth: "100%",
            overflowWrap: "break-word",
          }}
          className="font-[family-name:var(--font-heading)] font-bold"
        >
          {event.title}
        </div>
      );

    case "CraftEventDates": {
      const formatDate = (date: string) =>
        new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

      return (
        <div
          style={{
            fontSize: `${props.fontSize ?? 16}px`,
            color: (props.color as string) ?? "#d1d5db",
            textAlign: (props.textAlign as React.CSSProperties["textAlign"]) ?? "center",
            maxWidth: "100%",
          }}
        >
          {event.start_date ? (
            <>
              {formatDate(event.start_date)}
              {event.end_date && ` – ${formatDate(event.end_date)}`}
            </>
          ) : (
            "Event dates TBD"
          )}
        </div>
      );
    }

    case "CraftEventLocation": {
      const location = [event.location, event.city, event.country].filter(Boolean).join(", ");
      return (
        <div
          style={{
            fontSize: `${props.fontSize ?? 16}px`,
            color: (props.color as string) ?? "#d1d5db",
            textAlign: (props.textAlign as React.CSSProperties["textAlign"]) ?? "center",
            maxWidth: "100%",
          }}
        >
          {location || "Location TBD"}
        </div>
      );
    }

    case "CraftRegisterButton":
      return event.status === "registration_open" ? (
        <Link
          href={`/register/${event.slug}`}
          style={{
            display: "inline-block",
            backgroundColor: (props.bgColor as string) ?? "#29BDD6",
            color: (props.textColor as string) ?? "#ffffff",
            fontSize: `${props.fontSize ?? 18}px`,
            padding: `${props.paddingY ?? 16}px ${props.paddingX ?? 32}px`,
            borderRadius: `${props.borderRadius ?? 12}px`,
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          {(props.text as string) ?? "Register Now"}
        </Link>
      ) : null;

    case "CraftEmbed": {
      const embedUrl = (props.url as string) ?? "";
      if (!embedUrl) return null;
      return (
        <iframe
          src={embedUrl}
          style={{
            width: (props.width as number) ?? 600,
            height: (props.height as number) ?? 400,
            maxWidth: "100%",
            border: "none",
            borderRadius: (props.borderRadius as number) ?? 4,
          }}
          allowFullScreen
          loading="lazy"
          title={(props.embedType as string) ?? "Embed"}
        />
      );
    }

    case "CraftSocialLinks": {
      const socialLinks = (props.links as Array<{ platform: string; url: string }>) ?? [];
      const socialGap = (props.gap as number) ?? 16;
      const socialAlignment = (props.alignment as string) ?? "center";
      const socialJustify = socialAlignment === "left" ? "flex-start" : socialAlignment === "right" ? "flex-end" : "center";
      return (
        <div
          style={{
            display: "flex",
            gap: `${socialGap}px`,
            justifyContent: socialJustify,
            alignItems: "center",
            padding: "8px 0",
            width: "100%",
          }}
        >
          {socialLinks
            .filter((l) => l.url)
            .map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <SocialIcon platform={link.platform} color={(props.iconColor as string) ?? "#ffffff"} size={(props.iconSize as number) ?? 24} />
              </a>
            ))}
        </div>
      );
    }

    case "CraftMap": {
      const mapAddress = (props.address as string) ?? "";
      const mapZoom = (props.zoom as number) ?? 14;
      if (!mapAddress) return null;
      const mapQ = encodeURIComponent(mapAddress);
      return (
        <iframe
          src={`https://www.google.com/maps?q=${mapQ}&z=${mapZoom}&output=embed`}
          style={{
            width: (props.width as number) ?? 600,
            maxWidth: "100%",
            aspectRatio: `${(props.width as number) ?? 600} / ${(props.height as number) ?? 400}`,
            border: "none",
            borderRadius: (props.borderRadius as number) ?? 8,
            display: "block",
          }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      );
    }

    case "CraftYouTube": {
      const ytUrl = (props.url as string) ?? "";
      const ytMatch = ytUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
      if (!ytMatch) return null;
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          style={{
            width: (props.width as number) ?? 600,
            maxWidth: "100%",
            aspectRatio: `${(props.width as number) ?? 600} / ${(props.height as number) ?? 340}`,
            border: "none",
            borderRadius: (props.borderRadius as number) ?? 8,
            display: "block",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    case "CraftCarousel": {
      const carouselImages = (props.images as string[]) ?? [];
      if (carouselImages.length === 0) return null;
      const carouselW = (props.width as number) ?? 600;
      const carouselH = (props.height as number) ?? 400;
      const carouselRadius = (props.borderRadius as number) ?? 8;
      // Server-rendered: CSS scroll-snap carousel
      return (
        <div
          style={{
            width: carouselW,
            maxWidth: "100%",
            aspectRatio: `${carouselW} / ${carouselH}`,
            borderRadius: carouselRadius,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              width: "100%",
              height: "100%",
            }}
          >
            {carouselImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Slide ${i + 1}`}
                style={{
                  minWidth: "100%",
                  height: "100%",
                  objectFit: "cover",
                  scrollSnapAlign: "start",
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    case "CraftRegistrationForm": {
      const regConfig = event.registration_config as RegistrationConfig | null;
      if (!regConfig || !regConfig.enabled) return null;
      return (
        <InlineRegistrationForm
          registrationConfig={regConfig}
          eventSlug={event.slug}
          style={{
            width: (props.width as number) ?? 500,
            maxWidth: "100%",
            padding: (props.padding as number) ?? 32,
            borderRadius: (props.borderRadius as number) ?? 12,
            backgroundColor: (props.backgroundColor as string) ?? "#ffffff",
            color: (props.textColor as string) ?? "#111827",
          }}
        />
      );
    }

    default:
      return <>{children}</>;
  }
}

function SocialIcon({ platform, color, size }: { platform: string; color: string; size: number }) {
  switch (platform) {
    case "facebook":
      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
    case "instagram":
      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>;
    case "x":
      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
    case "youtube":
      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
    case "linkedin":
      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
    case "tiktok":
      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
    case "website":
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
    case "email":
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    default:
      return null;
  }
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}
