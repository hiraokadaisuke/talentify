"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const STORAGE_KEY = "sidebar:collapsed";
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved =
        typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved != null) setCollapsed(saved === "true");
    } catch {}
  }, []);

  const toggle = () =>
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

