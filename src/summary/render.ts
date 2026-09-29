import type { SummaryData } from "./generate"

// The pilot's delivery format: a WhatsApp message from the coach.
// Kept separate from generateSummary so a page renderer can read the same data.
export function renderWhatsappText(
  data: SummaryData,
  coachName: string,
  deliveryText?: string | null,
): string {
  const { registration_gift_text, challenge_coupon } = data.gifts
  const code = challenge_coupon.code || "{קוד}"
  const expires = challenge_coupon.expires_at || "{תאריך}"

  const lines: string[] = [
    `היי ${data.name}, כאן ${coachName} 💜 סיימתם את שלושת הימים, וזה לא מובן מאליו. הנה מה שראיתי בתשובות שלכם:`,
    "",
    ...data.findings.map((f, i) => `${i + 1}. ${f}`),
    "",
  ]

  if (data.hard_moment) lines.push(`הרגע הקשה שבחרתם: ${data.hard_moment}.`)
  lines.push(
    "כמה ניסויים קטנים לשבוע הקרוב. ענו לי במספר של הניסוי שמתאים לכם:",
    ...data.experiments.map((e, i) => `${i + 1}. ${e}`),
    "",
    "המתנות שלכם: שתי הטבות בהזמנה הראשונה שלכם ב-HoldOn.",
    `(1) ${registration_gift_text}.`,
    `(2) ${challenge_coupon.text}, קוד ${code}, בתוקף עד ${expires}.`,
    "ביחד: 100 שקלים הטבות בהזמנה הראשונה, בכפוף לתנאי האתר.",
    "",
    `ארגז הכלים שלכם: ${data.links.toolbox}`,
  )

  if (data.links.community) {
    lines.push(`אשמח לראות אתכם בקהילה שלנו: ${data.links.community}`)
  }
  if (deliveryText?.trim()) lines.push("", deliveryText.trim())

  return lines.join("\n")
}

// Placeholders like {קוד} left in a draft mean it is not ready to send.
export const hasPlaceholders = (text: string) => /\{[^}]+\}/.test(text)
