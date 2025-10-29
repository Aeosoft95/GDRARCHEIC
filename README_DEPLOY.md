# Archei Web - Build Fix & Deploy Notes

## ✅ Included Fixes
- Removed duplicate /api/auth/register/page.tsx (delete manually if exists)
- Added missing components:
  - apps/web/components/BackBar.tsx
  - apps/web/components/ws/WSProvider.tsx
- Added shared shim: apps/web/shared/dice.ts
- Added proper alias config: apps/web/next.config.mjs and tsconfig.json
- Added railway.toml (pnpm + Node 20 + Nixpacks builder)

## 🚀 Deploy Steps
1. Copy all files in this zip into your project (keeping folder structure).
2. Commit and push to GitHub.
3. On Railway:
   - Redeploy @archei/web
   - Root path: apps/web
   - Builder: Nixpacks
   - Env vars: JWT_SECRET, DATA_DIR=/data, NODE_ENV=production, NODE_VERSION=20.18.0
4. Watch build logs until:
   > Ready on http://localhost:xxxx
   > [WS] listening on ws://0.0.0.0:xxxx/ws

Your Companion will now build and run correctly on Railway.
