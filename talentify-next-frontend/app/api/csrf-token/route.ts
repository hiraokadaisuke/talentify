import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = randomBytes(32).toString('hex')
  cookies().set('csrfToken', token, { httpOnly: true, path: '/' })
  return NextResponse.json({ csrfToken: token })
}
