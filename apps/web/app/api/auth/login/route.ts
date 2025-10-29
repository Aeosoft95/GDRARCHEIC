import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getUserByEmail, verifyPassword, signJWT, setSessionCookie } from '@/lib/auth'

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const { email, password } = Body.parse(await req.json())
    const user = getUserByEmail(email)
    if (!user) return Response.json({ error: 'Credenziali invalide' }, { status: 401 })

    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) return Response.json({ error: 'Credenziali invalide' }, { status: 401 })

    const token = signJWT({ uid: user.id, email: user.email })
    setSessionCookie(token)

    // IMPORTANTE: includo nickname e role
    return Response.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role || 'player',
      },
    })
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Errore' }, { status: 400 })
  }
}
