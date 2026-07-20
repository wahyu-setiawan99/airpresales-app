# AirPresales — Consultant Relationship CRM

A mobile-first PWA for HVAC / lift / pump presales at PT Airtek. It keeps consultant
relationships warm with daily outreach reminders ("who should I meet today"), quick
interaction logging, project spec-status tracking, and a bit of gamification (points,
streaks, achievements) to make staying in touch rewarding.

## Tech stack

- **React 19** + **Vite 8** (plain JS / JSX)
- **Tailwind CSS v4**
- **react-router-dom 7**
- **date-fns**, **lucide-react**
- **vite-plugin-pwa** (installable, offline-capable)
- Data currently persists in the browser (**localStorage**). Cloud sync via **Supabase**
  is the next milestone — the data layer is isolated in `src/context/DataContext.jsx`
  + `src/lib/store.js` to make that swap clean.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
```

To open it on your phone during development, run `npm run dev -- --host` and visit the
Network URL it prints from a phone on the same Wi-Fi.

## Build & preview production (with the service worker)

```bash
npm run build
npm run preview      # serves the built app so you can test PWA install
```

## Regenerating app icons

Icons are generated from `public/icon.svg` (and `public/icon-maskable.svg`):

```bash
node scripts/gen-icons.mjs
```

## Deploy (GitHub → Vercel, auto-deploy on push)

1. Create an **empty** repo on GitHub (no README/gitignore).
2. Push this project (see the commands your assistant provided).
3. On [vercel.com](https://vercel.com) → **Add New… → Project** → import the GitHub repo.
4. Framework preset auto-detects **Vite** (Build `vite build`, Output `dist`). Deploy.
5. Every `git push` to the main branch now redeploys automatically. Pull requests get
   their own preview URLs.

### Later: Supabase env vars

When Supabase is wired up, add these in Vercel → Project → Settings → Environment
Variables (and locally in a `.env` file, copied from `.env.example`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
