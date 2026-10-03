import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchInstagramMetrics } from '@/lib/social/instagram'
import {
  fetchTikTokUserMetrics,
  refreshTikTokAccessToken,
} from '@/lib/social/tiktok'
import { fetchXMetrics } from '@/lib/social/x'
import { fetchYouTubeMetrics } from '@/lib/social/youtube'

export const runtime = 'nodejs'

type SyncStatus =
  | 'synced'
  | 'hidden'
  | 'not_configured'
  | 'no_account'
  | 'not_found'
  | 'authorization_required'
  | 'error'

type ProviderResult = {
  status: SyncStatus
  followerCount?: number | null
  message?: string
}

function safeMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 300) : 'unknown error'
}

export async function POST() {
  const { user } = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'ログインが必要です' }, { status: 401 })
  }

  const service = createServiceClient() as any
  const { data: talent, error: talentError } = await service
    .from('talents')
    .select('id,twitter_url,instagram_url,youtube_url,social_tiktok')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError || !talent) {
    console.error('[social-sync] talent lookup failed', talentError)
    return NextResponse.json({ ok: false, error: '演者情報の取得に失敗しました' }, { status: 500 })
  }

  const results: Record<string, ProviderResult> = {}
  const now = new Date().toISOString()

  // YouTube
  if (!talent.youtube_url) {
    results.youtube = { status: 'no_account' }
  } else {
    const apiKey = process.env.YOUTUBE_API_KEY?.trim()
    if (!apiKey) {
      results.youtube = { status: 'not_configured' }
    } else {
      try {
        const metrics = await fetchYouTubeMetrics(talent.youtube_url, apiKey)
        if (!metrics) {
          results.youtube = { status: 'not_found' }
        } else {
          const { error } = await service
            .from('talents')
            .update({
              youtube_followers: metrics.subscriberCount,
              youtube_followers_updated_at: now,
            })
            .eq('id', talent.id)
          if (error) throw error
          results.youtube = {
            status: metrics.hiddenSubscriberCount ? 'hidden' : 'synced',
            followerCount: metrics.subscriberCount,
          }
        }
      } catch (error) {
        console.error('[social-sync][youtube]', error)
        results.youtube = { status: 'error', message: safeMessage(error) }
      }
    }
  }

  // X
  if (!talent.twitter_url) {
    results.x = { status: 'no_account' }
  } else {
    const bearerToken = process.env.X_BEARER_TOKEN?.trim()
    if (!bearerToken) {
      results.x = { status: 'not_configured' }
    } else {
      try {
        const metrics = await fetchXMetrics(talent.twitter_url, bearerToken)
        if (!metrics) {
          results.x = { status: 'not_found' }
        } else {
          const { error } = await service
            .from('talents')
            .update({
              twitter_followers: metrics.followerCount,
              twitter_followers_updated_at: now,
            })
            .eq('id', talent.id)
          if (error) throw error
          results.x = { status: 'synced', followerCount: metrics.followerCount }
        }
      } catch (error) {
        console.error('[social-sync][x]', error)
        results.x = { status: 'error', message: safeMessage(error) }
      }
    }
  }

  // Instagram Business Discovery
  if (!talent.instagram_url) {
    results.instagram = { status: 'no_account' }
  } else {
    const sourceUserId = process.env.INSTAGRAM_BUSINESS_DISCOVERY_USER_ID?.trim()
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim()
    const graphVersion = process.env.INSTAGRAM_GRAPH_API_VERSION?.trim()

    if (!sourceUserId || !accessToken || !graphVersion) {
      results.instagram = { status: 'not_configured' }
    } else {
      try {
        const metrics = await fetchInstagramMetrics({
          rawValue: talent.instagram_url,
          sourceUserId,
          accessToken,
          graphVersion,
        })
        if (!metrics) {
          results.instagram = { status: 'not_found' }
        } else {
          const { error } = await service
            .from('talents')
            .update({
              instagram_followers: metrics.followerCount,
              instagram_followers_updated_at: now,
            })
            .eq('id', talent.id)
          if (error) throw error
          results.instagram = {
            status: 'synced',
            followerCount: metrics.followerCount,
          }
        }
      } catch (error) {
        console.error('[social-sync][instagram]', error)
        results.instagram = { status: 'error', message: safeMessage(error) }
      }
    }
  }

  // TikTok requires user authorization via Login Kit.
  const { data: tiktokConnection, error: tiktokConnectionError } = await service
    .from('talent_social_connections')
    .select(
      'access_token,refresh_token,access_token_expires_at,refresh_token_expires_at,provider_username'
    )
    .eq('talent_id', talent.id)
    .eq('provider', 'tiktok')
    .maybeSingle()

  if (tiktokConnectionError) {
    console.error('[social-sync][tiktok] connection lookup failed', tiktokConnectionError)
    results.tiktok = { status: 'error', message: 'TikTok連携情報を確認できませんでした' }
  } else if (!tiktokConnection?.refresh_token) {
    results.tiktok = { status: 'authorization_required' }
  } else {
    const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim()
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim()

    if (!clientKey || !clientSecret) {
      results.tiktok = { status: 'not_configured' }
    } else {
      try {
        let accessToken = String(tiktokConnection.access_token ?? '')
        let refreshToken = String(tiktokConnection.refresh_token)
        const expiresAt = tiktokConnection.access_token_expires_at
          ? new Date(tiktokConnection.access_token_expires_at).getTime()
          : 0

        if (!accessToken || expiresAt <= Date.now() + 5 * 60 * 1000) {
          const refreshed = await refreshTikTokAccessToken({
            clientKey,
            clientSecret,
            refreshToken,
          })
          accessToken = refreshed.access_token!
          refreshToken = refreshed.refresh_token!

          const refreshedAt = Date.now()
          const { error: refreshSaveError } = await service
            .from('talent_social_connections')
            .update({
              access_token: accessToken,
              refresh_token: refreshToken,
              access_token_expires_at: new Date(
                refreshedAt + Number(refreshed.expires_in ?? 86400) * 1000
              ).toISOString(),
              refresh_token_expires_at: new Date(
                refreshedAt + Number(refreshed.refresh_expires_in ?? 31536000) * 1000
              ).toISOString(),
              scopes: String(refreshed.scope ?? '')
                .split(',')
                .map(scope => scope.trim())
                .filter(Boolean),
            })
            .eq('talent_id', talent.id)
            .eq('provider', 'tiktok')

          if (refreshSaveError) throw refreshSaveError
        }

        const metrics = await fetchTikTokUserMetrics(accessToken)
        if (!metrics) {
          results.tiktok = { status: 'not_found' }
        } else {
          const updateData: Record<string, unknown> = {
            tiktok_followers: metrics.followerCount,
            tiktok_followers_updated_at: now,
          }
          if (metrics.username) {
            updateData.social_tiktok = `https://www.tiktok.com/@${metrics.username}`
          }

          const { error: metricSaveError } = await service
            .from('talents')
            .update(updateData)
            .eq('id', talent.id)

          if (metricSaveError) throw metricSaveError

          const { error: usernameSaveError } = await service
            .from('talent_social_connections')
            .update({
              provider_username: metrics.username ?? tiktokConnection.provider_username ?? null,
              external_user_id: metrics.openId ?? null,
            })
            .eq('talent_id', talent.id)
            .eq('provider', 'tiktok')

          if (usernameSaveError) throw usernameSaveError

          results.tiktok = {
            status: 'synced',
            followerCount: metrics.followerCount,
          }
        }
      } catch (error) {
        console.error('[social-sync][tiktok]', error)
        results.tiktok = { status: 'error', message: safeMessage(error) }
      }
    }
  }

  return NextResponse.json({ ok: true, results })
}
