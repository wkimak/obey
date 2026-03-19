"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function StrategyHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex min-h-20 w-full max-w-3xl items-center gap-4 px-6 py-4">
        <SidebarTrigger className="self-center" />
        <Separator orientation="vertical" className="h-10 self-center" />
        <div className="flex min-w-0 flex-col justify-center">
          <h1 className="text-lg font-semibold leading-tight">Strategy Reference</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your trading strategies.
          </p>
        </div>
      </div>
    </header>
  );
}

