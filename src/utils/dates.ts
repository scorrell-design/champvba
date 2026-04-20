import { format, parseISO, isValid } from 'date-fns'

/**
 * Parse a date string without timezone shifting.
 * Accepts YYYY-MM-DD (ISO) and MM/DD/YYYY formats.
 * Always returns a Date at local midnight of the intended calendar day.
 */
export function safeParseDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date(NaN)
  const str = String(dateStr).trim()

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  const usMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (usMatch) {
    const [, m, d, y] = usMatch
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  const parsed = parseISO(str)
  return isValid(parsed) ? parsed : new Date(NaN)
}

/**
 * Format a date string for display. Always use this instead of raw .toLocaleDateString().
 */
export function formatDisplayDate(dateStr: string | Date | null | undefined, fmt = 'MM/dd/yyyy'): string {
  if (!dateStr) return '—'
  const d = typeof dateStr === 'string' ? safeParseDate(dateStr) : dateStr
  if (!isValid(d)) return '—'
  return format(d, fmt)
}

/**
 * Serialize a Date or date string to storage format (YYYY-MM-DD).
 * Use this before writing to the store so stored values are canonical.
 */
export function serializeDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return ''
  const d = typeof dateStr === 'string' ? safeParseDate(dateStr) : dateStr
  if (!isValid(d)) return ''
  return format(d, 'yyyy-MM-dd')
}
