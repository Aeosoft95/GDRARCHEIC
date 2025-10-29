'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import MakeGMButton from '@/components/MakeGMButton'

type MeResponse = {
  user?: {
    role?: string
    nickname?: string
  }
  ok?: boolean
}

export default function SideNav() {
  const pathname = usePathname()
  const [role, setRole] = useState<'gm' | 'player'>('player')

  // ===== Tenta di leggere il ruolo dal server (/api/auth/me)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!r.ok) return
        const data = (await r.json()) as MeResponse
        if (!alive) return
        const roleRaw = (data?.user?.role || 'player').toString().toLowerCase()
        const normalized: 'gm' | 'player' = roleRaw === 'gm' ? 'gm' : 'player'
        setRole(normalized)
        try { localStorage.setItem('archei:role', normalized) } catch {}
      } catch {
        // ignora: si userà il fallback sotto
      }
    })()
    return () => { alive = false }
  }, [])

  // ===== Fallback/compat: leggi il ruolo dal localStorage
  useEffect(() => {
    try {
      const r = (localStorage.getItem('archei:role') || 'player').toString().toLowerCase()
      setRole(r === 'gm' ? 'gm' : 'player')
    } catch {}
  }, [])

  const isGM = role === 'gm'
  const linkCls = (href: string) =>
    `btn justify-start ${pathname === href ? '!bg-teal-600 text-white' : ''}`

  // ====== BACKUP / RIPRISTINO ======
  const fileRef = useRef<HTMLInputElement | null>(null)
  const ARCH_PREFIX = 'archei:'

  function buildSnapshot() {
    const data: Record<string, string> = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!
        if (k && k.startsWith(ARCH_PREFIX)) {
          const v = localStorage.getItem(k)
          if (v !== null) data[k] = v
        }
      }
    } catch {}
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      data,
    }
  }

  function downloadSnapshot() {
    try {
      const snap = buildSnapshot()
      const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      a.href = url
      a.download = `archei-backup-${ts}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Impossibile creare il backup.')
    }
  }

  function clearArcheiKeys() {
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!
        if (k && k.startsWith(ARCH_PREFIX)) keys.push(k)
      }
      keys.forEach(k => localStorage.removeItem(k))
    } catch {}
  }

  function restoreFromObject(obj: any) {
    if (!obj || typeof obj !== 'object' || !obj.data || typeof obj.data !== 'object') {
      alert('File di backup non valido.')
      return
    }
    clearArcheiKeys()
    for (const [k, v] of Object.entries<string>(obj.data)) {
      try { localStorage.setItem(k, v) } catch {}
    }
    alert('Ripristino completato. Ricarico la pagina…')
    location.reload()
  }

  function handleCloseSession() {
    downloadSnapshot()
    setTimeout(() => {
      if (confirm('Vuoi azzerare i dati locali dopo il download?')) {
        clearArcheiKeys()
        alert('Dati locali azzerati.')
      }
    }, 50)
  }

  function handlePickRestore() {
    fileRef.current?.click()
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result))
        restoreFromObject(obj)
      } catch {
        alert('Impossibile leggere il file di backup.')
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  // Backup automatico (localStorage, non scarica)
  useEffect(() => {
    const saveAuto = () => {
      try {
        const snap = buildSnapshot()
        localStorage.setItem('archei:autoBackup', JSON.stringify(snap))
      } catch {}
    }
    saveAuto()
    const id = setInterval(saveAuto, 10 * 60 * 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <nav className="flex flex-col gap-2">
      {/* Player */}
      <Link href="/dashboard" className={linkCls('/dashboard')}>📊 Dashboard Player</Link>
      <Link href="/tools/chat" className={linkCls('/tools/chat')}>💬 Chat</Link>
      <Link href="/player/sheet" className={linkCls('/player/sheet')}>📜 Scheda Personaggio</Link>
      <Link href="/player/inventory" className={linkCls('/player/inventory')}>🎒 Inventario</Link>
      <Link href="/player/notes" className={linkCls('/player/notes')}>📝 Note</Link>

      {/* GM */}
      {isGM && (
        <>
          <div className="mt-3 text-xs uppercase tracking-wide text-zinc-400">GM</div>
          <Link href="/gm" className={linkCls('/gm')}>📊 Dashboard GM</Link>
          <Link href="/gm/chat" className={linkCls('/gm/chat')}>💬 Chat GM</Link>
          <Link href="/gm/editor-scene" className={linkCls('/gm/editor-scene')}>🎬 Editor Scene</Link>
          <Link href="/gm/editor-clock" className={linkCls('/gm/editor-clock')}>🕑 Editor Clock</Link>
          <Link href="/gm/npc" className={linkCls('/gm/npc')}>🤖 Generatore NPC</Link>
          <Link href="/gm/generatore-mostri" className={linkCls('/gm/generatore-mostri')}>👹 Generatore Mostri</Link>
          <Link href="/gm/notes" className={linkCls('/gm/notes')}>📝 Note (GM)</Link>



          {/* Sessione (backup globale) */}
          <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2">
            <div className="text-xs uppercase tracking-wide text-zinc-400">Sessione</div>
            <button className="btn !bg-red-600 text-white" onClick={handleCloseSession}>
              ⏹️ Chiudi Sessione
            </button>
            <button className="btn" onClick={handlePickRestore}>
              🔁 Ripristina backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onFileChosen}
            />
          </div>
        </>
      )}
    </nav>
  )
}
