export const runtime = 'nodejs'

import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = randomBytes(32).toString('hex')
  cookies().set('csrfToken', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
  })
  return NextResponse.json({ csrfToken: token })
}
