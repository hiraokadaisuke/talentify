// app/talent/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

import Sidebar from "@/components/Sidebar"
import OfferCard from "@/components/OfferCard"
import ScheduleCard from "@/components/ScheduleCard"
import NotificationCard from "@/components/NotificationCard"
import ProfileProgressCard from "@/components/ProfileProgressCard"
import ReviewCard from "@/components/ReviewCard"
import PaymentCard from "@/components/PaymentCard"
import QuickLinksCard from "@/components/QuickLinksCard"

export default function TalentDashboard() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 py-8 grid grid-cols-12 gap-6">
        {/* 左カラム：サイドバー */}
        <aside className="col-span-2">
          <Sidebar />
        </aside>

        {/* 中央カラム：メインカード */}
        <main className="col-span-7 space-y-6">
          <OfferCard />
          <ScheduleCard />
          <NotificationCard />
        </main>

        {/* 右カラム：補助情報 */}
        <aside className="col-span-3 space-y-6">
          <ProfileProgressCard />
          <ReviewCard />
          <PaymentCard />
          <QuickLinksCard />
        </aside>
      </div>
    </div>
  )
}
