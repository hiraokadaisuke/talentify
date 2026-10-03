import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchYouTubeMetrics } from '@/lib/social/youtube'

export const runtime = 'nodejs'

export async function POST() {
  const { user } = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'ログインが必要です' }, { status: 401 })
  }

  const service = createServiceClient() as any
  const { data: talent, error: talentError } = await service
    .from('talents')
    .select('id,youtube_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError) {
    console.error('[youtube-sync] failed to load talent', talentError)
    return NextResponse.json({ ok: false, error: '演者情報の取得に失敗しました' }, { status: 500 })
  }

  if (!talent) {
    return NextResponse.json({ ok: false, error: '演者情報が見つかりません' }, { status: 404 })
  }

  const youtubeUrl = String(talent.youtube_url ?? '').trim()
  if (!youtubeUrl) {
    const { error: clearError } = await service
      .from('talents')
      .update({
        youtube_followers: null,
        youtube_followers_updated_at: null,
      })
      .eq('id', talent.id)

    if (clearError) {
      console.error('[youtube-sync] failed to clear metrics', clearError)
      return NextResponse.json({ ok: false, error: 'YouTube情報の更新に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, status: 'cleared', subscriberCount: null })
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        status: 'not_configured',
        error: 'YouTube APIが未設定です',
      },
      { status: 503 }
    )
  }

  try {
    const metrics = await fetchYouTubeMetrics(youtubeUrl, apiKey)

    if (!metrics) {
      return NextResponse.json(
        {
          ok: false,
          status: 'not_found',
          error: 'YouTubeチャンネルを確認できませんでした',
        },
        { status: 422 }
      )
    }

    const now = new Date().toISOString()
    const { error: updateError } = await service
      .from('talents')
      .update({
        youtube_followers: metrics.subscriberCount,
        youtube_followers_updated_at: now,
      })
      .eq('id', talent.id)

    if (updateError) {
      console.error('[youtube-sync] failed to save metrics', updateError)
      return NextResponse.json({ ok: false, error: '登録者数の保存に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      status: metrics.hiddenSubscriberCount ? 'hidden' : 'synced',
      subscriberCount: metrics.subscriberCount,
      updatedAt: now,
    })
  } catch (error) {
    console.error('[youtube-sync] request failed', error)
    return NextResponse.json(
      {
        ok: false,
        status: 'upstream_error',
        error: 'YouTubeから登録者数を取得できませんでした',
      },
      { status: 502 }
    )
  }
}
