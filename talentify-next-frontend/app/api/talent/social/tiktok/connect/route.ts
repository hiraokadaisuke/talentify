import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export const runtime = 'nodejs'

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://talentify-xi.vercel.app').replace(/\/+$/, '')
}

export async function GET() {
  const { user } = await getCurrentUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', getSiteUrl()))
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim()
  if (!clientKey) {
    return NextResponse.redirect(new URL('/talent/edit?social=tiktok_not_configured', getSiteUrl()))
  }

  const state = randomUUID()
  const redirectUri = `${getSiteUrl()}/api/talent/social/tiktok/callback`
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic,user.info.profile,user.info.stats',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  })

  const response = NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  )

  response.cookies.set('raiten_tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  })

  return response
}
