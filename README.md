# Nightdeck

Nightdeck is a multi-tenant events platform for independent promoters. Each promoter's organization manages its own events, venues, artists, RSVPs and event finances from a dashboard, and publishes confirmed events on a public site. The live site is at [nightdeck.live](https://nightdeck.live). It is built with Next.js 16.2.4 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS 4 and Supabase (Postgres, Auth and Realtime through `@supabase/ssr` and `@supabase/supabase-js`). Confirmation emails are sent with Resend. The code uses several names: the npm package is `ongho-platform`, the dashboard and login UI say "Ongho", and the public site and emails say "Shore Pulse".

## Features

- **Org-scoped data.** Every signed-in user has a `user_profiles` row that links them to one organization and a role. Dashboard server actions and queries run as the signed-in user. Inserts set `org_id` from the session, and updates and lineup, expense and revenue writes first check that the event, venue or artist belongs to the session's organization. See [docs/schema.md](docs/schema.md) for which tables carry `org_id`.
- **Dashboard** (`/dashboard`): create and edit events, venues and artists; build an event lineup with agreed pay and set order; mark artists paid; log expenses and revenue per event; view a per-event profit and loss summary from the `get_event_pnl` database function; view confirmed RSVPs; see a live RSVP count per event (Supabase Realtime subscription on `rsvps`).
- **PIN-first login.** `/login` shows an email and PIN form first, with an email and password form behind a "Forgot PIN? Sign in with password" link. Password reset by email leads to a "set a new PIN" page.
- **Public site.** Home page, event list and event detail (`/events`, `/events/[slug]`), artist pages (`/artists`, `/artists/[slug]`) and venue pages (`/venues`, `/venues/[slug]`). Public queries use an anonymous Supabase client. Public events are filtered to `status = confirmed`, artists to `vetted = true` and venues to `active = true`.
- **RSVPs.** The event detail page has an RSVP form that posts to `/api/rsvp`. The route validates the input, rejects events that are not confirmed or are at their RSVP limit, reuses an existing attendee with the same email, rejects a second confirmed RSVP for the same event and attendee, and sends a confirmation email with a QR code of the confirmation code.
- **Staff QR check-in** at `/check-in/[event_id]`. Requires a signed-in user. The page scans QR codes with the browser `BarcodeDetector` API when available and always offers manual code entry. Each code is posted to `/api/check-in`, which confirms that the event belongs to the user's organization before marking the RSVP checked in.
- **Public attendance form** at `/attend/[event_id]`. No login. It asks four questions (attendee or performer, first time or not, how they heard about the event, what brought them) and posts to `/api/attend`. The event detail page in the dashboard shows a QR code for this URL, built from `NEXT_PUBLIC_APP_URL`, for display at the venue. `/api/attend` rate limits to 3 submissions per IP address per event per hour. The limiter is an in-memory `Map` in the route module, so counts are per server instance and reset when the instance restarts.

## Getting started

### Install

The repository contains both `pnpm-lock.yaml` and `package-lock.json`. `package-lock.json` is out of sync with `package.json` (it has no entry for `next-themes`), so `npm ci` fails. `pnpm install --frozen-lockfile` succeeds with `pnpm-lock.yaml`, so use pnpm.

```bash
pnpm install
```

No Node.js version is pinned in the repository (no `engines` field or `.nvmrc`).

### Environment variables

Copy `.env.example` to `.env.local` (`.env.local` is gitignored) and fill in the values.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. Read by `src/proxy.ts` and by the browser, server, public and service clients in `src/lib/supabase/`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon-level) key. Read in the same places as the URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key. Server only. Used by `createServiceClient()` in `/api/rsvp`, `/api/attend`, `/api/check-in` and the PIN and display name actions. It bypasses row level security, so never expose it to the browser. |
| `RESEND_API_KEY` | Resend API key for RSVP confirmation emails in `/api/rsvp`. |
| `RESEND_FROM_EMAIL` | Sender address for those emails. Falls back to `onboarding@resend.dev` if unset. |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app. Used to build the `/attend/[event_id]` link encoded in the dashboard QR code. If unset, the code falls back to a hardcoded default host, so set it. |
| `APP_URL` | Listed in `.env.example` but not read anywhere in `src/`. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_S3_PUBLIC_URL` | Listed in `.env.example`, and `@aws-sdk/client-s3` is a dependency, but no code in `src/` reads these variables yet. `next.config.ts` allows `next/image` to load from `**.amazonaws.com`. |

`next.config.ts` also allows images from `chart.googleapis.com` and `**.supabase.co`.

### Run locally

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000). The app needs a Supabase project with the tables described in [docs/schema.md](docs/schema.md). The repository does not contain SQL to create them.

### Scripts

From `package.json`:

| Script | Command |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |

There is no test script.

## Project structure

```
src/
  app/          Routes (App Router)
  components/   React components
  emails/       React Email templates
  lib/          Shared server and client code
  types/        TypeScript types
  proxy.ts      Request proxy (see Authentication)
