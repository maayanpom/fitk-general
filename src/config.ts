// These four values are the only things a different coach needs to change to
// reuse this same codebase on their own deployment - set them as environment
// variables (Vercel project settings, or .env.local for local dev) rather
// than editing this file. The values below are placeholders/fallbacks only.

export const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || "972500000000"

export const COMMUNITY_URL =
  import.meta.env.VITE_COMMUNITY_URL || "https://chat.whatsapp.com/G4FjxQhh0VeF9aQ1pkZnAy"

export const COACH_NAME = import.meta.env.VITE_COACH_NAME || "מעיין פאר"

export const COACH_EMAIL = import.meta.env.VITE_COACH_EMAIL || "maayanpom@gmail.com"

// Where "/" and unknown paths go (once a local identity exists - otherwise
// RequireParticipant sends visitors to /register first).
export const ROOT_REDIRECT = "challenge-day-1"

export function personalFeedbackUrl(firstName?: string) {
  const text = firstName
    ? `היי, זה ${firstName} מהאתגר "3 ימים חוזרים לשגרה" – אשמח לפידבק אישי 🙏`
    : `היי, אני מהאתגר "3 ימים חוזרים לשגרה" – אשמח לפידבק אישי 🙏`
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`
}

export function whatsAppLinkForPhone(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
