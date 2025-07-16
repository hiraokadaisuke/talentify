// components/QuickLinksCard.tsx
'use client'

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Calendar,
  User,
  Star,
  Wallet,
  Bell,
} from "lucide-react"

const quickLinks = [
  { label: "オファー一覧を見る", href: "/talent/offers", icon: Mail },
  { label: "スケジュールを管理", href: "/talent/schedule", icon: Calendar },
  { label: "プロフィール編集", href: "/talent/edit", icon: User },
  { label: "評価・レビュー", href: "/talent/reviews", icon: Star },
  { label: "ギャラ管理", href: "/talent/payments", icon: Wallet },
  { label: "通知設定", href: "/talent/notifications", icon: Bell },
]

export default function QuickLinksCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">クイックリンク</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickLinks.map(({ label, href, icon: Icon }) => (
          <Link href={href} key={href}>
            <Button
              variant="outline"
              className="w-full justify-start flex gap-2 text-sm"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
