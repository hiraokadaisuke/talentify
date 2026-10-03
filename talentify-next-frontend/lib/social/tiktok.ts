type TikTokTokenResponse = {
  access_token?: string
  expires_in?: number
  open_id?: string
  refresh_expires_in?: number
  refresh_token?: string
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

type TikTokUserInfoResponse = {
  data?: {
    user?: {
      open_id?: string
      username?: string
      display_name?: string
      follower_count?: number
    }
  }
  error?: {
    code?: string
    message?: string
    log_id?: string
  }
}

export async function exchangeTikTokCode(args: {
  clientKey: string
  clientSecret: string
  code: string
  redirectUri: string
}) {
  const body = new URLSearchParams({
    client_key: args.clientKey,
    client_secret: args.clientSecret,
    code: args.code,
    grant_type: 'authorization_code',
    redirect_uri: args.redirectUri,
  })

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body,
  })

  const payload = (await response.json()) as TikTokTokenResponse
  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    throw new Error(
      `TikTok token exchange failed (${response.status}): ${
        payload.error_description ?? payload.error ?? 'unknown error'
      }`
    )
  }

  return payload
}

export async function refreshTikTokAccessToken(args: {
  clientKey: string
  clientSecret: string
  refreshToken: string
}) {
  const body = new URLSearchParams({
    client_key: args.clientKey,
    client_secret: args.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: args.refreshToken,
  })

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body,
  })

  const payload = (await response.json()) as TikTokTokenResponse
  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    throw new Error(
      `TikTok token refresh failed (${response.status}): ${
        payload.error_description ?? payload.error ?? 'unknown error'
      }`
    )
  }

  return payload
}

export async function fetchTikTokUserMetrics(accessToken: string) {
  const params = new URLSearchParams({
    fields: 'open_id,username,display_name,follower_count',
  })

  const response = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?${params.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  )

  const payload = (await response.json()) as TikTokUserInfoResponse
  const errorCode = payload.error?.code
  if (!response.ok || (errorCode && errorCode !== 'ok')) {
    throw new Error(
      `TikTok user info failed (${response.status}): ${
        payload.error?.message ?? errorCode ?? 'unknown error'
      }`
    )
  }

  const user = payload.data?.user
  if (!user) return null

  const followerCount = Number(user.follower_count)
  return {
    openId: user.open_id ?? null,
    username: user.username ?? null,
    displayName: user.display_name ?? null,
    followerCount:
      Number.isFinite(followerCount) && followerCount >= 0 ? followerCount : null,
  }
}
