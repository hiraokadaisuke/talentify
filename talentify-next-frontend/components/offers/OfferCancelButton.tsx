"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function OfferCancelButton({
  offerId,
  currentStatus,
}: { offerId: string; currentStatus: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cancellable = new Set(["pending", "accepted", "confirmed"]);
  const disabled = loading || !cancellable.has(currentStatus);

  const onClick = async () => {
    if (disabled) return;
    console.log("cancel click:", offerId);
    if (!confirm("このオファーを取り下げますか？")) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("offers")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          canceled_by_role: "store",
        })
        .eq("id", offerId);

      if (error) throw error;
      alert("オファーを取り下げました。");
      router.refresh();
    } catch (e) {
      console.error("cancel offer failed:", e);
      alert("取り下げに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid="offer-cancel-button"
      className={`btn btn-outline ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "処理中..." : "オファーをキャンセル"}
    </button>
  );
}
