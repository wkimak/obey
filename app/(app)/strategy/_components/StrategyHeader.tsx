"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function StrategyHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">Strategy Reference</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage your trading strategies.
        </p>
      </div>
    </header>
  );
}

