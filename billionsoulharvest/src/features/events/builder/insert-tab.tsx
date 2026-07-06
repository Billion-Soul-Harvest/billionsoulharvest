"use client";

import React from "react";
import { useEditor, Element } from "@craftjs/core";
import { CraftText } from "./components/craft-text";
import { CraftImage } from "./components/craft-image";
import { CraftButton } from "./components/craft-button";
import { CraftVideo } from "./components/craft-video";
import { CraftContainer } from "./components/craft-container";
import { CraftRow } from "./components/craft-row";
import { CraftColumn } from "./components/craft-column";
import { CraftDivider } from "./components/craft-divider";
import { CraftSpacer } from "./components/craft-spacer";
import { CraftHeader } from "./components/craft-header";
import { CraftEventTitle, CraftEventDates, CraftEventLocation, CraftRegisterButton } from "./components/event-data";
import { CraftRegistrationForm } from "./components/craft-registration-form";
import { CraftEmbed } from "./components/craft-embed";
import { CraftSocialLinks } from "./components/craft-social-links";
import { CraftMap } from "./components/craft-map";
import { CraftYouTube } from "./components/craft-youtube";
import { CraftCarousel } from "./components/craft-carousel";

const quickInsert = [
  { name: "Text", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10" />
    </svg>
  ), element: <CraftText /> },
  { name: "Images", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ), element: <CraftImage /> },
  { name: "Video", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ), element: <CraftVideo /> },
  { name: "Button", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
    </svg>
  ), element: <CraftButton /> },
  { name: "Social Links", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ), element: <CraftSocialLinks /> },
  { name: "YouTube", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ), element: <CraftYouTube /> },
  { name: "Map", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ), element: <CraftMap /> },
  { name: "Image Carousel", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ), element: <CraftCarousel /> },
];

const embedItems = [
  { name: "Calendar", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ), element: <CraftEmbed embedType="calendar" /> },
  { name: "Docs", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ), element: <CraftEmbed embedType="docs" /> },
  { name: "Slides", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2M3 7h18M7 11h4m-4 4h10" />
    </svg>
  ), element: <CraftEmbed embedType="slides" /> },
  { name: "Sheets", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M10 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  ), element: <CraftEmbed embedType="sheets" /> },
  { name: "Forms", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ), element: <CraftEmbed embedType="forms" /> },
  { name: "Charts", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ), element: <CraftEmbed embedType="charts" /> },
];

const layoutItems = [
  { name: "Header", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 6v2h16V6M4 6H2m18 0h2" />
    </svg>
  ), element: <CraftHeader /> },
  { name: "Row", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h18M3 19h18M3 5v14M21 5v14M9 5v14M15 5v14" />
    </svg>
  ), element: <Element is={CraftRow} canvas /> },
  { name: "Column", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4h6v16H9z" />
    </svg>
  ), element: <Element is={CraftColumn} canvas /> },
  { name: "Container", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
    </svg>
  ), element: <Element is={CraftContainer} canvas /> },
  { name: "Spacer", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16M12 8v8" />
    </svg>
  ), element: <CraftSpacer /> },
  { name: "Divider", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h16" />
    </svg>
  ), element: <CraftDivider /> },
];

const eventDataItems = [
  { name: "Title", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ), element: <CraftEventTitle /> },
  { name: "Dates", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ), element: <CraftEventDates /> },
  { name: "Location", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ), element: <CraftEventLocation /> },
  { name: "Register", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ), element: <CraftRegisterButton /> },
  { name: "Registration Form", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ), element: <CraftRegistrationForm /> },
];

