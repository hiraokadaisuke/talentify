// utils/supabase/client.ts
'use client'

export const dynamic = 'force-dynamic'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()
