"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center space-y-4">
      <div className="inline-flex size-12 items-center justify-center rounded-full bg-muted">
        <Plus className="size-5 text-muted-foreground" />
      </div>
      <div>
        <div className="text-lg font-semibold">No Strategy Defined</div>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Create a trading strategy with rules to track your discipline and
          improve your trading consistency.
        </p>
      </div>
      <Button onClick={onCreate}>Create Strategy</Button>
    </div>
  );
}

