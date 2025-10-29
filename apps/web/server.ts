// apps/web/server.ts
import next from 'next'
import http from 'http'
import { parse } from 'url'
import { WebSocketServer, WebSocket } from 'ws'

type Ctx = { room: string; nick: string; role: 'gm' | 'player' }

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = Number(process.env.PORT || 3000)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const clients = new Map<WebSocket, Ctx>()
const sceneByRoom = new Map<string, any>()
const presenceByRoom = new Map<string, Set<string>>()

function presence(room: string) {
  const set = presenceByRoom.get(room) || new Set<string>()
  const payload = {
    kind: 'presence',
    room,
    nicks: Array.from(set),
    count: set.size
  }
  for (const [ws, ctx] of clients) {
    if (ctx.room === room && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }
}

async function main() {
  await app.prepare()
  const server = http.createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error(err)
      res.statusCode = 500
      res.end('internal error')
    }
  })

  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (req, socket, head) => {
    const { url } = req
    if (!url || !url.startsWith('/ws')) {
      socket.destroy()
      return
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  })

  wss.on('connection', (ws) => {
    clients.set(ws, { room: 'lobby', nick: 'anon', role: 'player' })

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(String(msg))
        if (data?.kind === 'hello') {
          const ctx = clients.get(ws)!
          ctx.room = String(data.room || 'lobby')
          ctx.nick = String(data.nick || 'anon')
          ctx.role = data.role === 'gm' ? 'gm' : 'player'
          clients.set(ws, ctx)
          if (!presenceByRoom.has(ctx.room)) presenceByRoom.set(ctx.room, new Set())
          presenceByRoom.get(ctx.room)!.add(ctx.nick)
          presence(ctx.room)
          return
        }
        if (data?.kind === 'scene' && data.room) {
          sceneByRoom.set(String(data.room), data)
          for (const [other, ctx] of clients) {
            if (ctx.room === data.room && other !== ws && other.readyState === WebSocket.OPEN) {
              other.send(JSON.stringify(data))
            }
          }
          return
        }
      } catch (e) {
        console.error('WS parse error', e)
      }
    })

    ws.on('close', () => {
      const ctx = clients.get(ws)
      clients.delete(ws)
      if (ctx) {
        const set = presenceByRoom.get(ctx.room)
        if (set) { set.delete(ctx.nick); presence(ctx.room) }
      }
    })
  })

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://localhost:${port}`)
    console.log(`[WS] listening on ws://0.0.0.0:${port}/ws`)
  })
}

main().catch(err => { console.error(err); process.exit(1) })
