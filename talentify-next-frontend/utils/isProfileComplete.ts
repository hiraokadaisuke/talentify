export interface TalentProfile {
  stage_name?: string | null
  genre?: string | null
  area?: string[] | string | null
  rate?: number | null
  bio?: string | null
  profile?: string | null
  avatar_url?: string | null
}

export function isProfileComplete(profile: TalentProfile): boolean {
  const hasStageName = !!profile.stage_name && profile.stage_name.trim().length > 0
  const hasGenre = !!profile.genre && profile.genre.trim().length > 0

  const area = profile.area
  const hasArea = Array.isArray(area)
    ? area.length > 0
    : !!area && area.trim().length > 0 && area !== '[]'

  const hasRate = typeof profile.rate === 'number' && profile.rate > 0

  const bioLen = profile.bio ? profile.bio.trim().length : 0
  const profileLen = profile.profile ? profile.profile.trim().length : 0
  const hasBioOrProfile = bioLen >= 20 || profileLen >= 20

  const hasAvatar = !!profile.avatar_url && profile.avatar_url.trim().length > 0

  return hasStageName && hasGenre && hasArea && hasRate && hasBioOrProfile && hasAvatar
}
