"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/SidebarProvider";

export default function SidebarToggle() {
  const { collapsed, toggle } = useSidebar();
  const label = collapsed ? "サイドバーを開く" : "サイドバーを閉じる";

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label={label}
            title={label}
            onClick={toggle}
            className="fixed top-[72px] z-[60] flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              left: collapsed
                ? "calc(12px + env(safe-area-inset-left))"
                : "calc(238px + env(safe-area-inset-left))",
            }}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

