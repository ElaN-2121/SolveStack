# SolveStack
SolveStack is a tracking and analytics platform for CTF players. I built it because I was tired of scattered notes, forgotten flags, and not knowing which categories I was actually weak in. It tracks challenges, forces structured reflection through journaling, surfaces weaknesses with analytics, and stores flags encrypted with AES-256-GCM.

# Solvestack
Track CTF challenges, journal what you learn, and see your weak spots.
**Status:** Week 1 of a 20-week build. Live demo: https://solve-stack-iota.vercel.app

## Stack
Next.js 14 (App Router), TypeScript, Tailwind CSS v3, shadcn/ui, Prisma, Postgres (Neon), Vitest.

## Run locally
```bash
cd frontend
npm install
cp .env.example .env   # fill in your Neon connection strings
npx prisma migrate dev
npm run dev
```

## Test
```bash
cd frontend
npm test
```

## License
MIT
