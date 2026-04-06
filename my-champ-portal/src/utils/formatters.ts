import { format, formatDistanceToNow } from 'date-fns'

export function formatSSN(ssn: string, masked = true): string {
  const digits = ssn.replace(/\D/g, '').padStart(9, '0')
  if (masked) return `***-**-${digits.slice(5)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatFEIN(fein: string): string {
  const digits = fein.replace(/\D/g, '')
  if (digits.length === 9) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return fein
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
