import { format, parseISO } from 'date-fns'

export function safeParseDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  if (dateStr.includes('-') && dateStr.length === 10) {
    return parseISO(dateStr)
  }
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]))
  }
  return parseISO(dateStr)
}

export function formatDisplayDate(dateStr: string | Date, formatStr = 'MMM d, yyyy'): string {
  if (!dateStr) return '—'
  const d = typeof dateStr === 'string' ? safeParseDate(dateStr) : dateStr
  return format(d, formatStr)
}

export function formatDisplayDateTime(dateStr: string | Date, formatStr = 'MMM d, yyyy · h:mm a'): string {
  if (!dateStr) return '—'
  const d = typeof dateStr === 'string' ? safeParseDate(dateStr) : dateStr
  return format(d, formatStr)
}
