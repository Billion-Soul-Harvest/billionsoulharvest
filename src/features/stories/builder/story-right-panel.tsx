"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StoryInsertTab } from "./story-insert-tab";
import { ThemesTab } from "@/features/events/builder/themes-tab";

export function StoryRightPanel() {
  return (
    <div className="w-[300px] bg-white border-l shrink-0 flex flex-col overflow-hidden">
      <Tabs defaultValue={0} className="flex flex-col h-full gap-0">
        <TabsList className="w-full rounded-none border-b bg-gray-50 px-1 py-0 h-10 shrink-0">
          <TabsTrigger value={0} className="text-xs">Insert</TabsTrigger>
          <TabsTrigger value={1} className="text-xs">Themes</TabsTrigger>
        </TabsList>
        <TabsContent value={0} className="flex-1 overflow-hidden">
          <StoryInsertTab />
        </TabsContent>
        <TabsContent value={1} className="flex-1 overflow-hidden">
          <ThemesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
