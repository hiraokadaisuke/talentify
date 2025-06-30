import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:54321' // ローカルのAPI URL
const supabaseAnonKey = '上記のanon key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
