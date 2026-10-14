# Schema reference

This document describes the Supabase `public` schema as far as it can be confirmed from this repository. The sources are:

- `src/types/database.types.ts`: generated Supabase types (tables, columns as TypeScript types, foreign keys, enums, function signatures).
- The queries, route handlers, server actions and components that read or write each table.

The repository contains no SQL (no migrations, no `.sql` files). Anything that is not in the generated types or visible in code is listed under [Needs confirmation from the Supabase dashboard](#needs-confirmation-from-the-supabase-dashboard) and not described elsewhere.

## How schema changes are applied

Schema changes are applied by running SQL manually in the Supabase SQL editor. They are not applied through migrations, and nothing in this repository records them. After a change, `src/types/database.types.ts` has to be regenerated or edited by hand to match. It is already out of date in at least one place (see `user_profiles` and `event_attendance` below).

## Reading the column tables

- **Type** is the TypeScript type from `database.types.ts` (`string` includes uuid, text and timestamp columns). The Postgres column types are not in the repository.
- **Insert** is `required` when the column is required in the generated `Insert` type and `optional` when it is optional there. Optional means the column is nullable or has a database default. The generated types do not say which.
- Access is made by one of three Supabase clients from `src/lib/supabase/server.ts`:
  - *user client*: `createClient()`, runs as the signed-in user with their session cookie.
  - *public client*: `createPublicClient()`, anonymous.
  - *service client*: `createServiceClient()`, uses the service role key and bypasses row level security.

## Tenancy

`organizations` is the tenant. `org_id` exists on `artists`, `events`, `venues` and `user_profiles`. The other tables have no `org_id` column in the generated types and belong to an organization through `event_id` and `events.org_id`.

`attendees` has no `org_id` and no `event_id`. `/api/rsvp` looks up an attendee by email and reuses the row for any event, so one attendee row can be linked to RSVPs on events of different organizations.

## Relationships

Foreign keys listed in the generated types:

| Constraint | From | To |
| --- | --- | --- |
| `artists_org_id_fkey` | `artists.org_id` | `organizations.id` |
| `events_org_id_fkey` | `events.org_id` | `organizations.id` |
| `events_venue_id_fkey` | `events.venue_id` | `venues.id` |
| `venues_org_id_fkey` | `venues.org_id` | `organizations.id` |
| `user_profiles_org_id_fkey` | `user_profiles.org_id` | `organizations.id` |
| `event_artists_event_id_fkey` | `event_artists.event_id` | `events.id` |
| `event_artists_artist_id_fkey` | `event_artists.artist_id` | `artists.id` |
| `expenses_event_id_fkey` | `expenses.event_id` | `events.id` |
| `revenue_event_id_fkey` | `revenue.event_id` | `events.id` |
| `rsvps_event_id_fkey` | `rsvps.event_id` | `events.id` |
| `rsvps_attendee_id_fkey` | `rsvps.attendee_id` | `attendees.id` |

`event_artists` is the join table between `events` and `artists`.

## Enums

From `database.types.ts`:

| Enum | Values |
| --- | --- |
| `event_status` | `draft`, `pending`, `confirmed`, `completed`, `cancelled` |
| `artist_booking_status` | `invited`, `confirmed`, `declined` |
| `payment_status` | `pending`, `paid` |
| `revenue_source` | `door`, `bar_split`, `sponsorship`, `merch`, `other` |
| `expense_category` | `venue`, `artist`, `promo`, `equipment`, `other` |
| `rsvp_status` | `confirmed`, `cancelled` |
| `org_plan` | `portfolio`, `starter`, `pro` |

## Functions

| Function | Signature (from generated types) | Used by |
| --- | --- | --- |
| `get_event_pnl` | `(p_event_id: string)` returns rows of `{ total_revenue, total_expenses, artist_costs, net }`, all `number` | `getEventPnL()` in `src/lib/queries/financials.ts`, called by `/dashboard/events/[id]`. The code uses the first row. |
| `my_org_id` | `()` returns `string` | Not called anywhere in `src/`. |

The function bodies are not in the repository.

## Tables

### organizations

The tenant. Referenced by foreign key from `artists`, `events`, `venues` and `user_profiles`. No code in `src/` reads or writes this table; it appears only in the generated types and the `Organization` and `OrgPlan` aliases in `src/types/index.ts`.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `name` | `string` | required |
| `slug` | `string` | required |
| `plan` | `org_plan` | optional |
| `created_at` | `string` | optional |

### user_profiles

Links an auth user to an organization and a role. `requireSession()` and `getSession()` read it for every authenticated request, and a signed-in user without a row is treated as not set up.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `user_id` | `string` | required |
| `org_id` | `string` | required |
| `role` | `string` | optional |
| `created_at` | `string` | optional |

Columns used by the code but missing from the generated types (accessed through `as any`):

| Column | Use |
| --- | --- |
| `has_set_pin` | Read by `WelcomeBanner` (browser client; the banner shows when the value is `false`). Set to `true` by `markPinSetupSeen()` in `src/app/dashboard/actions.ts`, which `WelcomeBanner` and `/auth/reset-password` call. |
| `display_name` | Read by `/dashboard/settings` and the dashboard layout for the greeting. Written by `updateDisplayName()` in `src/app/dashboard/settings/actions.ts` (set to `null` when blank). |

Relationships: `org_id` references `organizations.id`. `user_id` is matched against the Supabase auth user id; no foreign key to `auth.users` appears in the generated types.

Used by:

- `src/lib/session.ts` (`org_id`, `role`), so by every page that calls `requireSession()` or `getSession()`.
- `/api/check-in` (`org_id`, user client).
- `/dashboard` layout (`display_name`), `/dashboard/settings` (`display_name`).
- `markPinSetupSeen()` and `updateDisplayName()` (service client, filtered by `user_id`).
- `WelcomeBanner` (`has_set_pin`, browser client).

No code in `src/` inserts rows.

### venues

Venues owned by an organization.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `org_id` | `string` | required |
| `name` | `string` | required |
| `slug` | `string \| null` | optional |
| `address` | `string \| null` | optional |
| `city` | `string \| null` | optional |
| `state` | `string \| null` | optional |
| `capacity` | `number \| null` | optional |
| `vibe_tags` | `string[] \| null` | optional |
| `google_maps_embed` | `string \| null` | optional |
| `instagram_url` | `string \| null` | optional |
| `cover_image_url` | `string \| null` | optional |
| `active` | `boolean` | optional |
| `created_at` | `string` | optional |

Relationships: `org_id` references `organizations.id`. Referenced by `events.venue_id`.

Written by `createVenue()` and `updateVenue()` (`src/app/dashboard/venues/actions.ts`, user client). They set `org_id` from the session on insert and generate `slug` from the name plus a random 5-character suffix. They do not write `cover_image_url`.

Read by:

- `getPublicVenues()` and `getPublicVenueBySlug()` (public client, `active = true`): `/venues`, `/venues/[slug]`.
- `getDashboardVenues()` (user client): `/dashboard/venues`, `/dashboard/venues/[id]`, `/dashboard/events/new`, `/dashboard/events/[id]`.
- As a join from `events` (name, address, city, state, slug, capacity, `google_maps_embed`) in the event queries and in `/api/rsvp`.

### artists

Artist records owned by an organization. `vetted` controls public visibility.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `org_id` | `string` | required |
| `name` | `string` | required |
| `slug` | `string \| null` | optional |
| `bio` | `string \| null` | optional |
| `genre_tags` | `string[] \| null` | optional |
| `instagram_url` | `string \| null` | optional |
| `spotify_url` | `string \| null` | optional |
| `media_url` | `string \| null` | optional |
| `photo_url` | `string \| null` | optional |
| `tech_rider` | `string \| null` | optional |
| `contact_email` | `string \| null` | optional |
| `contact_phone` | `string \| null` | optional |
| `default_rate` | `number \| null` | optional |
| `vetted` | `boolean` | optional |
| `created_at` | `string` | optional |

Relationships: `org_id` references `organizations.id`. Referenced by `event_artists.artist_id`.

Written by `createArtist()`, `updateArtist()` and `unvetArtist()` (`src/app/dashboard/artists/actions.ts`, user client). `unvetArtist()` sets `vetted = false` instead of deleting. They do not write `photo_url`.

Read by:

- `getPublicArtists()` and `getPublicArtistBySlug()` (public client, `vetted = true`): `/artists`, `/artists/[slug]`.
- `getDashboardArtists()` and `getDashboardArtistById()` (user client): `/dashboard/artists`, `/dashboard/artists/[id]`, `/dashboard/events/[id]`.
- As a join from `event_artists` in the event queries.
- `/dashboard` (count).

### events

Events owned by an organization.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `org_id` | `string` | required |
| `name` | `string` | required |
| `slug` | `string \| null` | optional |
| `description` | `string \| null` | optional |
| `event_date` | `string` | required |
| `doors_open` | `string \| null` | optional |
| `show_start` | `string \| null` | optional |
| `venue_id` | `string \| null` | optional |
| `status` | `event_status` | optional |
| `featured` | `boolean` | optional |
| `capacity` | `number \| null` | optional |
| `door_price` | `number \| null` | optional |
| `rsvp_limit` | `number \| null` | optional |
| `rsvp_count` | `number` | optional |
| `cover_image_url` | `string \| null` | optional |
| `media_url` | `string \| null` | optional |
| `created_at` | `string` | optional |

Relationships: `org_id` references `organizations.id`, `venue_id` references `venues.id`. Referenced by `event_artists`, `expenses`, `revenue` and `rsvps`.

Written by `createEvent()` and `updateEvent()` (`src/app/dashboard/events/actions.ts`, user client). They write `name`, `description`, `event_date`, `doors_open`, `venue_id`, `door_price`, `rsvp_limit`, `status` and `featured`. `createEvent()` also writes `org_id` (from the session) and `slug` (from the name plus a random suffix). Status defaults to `draft` in the action when the submitted value is not one of the enum values. No code writes `capacity`, `show_start`, `cover_image_url`, `media_url` or `rsvp_count`.

Read by:

- `getUpcomingEvents()`, `getFeaturedEvents()`, `getEventBySlug()` (public client, `status = confirmed`): `/`, `/events`, `/events/[slug]`, and the artist and venue detail pages.
- `/attend/[event_id]` (public client, `name` by `id`, no status filter).
- `getDashboardEvents()` and `getDashboardEventById()` (user client): `/dashboard`, `/dashboard/events`, `/dashboard/events/[id]`.
- `/dashboard` stats (counts of upcoming confirmed events).
- `/check-in/[event_id]` (`id`, `name`, `event_date`, `rsvp_count`).
- `RSVPCounter` (browser client, `rsvp_count`), re-read when a Realtime change arrives on `rsvps`.
- `/api/rsvp` (service client, requires `status = confirmed`, reads `rsvp_limit` and `rsvp_count`).
- `/api/attend` (service client, existence check).
- `/api/check-in` (service client, `id` and `org_id` ownership check).
- Ownership checks (`id` and `org_id`) in the lineup, expense and revenue actions.

### event_artists

Lineup: which artists are booked on an event, with pay and order.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `event_id` | `string` | required |
| `artist_id` | `string` | required |
| `booking_status` | `artist_booking_status` | optional |
| `pay_status` | `payment_status` | optional |
| `agreed_pay` | `number \| null` | optional |
| `set_order` | `number \| null` | optional |
| `created_at` | `string` | optional |

Relationships: `event_id` references `events.id`, `artist_id` references `artists.id`.

Written by `addArtistToLineup()` (insert with `booking_status = confirmed`, `pay_status = pending`), `removeArtistFromLineup()` (delete) and `markArtistPaid()` (sets `pay_status = paid`), all in `src/app/dashboard/events/actions.ts` (user client). Each action first checks that the event belongs to the session's organization. The delete and update then filter on the `event_artists.id` only.

Read as a join from `events` by `getEventBySlug()` (public) and `getDashboardEventById()` (dashboard), so by `/events/[slug]` and `/dashboard/events/[id]`.

### expenses

Costs logged against an event.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `event_id` | `string` | required |
| `category` | `expense_category` | required |
| `description` | `string \| null` | optional |
| `amount` | `number` | required |
| `created_at` | `string` | optional |

Relationships: `event_id` references `events.id`.

Written by `addExpense()` (insert; checks event ownership first). Read by `getExpensesByEvent()` for `/dashboard/events/[id]`.

### revenue

Income logged against an event. The table name is singular.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `event_id` | `string` | required |
| `source` | `revenue_source` | required |
| `amount` | `number` | required |
| `notes` | `string \| null` | optional |
| `created_at` | `string` | optional |

Relationships: `event_id` references `events.id`.

Written by `addRevenue()` (insert; checks event ownership first). Read by `getRevenueByEvent()` for `/dashboard/events/[id]` and by `/dashboard` (sum of `amount` for rows created this month, across whatever rows the user client can see).

### attendees

A person who has RSVPed. Not tied to an organization or event directly.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `first_name` | `string` | required |
| `email` | `string` | required |
| `phone` | `string \| null` | optional |
| `source` | `string \| null` | optional |
| `created_at` | `string` | optional |

Relationships: referenced by `rsvps.attendee_id`.

Written only by `/api/rsvp` (service client). It looks up an attendee by lowercased email and reuses the row if found without updating it. Otherwise it inserts `email`, `first_name`, `phone` and `source` (`source` defaults to `direct` in the route).

Read as a join from `rsvps` (`first_name`, `email`, `phone`, `id`) by `getRSVPsByEvent()` (`/dashboard/events/[id]`), by `/dashboard` recent activity (`first_name`) and by `/api/check-in` (`first_name`).

### rsvps

One RSVP per attendee per event, with party size and check-in state.

| Column | Type | Insert |
| --- | --- | --- |
| `id` | `string` | optional |
| `event_id` | `string` | required |
| `attendee_id` | `string` | required |
| `party_size` | `number` | optional |
| `status` | `rsvp_status` | optional |
| `confirmation_code` | `string` | optional |
| `checked_in` | `boolean` | optional |
| `checked_in_at` | `string \| null` | optional |
| `reminder_48hr_sent` | `boolean` | optional |
| `reminder_2hr_sent` | `boolean` | optional |
| `created_at` | `string` | optional |

Relationships: `event_id` references `events.id`, `attendee_id` references `attendees.id`.

`confirmation_code` is optional on insert, so the database supplies it. `/api/rsvp` reads it back after inserting and puts it in the confirmation email's QR code. `/api/check-in` looks RSVPs up by it.

Written by:

- `/api/rsvp` (service client): inserts `event_id`, `attendee_id`, `party_size`, `status = confirmed`.
- `/api/check-in` (service client): sets `checked_in = true` and `checked_in_at`.

No code in `src/` writes `reminder_48hr_sent` or `reminder_2hr_sent` or sets `status` to `cancelled`.

Read by:

- `getRSVPsByEvent()` (`status = confirmed`, with attendee join): `/dashboard/events/[id]`.
- `/dashboard` (party sizes this month, check-in totals, 8 most recent RSVPs with attendee and event joins).
- `/check-in/[event_id]` (count of `checked_in` rows).
- `/api/rsvp` (duplicate check on `event_id`, `attendee_id`, `status = confirmed`).
- `/api/check-in` (lookup by `confirmation_code`, `event_id` and `status = confirmed`).
- `RSVPCounter` subscribes to Realtime changes on this table, filtered by `event_id`, from the browser client.
- `getRSVPByConfirmationCode()` and `getExistingRSVP()` in `src/lib/queries/rsvps.ts` are defined but not called.

### event_attendance

Responses to the public attendance form at `/attend/[event_id]`. **This table is not in `database.types.ts`.** It is accessed through `(supabase as any)` in `/api/attend`, so everything below comes from that one insert.

Columns written by `/api/attend` (service client, insert only):

| Column | Values accepted by the route |
| --- | --- |
| `event_id` | An existing `events.id` (the route checks the event exists first). |
| `attendee_type` | `attendee` or `performer` |
| `first_time` | `boolean` |
| `referral_source` | `friend`, `performer`, `venue`, `social_media`, `other` |
| `primary_reason` | `performer`, `venue`, `friends`, `supporting_local_scene`, `looking_for_something_to_do` |

The route inserts no person identifier, so responses are anonymous. Nothing in `src/` reads this table. Whether `event_id` is a foreign key, and whether the table has other columns (for example an id or timestamp), cannot be confirmed here.

## Needs confirmation from the Supabase dashboard

None of the following can be confirmed from the repository. Check each in the dashboard and update this document.

**Row level security**

- Whether RLS is enabled on each table, and every policy on it. No SQL is in the repo.
- The code assumes, in comments, that the user client is scoped to the signed-in user's organization ("RLS does the rest") and that the anonymous client sees only confirmed events. The actual policies are not confirmed. Several user-client reads rely on this and have no `org_id` filter in code (`getDashboardEvents`, `getDashboardArtists`, `getDashboardVenues`, `getRSVPsByEvent`, `getExpensesByEvent`, `getRevenueByEvent`, the `/dashboard` stats and `/check-in/[event_id]`).
- Whether the anonymous role can read `attendees`, `rsvps`, `expenses`, `revenue`, `user_profiles` or `event_attendance`.
- What `my_org_id()` does and whether policies use it.

**Tables and columns**

- `event_attendance`: the full column list, types, defaults, primary key, and any foreign key to `events`.
- `user_profiles.has_set_pin` and `user_profiles.display_name`: types, nullability and defaults. They are missing from the generated types.
- Postgres types for every column (for example whether `amount`, `door_price` and `default_rate` are `numeric`, and whether `event_date`, `doors_open` and `show_start` are `timestamptz`, `time` or `text`).
- `NOT NULL` and default values behind each "optional" insert column, including the default for `id`, `created_at`, `status`, `role`, `plan` and `confirmation_code`.
- Whether `organizations` has rows created by any process, and how new organizations and their first `user_profiles` rows are provisioned. No code in `src/` does it.
- Whether `user_profiles.user_id` has a foreign key to `auth.users`.

**Constraints and indexes**

- Primary keys on every table.
- Unique constraints. In particular: `slug` on `events`, `venues` and `artists` (the code appends a random suffix, which suggests uniqueness is expected but this is not confirmed); `attendees.email` (the code looks up by email with `maybeSingle()`); `rsvps.confirmation_code`; one RSVP per `event_id` and `attendee_id` (the code checks this in application code only); one `user_profiles` row per `user_id` (the code uses `.single()`).
- `ON DELETE` behavior of each foreign key in the relationships table. For example, what happens to `event_artists`, `rsvps`, `expenses` and `revenue` when an event is deleted. No code in `src/` deletes events.
- Indexes.
- Check constraints (for example on `party_size`, `rsvp_limit` or `amount`). The app limits `party_size` to 1 through 10 in `/api/rsvp`; whether the database does is not confirmed.

**Triggers and functions**

- How `events.rsvp_count` is maintained. A comment in `RSVPCounter` says a trigger keeps it accurate, and no code in `src/` writes it, but the trigger itself is not in the repo. It is not known whether it counts RSVPs or sums `party_size`, or how it treats `cancelled` RSVPs.
- How `rsvps.confirmation_code` is generated (a comment in the email template says it is a UUID, but the default is not confirmed).
- The bodies of `get_event_pnl` and `my_org_id`: which tables `get_event_pnl` reads (it is assumed, not confirmed, to use `revenue`, `expenses` and `event_artists`) and whether it runs with the caller's rights or as the function owner.
- Any scheduled job that uses `reminder_48hr_sent` and `reminder_2hr_sent`. No code in `src/` sends reminders.

**Realtime**

- Whether `rsvps` is in the Supabase Realtime publication. `RSVPCounter` assumes it is.
