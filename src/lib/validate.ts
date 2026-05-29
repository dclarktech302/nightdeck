/**
 * Shared server-side validation utilities.
 * Import these in every API route and server action.
 * Never trust client-side validation alone.
 */

/** Validates and normalises an email address. Returns null if invalid. */
export function validateEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().toLowerCase()
  if (!trimmed || trimmed.length > 254) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null
  return trimmed
}

/**
 * Validates a phone number — digits, spaces, +, -, (, ), . only.
 * Returns the trimmed value, or null if absent/invalid.
 */
export function validatePhone(value: unknown): string | null {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > 20) return null
  if (!/^[\d\s\-+().]+$/.test(trimmed)) return null
  return trimmed
}

/**
 * Trims and length-caps a string field.
 * Returns the trimmed value, or null if blank or over the limit.
 */
export function validateString(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > maxLen) return null
  return trimmed
}

/**
 * Parses a non-negative integer from a string or number.
 * Returns null if the value is absent, NaN, negative, or above max.
 */
export function validatePositiveInt(value: unknown, max = 1_000_000): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = parseInt(String(value), 10)
  if (isNaN(n) || n < 0 || n > max) return null
  return n
}

/**
 * Parses a non-negative float from a string or number.
 * Returns null if the value is absent, NaN, negative, or above max.
 */
export function validatePositiveFloat(value: unknown, max = 1_000_000): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = parseFloat(String(value))
  if (isNaN(n) || n < 0 || n > max) return null
  return n
}

/**
 * Parses a comma-separated tag string into a sanitised array.
 * Each tag is trimmed and capped at maxPerTag chars. Total capped at maxTags.
 */
export function sanitizeTags(
  value: unknown,
  maxPerTag = 40,
  maxTags   = 20,
): string[] {
  if (typeof value !== 'string' || !value.trim()) return []
  return value
    .split(',')
    .map(t => t.trim().slice(0, maxPerTag))
    .filter(Boolean)
    .slice(0, maxTags)
}

/**
 * Returns true only if the URL is a relative path starting with /.
 * Use before redirecting to a user-supplied `next` parameter to prevent
 * open-redirect attacks.
 */
export function isRelativeUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')
}
