"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { formatJaDateTimeWithWeekday } from "@/utils/formatJaDateTimeWithWeekday"

type Props = {
  offerId: string
  initialStatus: string
  initialCanceledAt?: string | null
}

const cancellable = new Set(["pending", "accepted", "confirmed"])

export default function CancelOfferSection({
  offerId,
  initialStatus,
  initialCanceledAt = null,
}: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [localStatus, setLocalStatus] = useState(initialStatus)
  const [canceledAt, setCanceledAt] = useState<string | null>(initialCanceledAt)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    if (isCancelling || !cancellable.has(localStatus)) return
    if (!confirm("このオファーを取り下げますか？")) return

    setIsCancelling(true)
    try {
      const { data, error } = await supabase
        .from("offers")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          canceled_by_role: "store",
        })
        .eq("id", offerId)
        .select()
        .single()

      if (error) throw error

      setLocalStatus("canceled")
      setCanceledAt(data.canceled_at ?? null)
      toast("オファーをキャンセルしました")
      router.refresh()
    } catch (e) {
      console.error("cancel offer failed", e)
      toast.error("キャンセルに失敗しました")
    } finally {
      setIsCancelling(false)
    }
  }

  if (!cancellable.has(localStatus) && localStatus !== "canceled") {
    return null
  }

  if (localStatus === "canceled") {
    return (
      <Alert className="mb-4">
        <AlertTitle>キャンセル済み</AlertTitle>
        {canceledAt && (
          <AlertDescription>
            {formatJaDateTimeWithWeekday(canceledAt)}
          </AlertDescription>
        )}
      </Alert>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={handleCancel}
      disabled={isCancelling}
      data-testid="offer-cancel-button"
    >
      {isCancelling ? "キャンセル中..." : "オファーをキャンセル"}
    </Button>
  )
}