```

- `src/app/`
  - `page.tsx`, `events/`, `artists/`, `venues/`: public site.
  - `login/`: login page and the `loginWithPassword` server action.
  - `auth/callback/`: route handler for Supabase auth links. `auth/reset-password/`: set-a-new-PIN page.
  - `dashboard/`: authenticated pages (`events/`, `artists/`, `venues/`, `settings/`) with their server actions in `actions.ts` files, and a `layout.tsx` that calls `requireSession()`.
  - `check-in/[event_id]/`: staff check-in page.
  - `attend/[event_id]/`: public attendance form page.
  - `api/rsvp`, `api/attend`, `api/check-in`: route handlers.
- `src/components/`
  - `auth/`: `LoginForm`, `PINLogin`, `PasswordLogin`.
  - `attend/`: `AttendForm`, `AttendQRCode`.
  - `dashboard/`: sidebar, header, banners, `PINSetup`, `RSVPCounter`, `CheckInScanner`.
  - `ui/`: shared UI (`SiteNav`, `EventCard`, `RSVPForm`, and button, badge, tooltip, separator and sonner wrappers).
  - `canvas/`: `ParticleField`.
- `src/emails/`: `RSVPConfirmation`.
- `src/lib/`
  - `supabase/`: `client.ts` (browser client), `server.ts` (cookie-based server client, `createPublicClient()` and `createServiceClient()`).
  - `queries/`: read helpers for events, artists, venues, RSVPs and financials.
  - `session.ts`: `requireSession()` and `getSession()`.
  - `validate.ts`: input validators used by routes and server actions.
  - `utils.ts`: class name helper.
- `src/types/`: `database.types.ts` (generated Supabase types) and `index.ts` (row aliases and composed types).

## Authentication

Authentication uses Supabase Auth. A user's PIN is their Supabase auth password: `PINLogin` calls `supabase.auth.signInWithPassword({ email, password: pin })`, and `PINSetup` and the reset page set a PIN with `supabase.auth.updateUser({ password: pin })`. The PIN form accepts digits only and caps the PIN at 8 digits, and the setup and reset forms require at least 4. These limits are enforced in the client forms only; nothing else in the repository enforces them. The "Sign in with password" fallback calls `signInWithPassword` through the `loginWithPassword` server action, so the PIN and the password are one credential.

After sign-in, `requireSession()` (`src/lib/session.ts`) verifies the user with `supabase.auth.getUser()` and reads `org_id` and `role` from `user_profiles`. A signed-in user with no profile row is redirected to `/login`.

`src/proxy.ts` is the Next.js 16 proxy file (the renamed `middleware` convention). On each matched request it builds a Supabase server client from the request cookies, calls `supabase.auth.getUser()` (which refreshes the session cookies on the response), and redirects to `/login` when there is no user and the path starts with `/dashboard` or `/check-in`. All other paths pass through.

The matcher excludes:

- `_next/static`
- `_next/image`
- `favicon.ico`
- `auth/callback`
- files ending in `.svg`, `.png`, `.jpg`, `.jpeg`, `.gif` or `.webp`

`/api/*` routes are not excluded from the proxy, but the proxy does not gate them. `/api/check-in` checks for a signed-in user and organization ownership itself. `/api/rsvp` and `/api/attend` are public.

`/auth/callback` exchanges a `code` for a session or verifies a `token_hash`, then redirects to a relative `next` path (default `/dashboard`). Password-recovery sign-ins are sent to `/auth/reset-password`. Failures redirect to `/login`.

## Data model

See [docs/schema.md](docs/schema.md) for the tables the code reads and writes, their relationships and the routes that use them. It also lists what could not be confirmed from the repository.

## Deployment

The repository contains no deployment configuration: no `vercel.json`, no CI workflow and no Dockerfile. The scripts in `package.json` (`build`, `start`) are the standard Next.js ones. Production environment variables are not defined in the repository. Set the variables from the table above in the hosting environment for the deployment.

## Working with AI agents

Read [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md) before using an AI coding agent on this repository. `CLAUDE.md` imports `AGENTS.md`, which warns that this Next.js version has breaking changes and tells agents to read the guides in `node_modules/next/dist/docs/` before writing code.
