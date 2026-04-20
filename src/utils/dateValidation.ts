import { safeParseDate } from './dates'

const FIVE_YEARS_MS = 5 * 365.25 * 24 * 60 * 60 * 1000
const ONE_YEAR_MS = 365.25 * 24 * 60 * 60 * 1000

export interface DateValidationResult {
  severity: 'ok' | 'warning'
  message?: string
}

export function validateEffectiveDate(dateStr: string): DateValidationResult {
  if (!dateStr) return { severity: 'ok' }
  const d = safeParseDate(dateStr)
  if (isNaN(d.getTime())) return { severity: 'ok' }
  const diff = d.getTime() - Date.now()
  if (diff > FIVE_YEARS_MS) {
    return {
      severity: 'warning',
      message: 'This date is more than 5 years in the future. Please verify this is correct.',
    }
  }
  if (diff < -ONE_YEAR_MS) {
    return {
      severity: 'warning',
      message: 'This date is more than 1 year in the past. Please verify this is correct.',
    }
  }
  return { severity: 'ok' }
}
