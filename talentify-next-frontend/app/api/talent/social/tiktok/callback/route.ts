import { NextRequest, NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'
import { exchangeTikTokCode, fetchTikTokUserMetrics } from '@/lib/social/tiktok'

export const runtime = 'nodejs'

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://talentify-xi.vercel.app').replace(/\/+$/, '')
}

function redirectWithStatus(status: string) {
  return NextResponse.redirect(new URL(`/talent/edit?social=${encodeURIComponent(status)}`, getSiteUrl()))
}

export async function GET(request: NextRequest) {
  const { user } = await getCurrentUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', getSiteUrl()))
  }

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')
  const expectedState = request.cookies.get('raiten_tiktok_oauth_state')?.value

  if (error) return redirectWithStatus('tiktok_denied')
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithStatus('tiktok_invalid_state')
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim()
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim()
  if (!clientKey || !clientSecret) {
    return redirectWithStatus('tiktok_not_configured')
  }

  const service = createServiceClient() as any
  const { data: talent, error: talentError } = await service
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError || !talent) {
    console.error('[tiktok-callback] talent lookup failed', talentError)
    return redirectWithStatus('tiktok_error')
  }

  const redirectUri = `${getSiteUrl()}/api/talent/social/tiktok/callback`

  try {
    const token = await exchangeTikTokCode({
      clientKey,
      clientSecret,
      code,
      redirectUri,
    })
    const metrics = await fetchTikTokUserMetrics(token.access_token!)

    const now = Date.now()
    const accessExpiresAt = new Date(now + Number(token.expires_in ?? 86400) * 1000).toISOString()
    const refreshExpiresAt = new Date(
      now + Number(token.refresh_expires_in ?? 31536000) * 1000
    ).toISOString()
    const scopes = String(token.scope ?? '')
      .split(',')
      .map(scope => scope.trim())
      .filter(Boolean)

    const { error: connectionError } = await service
      .from('talent_social_connections')
      .upsert(
        {
          talent_id: talent.id,
          provider: 'tiktok',
          external_user_id: token.open_id ?? metrics?.openId ?? null,
          provider_username: metrics?.username ?? null,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          access_token_expires_at: accessExpiresAt,
          refresh_token_expires_at: refreshExpiresAt,
          scopes,
        },
        { onConflict: 'talent_id,provider' }
      )

    if (connectionError) throw connectionError

    const updateData: Record<string, unknown> = {
      tiktok_followers: metrics?.followerCount ?? null,
      tiktok_followers_updated_at: new Date().toISOString(),
    }
    if (metrics?.username) {
      updateData.social_tiktok = `https://www.tiktok.com/@${metrics.username}`
    }

    const { error: updateError } = await service
      .from('talents')
      .update(updateData)
      .eq('id', talent.id)

    if (updateError) throw updateError

    const response = redirectWithStatus('tiktok_connected')
    response.cookies.set('raiten_tiktok_oauth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  } catch (syncError) {
    console.error('[tiktok-callback] failed', syncError)
    return redirectWithStatus('tiktok_error')
  }
}