const contentBlocks = [
  {
    name: "Image + Text",
    thumbnail: (
      <div className="w-full h-full flex flex-col gap-1 p-1.5">
        <div className="bg-gray-300 rounded h-8 w-full" />
        <div className="space-y-0.5 flex-1">
          <div className="bg-gray-300 rounded h-1 w-full" />
          <div className="bg-gray-300 rounded h-1 w-3/4" />
        </div>
      </div>
    ),
    create: () => (
      <Element is={CraftRow} canvas gap={0} padding={0}>
        <Element is={CraftColumn} canvas width="100%" padding={0}>
          <CraftImage width={600} height={300} />
          <CraftText text="<p>Add your text here</p>" fontSize={16} color="#ffffff" />
        </Element>
      </Element>
    ),
  },
  {
    name: "2-Col Image + Text",
    thumbnail: (
      <div className="w-full h-full flex gap-1 p-1.5">
        <div className="bg-gray-300 rounded w-1/2 h-full" />
        <div className="w-1/2 space-y-0.5 flex flex-col justify-center">
          <div className="bg-gray-300 rounded h-1 w-full" />
          <div className="bg-gray-300 rounded h-1 w-3/4" />
          <div className="bg-gray-300 rounded h-1 w-1/2" />
        </div>
      </div>
    ),
    create: () => (
      <Element is={CraftRow} canvas gap={16} padding={0}>
        <Element is={CraftColumn} canvas width="50%" padding={12}>
          <CraftImage width={400} height={300} />
        </Element>
        <Element is={CraftColumn} canvas width="50%" padding={12}>
          <CraftText text="<h2>Heading</h2>" fontSize={24} color="#ffffff" />
          <CraftText text="<p>Add your description here</p>" fontSize={16} color="#d1d5db" />
        </Element>
      </Element>
    ),
  },
  {
    name: "2-Col Text + Image",
    thumbnail: (
      <div className="w-full h-full flex gap-1 p-1.5">
        <div className="w-1/2 space-y-0.5 flex flex-col justify-center">
          <div className="bg-gray-300 rounded h-1 w-full" />
          <div className="bg-gray-300 rounded h-1 w-3/4" />
          <div className="bg-gray-300 rounded h-1 w-1/2" />
        </div>
        <div className="bg-gray-300 rounded w-1/2 h-full" />
      </div>
    ),
    create: () => (
      <Element is={CraftRow} canvas gap={16} padding={0}>
        <Element is={CraftColumn} canvas width="50%" padding={12}>
          <CraftText text="<h2>Heading</h2>" fontSize={24} color="#ffffff" />
          <CraftText text="<p>Add your description here</p>" fontSize={16} color="#d1d5db" />
        </Element>
        <Element is={CraftColumn} canvas width="50%" padding={12}>
          <CraftImage width={400} height={300} />
        </Element>
      </Element>
    ),
  },
  {
    name: "2 Images",
    thumbnail: (
      <div className="w-full h-full flex gap-1 p-1.5">
        <div className="bg-gray-300 rounded w-1/2 h-full" />
        <div className="bg-gray-300 rounded w-1/2 h-full" />
      </div>
    ),
    create: () => (
      <Element is={CraftRow} canvas gap={16} padding={0}>
        <Element is={CraftColumn} canvas width="50%" padding={12}>
          <CraftImage width={400} height={300} />
        </Element>
        <Element is={CraftColumn} canvas width="50%" padding={12}>
          <CraftImage width={400} height={300} />
        </Element>
      </Element>
    ),
  },
  {
    name: "3 Columns",
    thumbnail: (
      <div className="w-full h-full flex gap-1 p-1.5">
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="bg-gray-300 rounded h-5" />
          <div className="bg-gray-300 rounded h-1 w-full" />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="bg-gray-300 rounded h-5" />
          <div className="bg-gray-300 rounded h-1 w-full" />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="bg-gray-300 rounded h-5" />
          <div className="bg-gray-300 rounded h-1 w-full" />
        </div>
      </div>
    ),
    create: () => (
      <Element is={CraftRow} canvas gap={16} padding={0}>
        <Element is={CraftColumn} canvas width="33.33%" padding={12}>
          <CraftImage width={300} height={200} />
          <CraftText text="<p>Column 1</p>" fontSize={14} color="#ffffff" />
        </Element>
        <Element is={CraftColumn} canvas width="33.33%" padding={12}>
          <CraftImage width={300} height={200} />
          <CraftText text="<p>Column 2</p>" fontSize={14} color="#ffffff" />
        </Element>
        <Element is={CraftColumn} canvas width="33.33%" padding={12}>
          <CraftImage width={300} height={200} />
          <CraftText text="<p>Column 3</p>" fontSize={14} color="#ffffff" />
        </Element>
      </Element>
    ),
  },
  {
    name: "Hero Banner",
    thumbnail: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 bg-gray-200 p-1.5 rounded">
        <div className="bg-gray-400 rounded h-2 w-3/4" />
        <div className="bg-gray-300 rounded h-1 w-1/2" />
        <div className="bg-blue-300 rounded h-2 w-1/3 mt-1" />
      </div>
    ),
    create: () => (
      <Element is={CraftContainer} canvas backgroundColor="#0f2744" padding={60} minHeight={400} width={1200} borderRadius={0} borderColor="transparent" borderWidth={0} backgroundImage="" alignItems="center">
        <CraftEventTitle fontSize={48} color="#ffffff" textAlign="center" />
        <CraftSpacer height={16} />
        <CraftEventDates fontSize={18} color="#d1d5db" textAlign="center" />
        <CraftSpacer height={8} />
        <CraftEventLocation fontSize={16} color="#d1d5db" textAlign="center" />
        <CraftSpacer height={32} />
        <CraftRegisterButton />
      </Element>
    ),
  },
];

