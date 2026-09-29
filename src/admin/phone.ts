// Same rule as public.normalize_phone in supabase/challenge_v2.sql:
// digits only, "00" prefix dropped, a leading 0 becomes 972, no plus sign.
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("00")) return digits.slice(2)
  if (digits.startsWith("0")) return `972${digits.slice(1)}`
  return digits
}

export function isValidPhone(normalized: string): boolean {
  return normalized.length >= 9 && normalized.length <= 15
}

export function isValidEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
}
