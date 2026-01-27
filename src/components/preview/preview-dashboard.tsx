"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewStats } from "./preview-stats";
import { PreviewCodeBlock } from "./preview-code-block";
import { PreviewApp } from "./preview-app";
import { LayoutDashboard, Code } from "lucide-react";

export function PreviewDashboard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-lg">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-2">
            <Code className="h-4 w-4" />
            Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <PreviewStats />
          <div className="grid gap-6 md:grid-cols-2">
            <PreviewCodeBlock />
            <PreviewApp />
          </div>
        </TabsContent>

        <TabsContent value="code">
          <PreviewCodeBlock />
        </TabsContent>
      </Tabs>
    </div>
  );
}
