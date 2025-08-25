import { createClient } from "@/lib/supabase/server";

export async function fetchStoreNamesForOffers(offerIds: string[]) {
  if (!offerIds?.length) return new Map<string, string>();
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_offer_store_names", { _offer_ids: offerIds });
  if (error) {
    console.error("get_offer_store_names error", error);
    return new Map<string, string>();
  }
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.offer_id, row.store_display_name ?? "-");
  }
  return map;
}
