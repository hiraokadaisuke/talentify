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
            className="fixed top-[72px] z-[60] flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              left: collapsed
                ? "calc(12px + env(safe-area-inset-left))"
                : "calc(238px + env(safe-area-inset-left))",
            }}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

