export function normalizeSSN(ssn: string | null | undefined): string {
  if (!ssn) return ''
  return String(ssn).replace(/\D/g, '')
}

export function formatSSN(ssn: string | null | undefined): string {
  const n = normalizeSSN(ssn)
  if (n.length !== 9) return n
  return `${n.slice(0, 3)}-${n.slice(3, 5)}-${n.slice(5)}`
}

export function maskSSN(ssn: string | null | undefined): string {
  const n = normalizeSSN(ssn)
  if (n.length !== 9) return '***-**-****'
  return `***-**-${n.slice(5)}`
}
