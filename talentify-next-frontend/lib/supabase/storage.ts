import type { SupabaseClient } from '@supabase/supabase-js'
import type { Attachment } from './offerMessages'

const BUCKET = 'offer-attachments'

export async function uploadAttachment(client: SupabaseClient, file: File): Promise<Attachment> {
  const path = `${Date.now()}-${file.name}`
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    upsert: true,
  })
  if (error) throw error
  return {
    path,
    name: file.name,
    type: file.type,
    size: file.size,
  }
}
