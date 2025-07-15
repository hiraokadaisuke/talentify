// /app/store/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Offer = {
  created_at: string | null
  status: string | null
}

type Schedule = {
  date: string
  description: string | null
}

export default function StoreDashboard() {
  const supabase = createClient()
  const [offerStats, setOfferStats] = useState({ offers: 0, accepted: 0, rejected: 0 })
  const [nextEvent, setNextEvent] = useState<Schedule | null>(null)
  const [unread, setUnread] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // ---- Offers ----
      const { data: offers } = await supabase
        .from("offers")
        .select("status, created_at")
        .eq("user_id", user.id)

      if (offers) {
        const oneMonthAgo = new Date()
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
        const recent = (offers as Offer[]).filter((o) =>
          o.created_at ? new Date(o.created_at) > oneMonthAgo : false
        )
        setOfferStats({
          offers: recent.length,
          accepted: recent.filter((o) => o.status === "accepted").length,
          rejected: recent.filter((o) => o.status === "rejected").length,
        })
      }

      // ---- Next Event ----
      const today = new Date().toISOString().slice(0, 10)
      const { data: events } = await supabase
        .from("schedules")
        .select("date, description")
        .eq("user_id", user.id)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1)

      if (events && events.length > 0) setNextEvent(events[0] as Schedule)

      // ---- Messages ----
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)

      if (typeof count === "number") setUnread(count)
    }

    fetchData()
  }, [supabase])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📊 店舗用ダッシュボード</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>直近のオファー状況</CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>依頼数: {offerStats.offers}</p>
            <p>承認: {offerStats.accepted}</p>
            <p>辞退: {offerStats.rejected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>次の確定イベント</CardHeader>
          <CardContent>
            {nextEvent ? (
              <p className="text-lg font-semibold">
                {nextEvent.date} - {nextEvent.description || "(内容未定)"}
              </p>
            ) : (
              <p className="text-sm text-gray-600">予定されているイベントはありません</p>
            )}
          </CardContent>
        </Card>
        {unread !== null && (
          <Card className="sm:col-span-2">
            <CardHeader>未読メッセージ</CardHeader>
            <CardContent>
              <Badge>{unread}</Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
