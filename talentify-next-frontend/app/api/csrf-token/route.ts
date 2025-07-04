import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = randomBytes(32).toString('hex')
  const res = NextResponse.json({ csrfToken: token })
  res.cookies.set('csrfToken', token, { httpOnly: true, path: '/' })
  return res
}
