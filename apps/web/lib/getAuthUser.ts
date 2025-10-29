import { cookies } from 'next/headers'
import db from './db'
import { decodeJWT } from './auth'

const JWT_NAME = 'archei_session'

export type AuthUser = {
  id: number
  email: string
  role: 'player'|'gm'
  is_gm: number
}

export async function getAuthUser(required = true): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(JWT_NAME)?.value
    if (!token) {
      if (required) throw new Error('NO_SESSION')
      return null
    }
    const payload = decodeJWT(token) as { uid: number }
    if (!payload?.uid) {
      if (required) throw new Error('BAD_TOKEN')
      return null
    }
    const row = db.prepare(`
      SELECT id, email, role, is_gm
      FROM users
      WHERE id = ?
    `).get(payload.uid) as AuthUser | undefined

    if (!row) {
      if (required) throw new Error('USER_NOT_FOUND')
      return null
    }
    return row
  } catch {
    if (required) throw new Error('UNAUTHORIZED')
    return null
  }
}
