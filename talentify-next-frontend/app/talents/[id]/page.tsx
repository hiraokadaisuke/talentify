import TalentDetailPageClient from './TalentDetailPageClient'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('talents')
    .select(
      'id,user_id,stage_name,birthdate,gender,residence,birthplace,height_cm,agency_name,agency_url,avatar_url,photos,bio_hobby,bio_certifications,notes,media_appearance,profile,social_x,social_instagram,social_youtube'
    )
    .eq('id', params.id)
    .maybeSingle<any>()

  if (error || !data) {
    notFound()
  }

  const talent = {
    id: data.id,
    user_id: data.user_id,
    stage_name: data.stage_name,
    birthdate: data.birthdate,
    gender: data.gender,
    residence: data.residence,
    birthplace: data.birthplace,
    height: data.height_cm,
    agency: data.agency_name,
    agency_url: data.agency_url,
    profile_photo: data.avatar_url,
    photos: data.photos ?? [],
    hobby: data.bio_hobby,
    certifications: data.bio_certifications,
    notes: data.notes,
    profile: data.profile,
    media_appearance: data.media_appearance,
    twitter: data.social_x,
    instagram: data.social_instagram,
    youtube: data.social_youtube,
  }

  return <TalentDetailPageClient id={params.id} initialTalent={talent} />
}
