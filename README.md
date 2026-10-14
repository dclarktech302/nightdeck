# Nightdeck

Nightdeck is a multi-tenant events platform for independent promoters. Live at [nightdeck.live](https://nightdeck.live).

Built with Next.js 16.2.4, React 19.2.4, TypeScript, Tailwind CSS 4, Supabase (Postgres and Auth) and Resend.

## Features

- Org-scoped data: each user belongs to one organization and only works with its events, venues and artists.
- Dashboard for events, venues, artists, lineups, expenses, revenue and RSVPs.
- PIN-first login, with email and password as a fallback.
- Public pages for events, artists and venues, with RSVP and a confirmation email.
- Staff QR check-in at `/check-in/[event_id]`.
- Public attendance form at `/attend/[event_id]`, with a QR code generator in the dashboard. Submissions are rate limited per IP and event.

## Getting started

Install dependencies with pnpm. `package-lock.json` is out of sync with `package.json`, so `npm ci` fails.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000) and needs a Supabase project with the tables in [docs/schema.md](docs/schema.md).

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key. Server only; bypasses row level security |
| `RESEND_API_KEY` | Resend API key for RSVP confirmation emails |
| `RESEND_FROM_EMAIL` | Sender address for those emails |
| `NEXT_PUBLIC_APP_URL` | Public base URL, used for the attendance QR code link |

`.env.example` also lists `APP_URL` and the `AWS_*` variables. Nothing in `src/` reads them yet.

### Scripts

| Script | Command |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |

## Project structure

- `src/app/`: routes and API handlers
- `src/components/`: React components
- `src/emails/`: email templates
- `src/lib/`: Supabase clients, queries, session helper and validators
- `src/types/`: TypeScript types, including the generated Supabase types
- `src/proxy.ts`: request proxy, see Authentication

## Authentication

Authentication uses Supabase Auth. A user's PIN is stored as their Supabase auth password.

`src/proxy.ts` refreshes the session and redirects signed-out users to `/login` for `/dashboard` and `/check-in`. It does not run on `_next/static`, `_next/image`, `favicon.ico`, `auth/callback` or image files (`.svg`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`).

## Data model

See [docs/schema.md](docs/schema.md).

## Deployment

The repository has no deployment configuration. Set the environment variables above in the hosting environment.

## Working with AI agents

See [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md).
