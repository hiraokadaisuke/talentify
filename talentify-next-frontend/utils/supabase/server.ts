export const dynamic = 'force-dynamic' // ← 追加

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}
