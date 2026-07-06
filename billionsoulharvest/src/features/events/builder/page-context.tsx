"use client";

import { createContext, useContext } from "react";

export interface PageInfo {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  published: boolean;
  page_content: Record<string, unknown> | null;
  parent_id?: string | null;
  nav_anchor?: string | null;
}

interface PageContextValue {
  /** null = home page (event.page_content), string = sub-page id */
  activePageId: string | null;
  switchPage: (pageId: string | null) => void;
  pages: PageInfo[];
  setPages: React.Dispatch<React.SetStateAction<PageInfo[]>>;
  refreshPages: () => Promise<void>;
}

const PageContext = createContext<PageContextValue | null>(null);

export const PageContextProvider = PageContext.Provider;

export function usePageContext() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error("usePageContext must be used within PageContextProvider");
  return ctx;
}
