import { createClient } from '@/lib/supabase/server'
import type { EventPnL } from '@/types'

/**
 * Calls the get_event_pnl() database function for a given event.
 * Returns total_revenue, total_expenses, artist_costs, and net.
 * Used by the ops dashboard event detail P&L card.
 */
export async function getEventPnL(eventId: string): Promise<EventPnL | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_event_pnl', { p_event_id: eventId })

  if (error) {
    console.error('getEventPnL error:', error)
    return null
  }

  // rpc() returns an array — we only expect one row from this function
  return data?.[0] ?? null
}

/**
 * Returns all expense entries for an event.
 * Used by the ops dashboard event detail expenses section.
 */
export async function getExpensesByEvent(eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getExpensesByEvent error:', error)
    return []
  }

  return data
}

/**
 * Returns all revenue entries for an event.
 * Used by the ops dashboard event detail revenue section.
 */
export async function getRevenueByEvent(eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('revenue')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getRevenueByEvent error:', error)
    return []
  }

  return data
}