function DraggableItem({ name, icon, element }: { name: string; icon: React.ReactNode; element: React.ReactElement }) {
  const { connectors } = useEditor();

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) { connectors.create(ref, element); }
      }}
      className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-gray-200 cursor-grab hover:border-[#29BDD6] hover:bg-[#29BDD6]/5 transition-colors text-center active:cursor-grabbing"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="text-[11px] text-gray-600 font-medium">{name}</span>
    </div>
  );
}

function ContentBlockItem({ block }: { block: typeof contentBlocks[number] }) {
  const { connectors } = useEditor();

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) { connectors.create(ref, block.create()); }
      }}
      className="rounded-lg border border-gray-200 cursor-grab hover:border-[#29BDD6] hover:bg-[#29BDD6]/5 transition-colors active:cursor-grabbing overflow-hidden"
    >
      <div className="h-16 flex items-stretch">{block.thumbnail}</div>
      <p className="text-[10px] text-gray-500 font-medium text-center py-1 border-t border-gray-100">{block.name}</p>
    </div>
  );
}

export function InsertTab() {
  return (
    <div className="p-3 space-y-5 overflow-y-auto h-full">
      {/* Quick Insert */}
      <div>
        <div className="grid grid-cols-2 gap-1.5">
          {quickInsert.map((item) => (
            <DraggableItem key={item.name} {...item} />
          ))}
        </div>
      </div>

      {/* Content Blocks */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Content Blocks</p>
        <div className="grid grid-cols-2 gap-1.5">
          {contentBlocks.map((block) => (
            <ContentBlockItem key={block.name} block={block} />
          ))}
        </div>
      </div>

      {/* Embeds */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Embeds</p>
        <div className="grid grid-cols-2 gap-1.5">
          {embedItems.map((item) => (
            <DraggableItem key={item.name} {...item} />
          ))}
        </div>
      </div>

      {/* Layout */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Layout</p>
        <div className="grid grid-cols-2 gap-1.5">
          {layoutItems.map((item) => (
            <DraggableItem key={item.name} {...item} />
          ))}
        </div>
      </div>

      {/* Event Data */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Event Data</p>
        <div className="grid grid-cols-2 gap-1.5">
          {eventDataItems.map((item) => (
            <DraggableItem key={item.name} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
