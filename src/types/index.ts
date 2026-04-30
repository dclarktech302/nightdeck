import type { Tables, Enums } from './database.types'

// ─── Base row types ───────────────────────────────────────────
// These are direct aliases for the Row shapes from the generated types.
// Use these when you need a single table's data with no joins.

export type Organization = Tables<'organizations'>
export type Venue        = Tables<'venues'>
export type Artist       = Tables<'artists'>
export type Event        = Tables<'events'>
export type EventArtist  = Tables<'event_artists'>
export type Attendee     = Tables<'attendees'>
export type RSVP         = Tables<'rsvps'>
export type Expense      = Tables<'expenses'>
export type Revenue      = Tables<'revenue'>
export type UserProfile  = Tables<'user_profiles'>

// ─── Enum types ───────────────────────────────────────────────
// Pull enum value unions out so you can use them as prop types.
// Example: a StatusBadge component accepts `status: EventStatus`
// and TypeScript ensures only valid values are passed.

export type EventStatus         = Enums<'event_status'>
export type ArtistBookingStatus = Enums<'artist_booking_status'>
export type PaymentStatus       = Enums<'payment_status'>
export type RevenueSource       = Enums<'revenue_source'>
export type ExpenseCategory     = Enums<'expense_category'>
export type RSVPStatus          = Enums<'rsvp_status'>
export type OrgPlan             = Enums<'org_plan'>

// ─── Composed types (joined data) ─────────────────────────────
// These represent what pages actually need — data from multiple
// tables joined together. The & operator merges two types.
// The Omit removes fields you're replacing with richer versions.

// An event with its venue attached.
// Used on: Shore Pulse event cards, event detail page.
export type EventWithVenue = Event & {
  venues: Pick<Venue, 'name' | 'address' | 'city' | 'state' | 'slug' | 'google_maps_embed'> | null
}

// An artist entry in a lineup — the join table row plus artist details.
// Used on: event detail page lineup section, ops dashboard lineup editor.
export type LineupArtist = EventArtist & {
  artists: Pick<Artist, 'id' | 'name' | 'slug' | 'photo_url' | 'genre_tags' | 'instagram_url' | 'spotify_url'>
}

// A fully loaded event — venue + full lineup.
// Used on: Shore Pulse event detail page, ops dashboard event detail.
export type EventWithLineup = EventWithVenue & {
  event_artists: LineupArtist[]
}

// An RSVP with the attendee's details attached.
// Used on: ops dashboard attendee list, check-in tool.
export type RSVPWithAttendee = RSVP & {
  attendees: Pick<Attendee, 'id' | 'first_name' | 'email' | 'phone'>
}

// ─── P&L result type ──────────────────────────────────────────
// Matches the return shape of the get_event_pnl() database function.
export type EventPnL = {
  total_revenue:  number
  total_expenses: number
  artist_costs:   number
  net:            number
}

// ─── Session type ─────────────────────────────────────────────
// What we get back from the session helper — the current user
// plus their org context. Used by every authenticated page.
export type SessionContext = {
  userId: string
  orgId:  string
  role:   string
}