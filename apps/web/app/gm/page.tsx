'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function GmDashboard() {
  // Protezione lato client
  useEffect(() => {
    const role = localStorage.getItem('archei:role')
    if (role !== 'gm') window.location.href = '/dashboard'
  }, [])

  const cards = [
    { href: '/gm/chat', label: 'Chat (GM)', icon: '🗨️' },
    { href: '/gm/editor-clock', label: 'Editor Clock', icon: '⏲️' },
    { href: '/gm/editor-scene', label: 'Editor Scene', icon: '🎬' },
    { href: '/gm/npc', label: 'Generatore NPC', icon: '🧑‍🤝‍🧑' },
    { href: '/gm/generatore-mostri', label: 'Generatore Mostri', icon: '🐉' },
    { href: '/gm/notes', label: 'Note', icon: '🗒️' },
  ]

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1">GM Dashboard</h1>
      <p className="text-zinc-400 mb-6">Pannello rapido per la sessione.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card hover:bg-zinc-900/80 transition">
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="text-lg font-semibold">{c.label}</div>
            <div className="text-xs text-zinc-400 mt-1">{c.href}</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
