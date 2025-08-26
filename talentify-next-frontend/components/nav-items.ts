import { LayoutDashboard, Mail, Calendar, User, Star, Wallet, Bell, Settings, Search, MessageCircle } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles: ("talent" | "store")[];
}

export const navItems: NavItem[] = [
  { href: "/search", label: "演者を探す", icon: Search, roles: ["store"] },
  { href: "/store/dashboard", label: "ダッシュボード", icon: LayoutDashboard, roles: ["store"] },
  { href: "/store/offers", label: "オファー管理", icon: Mail, roles: ["store"] },
  { href: "/store/schedule", label: "スケジュール", icon: Calendar, roles: ["store"] },
  { href: "/store/reviews", label: "レビュー管理", icon: Star, roles: ["store"] },
  { href: "/store/messages", label: "メッセージ", icon: MessageCircle, roles: ["store"] },
  { href: "/store/notifications", label: "通知", icon: Bell, roles: ["store"] },
  { href: "/store/invoices", label: "請求一覧", icon: Wallet, roles: ["store"] },
  { href: "/store/edit", label: "店舗情報", icon: User, roles: ["store"] },
  { href: "/store/settings", label: "設定", icon: Settings, roles: ["store"] },

  { href: "/talent/dashboard", label: "ダッシュボード", icon: LayoutDashboard, roles: ["talent"] },
  { href: "/talent/offers", label: "オファー一覧", icon: Mail, roles: ["talent"] },
  { href: "/talent/schedule", label: "スケジュール管理", icon: Calendar, roles: ["talent"] },
  { href: "/talent/messages", label: "メッセージ", icon: MessageCircle, roles: ["talent"] },
  { href: "/talent/edit", label: "プロフィール編集", icon: User, roles: ["talent"] },
  { href: "/talent/reviews", label: "評価・レビュー", icon: Star, roles: ["talent"] },
  { href: "/talent/payments", label: "ギャラ管理", icon: Wallet, roles: ["talent"] },
  { href: "/talent/invoices", label: "請求管理", icon: Mail, roles: ["talent"] },
  { href: "/talent/notifications", label: "通知", icon: Bell, roles: ["talent"] },
  { href: "/talent/settings", label: "設定", icon: Settings, roles: ["talent"] },
];
