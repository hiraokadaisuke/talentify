"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { navItems } from "@/components/nav-items";
import { LogOut } from "lucide-react";

export default function MobileDrawerNav({
  role,
  onNavigate,
}: {
  role: "talent" | "store";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setLoggedIn(!!session);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    onNavigate?.();
  };

  const items = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto pt-2" aria-label="サイドナビゲーション">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-4 rounded-2xl px-4 py-3 text-base transition-colors hover:bg-muted",
              pathname === href
                ? "bg-muted text-primary font-medium"
                : "text-muted-foreground",
            )}
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon className="h-5 w-5 opacity-80 group-hover:opacity-100" />
            <span className="label">{label}</span>
          </Link>
        ))}
      </nav>
      {loggedIn && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 text-base text-destructive hover:bg-muted"
        >
          <LogOut className="h-5 w-5 opacity-80" />
          <span className="label">ログアウト</span>
        </button>
      )}
    </div>
  );
}
