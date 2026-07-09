"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InsertTab } from "./insert-tab";
import { PagesTab } from "./pages-tab";
import { ThemesTab } from "./themes-tab";

export function RightPanel() {
  return (
    <div className="w-[300px] bg-white border-l shrink-0 flex flex-col overflow-hidden">
      <Tabs defaultValue={0} className="flex flex-col h-full gap-0">
        <TabsList className="w-full rounded-none border-b bg-gray-50 px-1 py-0 h-10 shrink-0">
          <TabsTrigger value={0} className="text-xs">Insert</TabsTrigger>
          <TabsTrigger value={1} className="text-xs">Pages</TabsTrigger>
          <TabsTrigger value={2} className="text-xs">Themes</TabsTrigger>
        </TabsList>
        <TabsContent value={0} className="flex-1 overflow-hidden">
          <InsertTab />
        </TabsContent>
        <TabsContent value={1} className="flex-1 overflow-hidden">
          <PagesTab />
        </TabsContent>
        <TabsContent value={2} className="flex-1 overflow-hidden">
          <ThemesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
