// app/(auth)/layout.tsx

export const dynamic = "auto";

import React from "react";

export const metadata = {
  title: "来店ナビ",
  description: "パチンコ店と演者をつなぐマッチングプラットフォーム",
  icons: {
    icon: "/brand/raiten-navi-icon.svg?v=1",
    shortcut: "/brand/raiten-navi-icon.svg?v=1",
    apple: "/apple-touch-icon.png?v=2",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
