import { s, n, j } from './nullSafe'

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
  const stageName = s(profile.stage_name).trim()
  const genre = s(profile.genre).trim()

  const area = Array.isArray(profile.area)
    ? profile.area
    : j<string[]>(profile.area, [])

  const rate = n(profile.rate)

  const bioLen = s(profile.bio).trim().length
  const profileLen = s(profile.profile).trim().length
  const hasBioOrProfile = bioLen >= 20 || profileLen >= 20

  const avatar = s(profile.avatar_url).trim()

  return (
    stageName.length > 0 &&
    genre.length > 0 &&
    area.length > 0 &&
    rate > 0 &&
    hasBioOrProfile &&
    avatar.length > 0
  )
}
