# Schema reference

The Supabase `public` schema as far as it can be confirmed from this repository: the generated types in `src/types/database.types.ts` and the code that reads or writes each table. Anything else is in Supabase (see [Not in this repository](#not-in-this-repository)).

Schema changes are applied by running SQL manually in the Supabase SQL editor, not through migrations. Nothing in this repository records them, so `database.types.ts` has to be regenerated or edited by hand afterwards. It is already out of date (see `user_profiles` and `event_attendance`).

Column types are the TypeScript types from the generated types. `?` means nullable. Postgres types are not in the repository.

## Tenancy and relationships

`organizations` is the tenant. `artists`, `events`, `venues` and `user_profiles` have `org_id`. Every other table belongs to an organization through `event_id` and `events.org_id`. `attendees` has neither, and `/api/rsvp` reuses an attendee row by email, so one attendee can have RSVPs on events of different organizations.

Foreign keys from the generated types:

- `artists.org_id`, `events.org_id`, `venues.org_id`, `user_profiles.org_id` → `organizations.id`
- `events.venue_id` → `venues.id`
- `event_artists.event_id` → `events.id`, `event_artists.artist_id` → `artists.id`
- `expenses.event_id`, `revenue.event_id`, `rsvps.event_id` → `events.id`
- `rsvps.attendee_id` → `attendees.id`

## Enums

- `event_status`: draft, pending, confirmed, completed, cancelled
- `artist_booking_status`: invited, confirmed, declined
- `payment_status`: pending, paid
- `revenue_source`: door, bar_split, sponsorship, merch, other
- `expense_category`: venue, artist, promo, equipment, other
- `rsvp_status`: confirmed, cancelled
- `org_plan`: portfolio, starter, pro

## Functions

- `get_event_pnl(p_event_id)` returns `{ total_revenue, total_expenses, artist_costs, net }` (numbers). Called by `getEventPnL()` for `/dashboard/events/[id]`.
- `my_org_id()` returns a string. Not called anywhere in `src/`.

Function bodies are not in the repository.

## Tables

Access uses the user client (signed-in session), the public client (anonymous) or the service client (service role key, bypasses RLS).

### organizations

The tenant. Columns: `id`, `name`, `slug`, `plan` (`org_plan`), `created_at`. No code in `src/` reads or writes it.

### user_profiles

Links an auth user to an organization and role. Columns: `id`, `user_id`, `org_id`, `role`, `created_at`. Also used by the code but missing from the generated types: `has_set_pin` and `display_name`.

Used by `requireSession()` and `getSession()` (every authenticated page), `/api/check-in`, the dashboard layout and `/dashboard/settings` (`display_name`), `WelcomeBanner` (`has_set_pin`), and the `markPinSetupSeen()` and `updateDisplayName()` actions (service client). No code inserts rows.

### venues

Columns: `id`, `org_id`, `name`, `slug?`, `address?`, `city?`, `state?`, `capacity?`, `vibe_tags?` (string[]), `google_maps_embed?`, `instagram_url?`, `cover_image_url?`, `active`, `created_at`.

Written by the venue actions (user client). Read by `/venues` and `/venues/[slug]` (public, `active = true`), the dashboard venue and event pages, and as a join from `events`. No code writes `cover_image_url`.

### artists

Columns: `id`, `org_id`, `name`, `slug?`, `bio?`, `genre_tags?` (string[]), `instagram_url?`, `spotify_url?`, `media_url?`, `photo_url?`, `tech_rider?`, `contact_email?`, `contact_phone?`, `default_rate?`, `vetted`, `created_at`.

Written by the artist actions (user client). `unvetArtist()` sets `vetted = false` instead of deleting. Read by `/artists` and `/artists/[slug]` (public, `vetted = true`), the dashboard artist and event pages, and as a join from `event_artists`. No code writes `photo_url`.

### events

Columns: `id`, `org_id`, `name`, `slug?`, `description?`, `event_date`, `doors_open?`, `show_start?`, `venue_id?`, `status` (`event_status`), `featured`, `capacity?`, `door_price?`, `rsvp_limit?`, `rsvp_count`, `cover_image_url?`, `media_url?`, `created_at`.

Written by `createEvent()` and `updateEvent()` (user client). No code writes `capacity`, `show_start`, `cover_image_url`, `media_url` or `rsvp_count`.

Read by the public pages (`/`, `/events`, `/events/[slug]`, `status = confirmed`), `/attend/[event_id]`, the dashboard pages, `/check-in/[event_id]`, `RSVPCounter` (`rsvp_count`), `/api/rsvp`, `/api/attend` and `/api/check-in`.

### event_artists

Lineup for an event. Columns: `id`, `event_id`, `artist_id`, `booking_status` (`artist_booking_status`), `pay_status` (`payment_status`), `agreed_pay?`, `set_order?`, `created_at`.

Written by the lineup actions in `src/app/dashboard/events/actions.ts` (add, remove, mark paid; user client). Read as a join from `events` by `/events/[slug]` and `/dashboard/events/[id]`.

### expenses

Columns: `id`, `event_id`, `category` (`expense_category`), `description?`, `amount`, `created_at`. Written by `addExpense()`, read by `/dashboard/events/[id]`.

### revenue

Columns: `id`, `event_id`, `source` (`revenue_source`), `amount`, `notes?`, `created_at`. Written by `addRevenue()`, read by `/dashboard/events/[id]` and the `/dashboard` stats.

### attendees

A person who has RSVPed. Columns: `id`, `first_name`, `email`, `phone?`, `source?`, `created_at`.

Written only by `/api/rsvp` (service client), which reuses an existing row with the same email without updating it. Read as a join from `rsvps` by `/dashboard/events/[id]`, `/dashboard` and `/api/check-in`.

### rsvps

Columns: `id`, `event_id`, `attendee_id`, `party_size`, `status` (`rsvp_status`), `confirmation_code`, `checked_in`, `checked_in_at?`, `reminder_48hr_sent`, `reminder_2hr_sent`, `created_at`.

Written by `/api/rsvp` (insert) and `/api/check-in` (sets `checked_in` and `checked_in_at`), both with the service client. No code writes the `reminder_*` columns or sets `status` to `cancelled`. `confirmation_code` is generated by the database and is the value in the confirmation email's QR code.

Read by `/dashboard/events/[id]`, `/dashboard`, `/check-in/[event_id]`, `/api/rsvp` and `/api/check-in`. `RSVPCounter` subscribes to Realtime changes on this table.

### event_attendance

Responses to the form at `/attend/[event_id]`. **Not in `database.types.ts`.** Everything here comes from the insert in `/api/attend` (service client). Nothing in `src/` reads the table.

Columns written: `event_id`, `attendee_type` (attendee, performer), `first_time` (boolean), `referral_source` (friend, performer, venue, social_media, other), `primary_reason` (performer, venue, friends, supporting_local_scene, looking_for_something_to_do). No person identifier is stored by the route.

## Not in this repository

RLS policies, constraints, indexes, triggers and function bodies live in Supabase, not in this repo.
Check them in the Supabase dashboard; this document does not describe them.
`event_attendance` and two `user_profiles` columns are missing from the generated types, so their definitions are also in Supabase.
