// Where "/" and unknown paths go (once a local identity exists - a
// participant with no coach link gets an explanation instead, since there's
// no single coach to attribute a fresh visit to anymore).
export const ROOT_REDIRECT = "challenge-day-1"

export function whatsAppLinkForPhone(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

// Per-coach WhatsApp number, community link, name and email all live in the
// `coaches` table now (see src/data/coach.ts) instead of static build-time
// values - each coach's participants see that coach's own settings.
export function personalFeedbackUrl(phone: string, firstName?: string) {
  const text = firstName
    ? `היי, זה ${firstName} מהאתגר "3 ימים חוזרים לשגרה" – אשמח לפידבק אישי 🙏`
    : `היי, אני מהאתגר "3 ימים חוזרים לשגרה" – אשמח לפידבק אישי 🙏`
  return whatsAppLinkForPhone(phone, text)
}
