# Nightdeck

Nightdeck is a multi-tenant events platform for independent promoters. Each organization manages its own events, venues, artists, RSVPs and check-in, and publishes events on a public site. Live at [nightdeck.live](https://nightdeck.live).

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase and Resend.

## Run locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Fill in `.env.local` from [.env.example](.env.example). Two variables to know:

- `SUPABASE_SERVICE_ROLE_KEY` is server only and bypasses row level security.
- `NEXT_PUBLIC_APP_URL` is the base URL used for the attendance QR code link.

The app runs at [http://localhost:3000](http://localhost:3000) and needs a Supabase project with the tables in [docs/schema.md](docs/schema.md).

## Project structure

- `src/app/`: pages, route handlers and server actions
- `src/components/`: React components
- `src/emails/`: email templates
- `src/lib/`: Supabase clients, queries, session helper and validators
- `src/types/`: TypeScript types, including the generated Supabase types
- `src/proxy.ts`: request proxy

## Authentication

A user's PIN is stored as their Supabase auth password. `src/proxy.ts` redirects signed-out users from `/dashboard` and `/check-in` to `/login`, and skips static assets, image files and `/auth/callback`.

## Deployment

Deployed on Vercel from this repository, with a preview deployment for each branch. Production environment variables are configured in the Vercel project, not in the repo.

## Docs

- [docs/schema.md](docs/schema.md): database tables and how the code uses them.
- [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md): instructions for AI coding agents.
