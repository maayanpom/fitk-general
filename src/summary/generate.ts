import type { Participant } from "@/data/participant"
import { getLongestGap } from "@/days/day1/feedback"
import { HARDEST_OPTIONS } from "@/days/day1/types"
import { MOMENT_OPTIONS } from "@/days/day3/content"

// Rule-based (no AI) draft of the personal summary a coach sends after day 3.
// The output is structured data; renderWhatsappText (render.ts) turns it into
// the WhatsApp message. A page renderer (renderSummaryPage) comes in a later
// cycle and will read the same object.

export type SummaryData = {
  name: string
  findings: [string, string, string]
  hard_moment: string
  experiments: [string, string, string]
  gifts: {
    registration_gift_text: string
    challenge_coupon: { text: string; code: string; expires_at: string }
  }
  links: { toolbox: string; community: string }
}

export type SummaryResult =
  | { kind: "ok"; data: SummaryData }
  | { kind: "incomplete"; missingDays: number[] }
  | { kind: "concern"; reasons: string[] }

export type SummaryOptions = {
  longGapHours: number
  couponText: string | null
  couponCode: string
  couponExpiresAt: string
  communityUrl: string | null
  toolboxLink: string
}

export const REGISTRATION_GIFT_TEXT =
  "מתנת הרשמה של 50 שקלים, יורדת אוטומטית בקופה, בתוקף 30 יום מההרשמה"

export const DEFAULT_COUPON_TEXT = "קופון האתגר, 50 שקלים"

// ---- Concerning answers ---------------------------------------------------
// The content doc's list of signs. Only the free-text fields (what was eaten,
// the day-3 note) can carry them, so those are scanned for keywords, plus one
// structural sign: a day with no eating points at all combined with "skipping".
const CONCERN_KEYWORDS: { pattern: RegExp; reason: string }[] = [
  { pattern: /הקא|להקיא|הקיא/, reason: "אזכור של הקאות" },
  { pattern: /התקפ|בולמוס|בולימי|אנורק/, reason: "אזכור של אכילה בהתקפים או של הפרעת אכילה" },
  { pattern: /פחד מאוכל|מפחד[תה]? לאכול|מפחדת מאוכל/, reason: "פחד מאוכל" },
  { pattern: /אשמה|מתעב|שונא[תה]? את עצמ|מגעיל/, reason: "אשמה או כעס קיצוניים על אוכל" },
  { pattern: /לרזות|להרזות|הורדת משקל|להוריד משקל/, reason: "רצון להוריד משקל" },
  { pattern: /הריון|בהריון|מניקה/, reason: "הריון או הנקה" },
  { pattern: /סוכרת|מחלה|תרופה|תרופות|רופא|אבחנה|תת פעילות|קרוהן|צליאק/, reason: "מחלה, תרופות או מצב רפואי" },
  { pattern: /\bבת (1[0-7])\b|\bבן (1[0-7])\b|בגיל (1[0-7])\b/, reason: "גיל מתחת ל-18" },
]

export function detectConcerns(p: Participant): string[] {
  const reasons = new Set<string>()
  const day1 = p.day1
  const points = [day1.breakfast, day1.morningSnack, day1.lunch, day1.afternoon, day1.dinner, ...day1.additionalSnacks]
  const texts = [...points.map((x) => x.food), p.day3.extraNote, p.toolbox.fiveMinuteMeal, p.toolbox.bagSnack]

  for (const text of texts) {
    for (const { pattern, reason } of CONCERN_KEYWORDS) {
      if (pattern.test(text)) reasons.add(reason)
    }
  }

  const noPoints = points.every((x) => !x.time && !x.food.trim())
  if (day1.completedAt && noPoints && p.day3.happensChoice === "skip") {
    reasons.add("יום ללא נקודות אכילה, יחד עם דילוג על אוכל")
  }
  return [...reasons]
}

// ---- Findings (the content doc's library) ---------------------------------
type Finding = { text: string; strength: boolean }

function day1Finding(p: Participant, longGapHours: number): Finding {
  const gap = getLongestGap(p.day1)
  if (!gap) {
    return {
      text: "ביום 1 מילאתם חלק מהנקודות. כשיש לפחות שתי נקודות עם שעה, אפשר לראות את התמונה ביום שלכם.",
      strength: false,
    }
  }
  if (gap.hours >= longGapHours) {
    const hours = Number.isInteger(gap.hours) ? String(gap.hours) : gap.hours.toFixed(1)
    return {
      text: `ביום 1 היה מרווח של כ-${hours} שעות בין ${gap.from} ל-${gap.to}. לפעמים נקודה קטנה באמצע מקלה על ההמשך.`,
      strength: false,
    }
  }
  return {
    text: "נקודות האכילה שלכם מפוזרות בצורה סדירה. זו בסיס טוב לבנות עליו.",
    strength: true,
  }
}

function day2Finding(p: Participant): Finding {
  const { protein, vegetables, carbs } = p.day2
  if (!protein) {
    return {
      text: "בצלחת שבדקתם לא היה מקור חלבון. תוספת קטנה, כמו ביצים או יוגורט, יכולה לעזור לארוחה להחזיק יותר.",
      strength: false,
    }
  }
  if (!vegetables) {
    return { text: "בצלחת חסרו ירקות. כמה חתיכות בצד מספיקות כדי להתחיל.", strength: false }
  }
  if (!carbs) {
    return {
      text: "בצלחת לא הייתה פחמימה. היא חלק רגיל מהצלחת ונותנת אנרגיה, אין צורך לוותר עליה. פרוסת לחם או פרי הן דוגמאות פשוטות.",
      strength: false,
    }
  }
  return { text: "בצלחת שבדקתם היה שילוב מגוון. יפה.", strength: true }
}

const DAY3_FINDINGS: Record<string, string> = {
  morning:
    "בבוקר עמוס הכי קל לתפוס מה שיש. הכנה קטנה מראש בערב יכולה לשנות את הבוקר.",
  lunchWork:
    "כשאין מה לקחת בהישג יד, ההחלטה נעשית בלחץ. משהו בתיק משנה הרבה.",
  afternoon:
    "אחר הצהריים האנרגיה יורדת וקל לחפש מה שיש בהישג יד. מקור חלבון זמין מראש יכול לעזור ברגע הזה.",
  evening: "בסוף יום ארוך קשה להחליט. חלבון זמין ומשהו מוכן מראש יעזרו.",
  weekend:
    "בסופי שבוע ובאירועים הסדר משתנה. נקודה קטנה לפני היציאה יכולה להקל על ההמשך.",
  other: "בחרתם רגע שמאתגר אתכם. צעד קטן אחד שחוזרים עליו כמה פעמים כבר עושה הבדל.",
}

function day3Finding(p: Participant): Finding {
  const text = DAY3_FINDINGS[p.day3.momentChoice] ?? DAY3_FINDINGS.other
  return { text, strength: false }
}

// ---- Experiments -----------------------------------------------------------
// By the hard moment picked on day 3 (spec 5.7); the participant answers with a number.
const MOMENT_EXPERIMENTS: Record<string, string> = {
  morning: "להכין דבר אחד מהערב",
  lunchWork: "משהו בתיק",
  afternoon: "מקור חלבון זמין",
  evening: "לתכנן בבוקר את ארוחת הערב",
  weekend: "לאכול משהו קטן לפני היציאה",
  other: "לבחור צעד קטן אחד ולנסות שלוש פעמים השבוע",
}

// Second suggestion: by what the participant said would help (question 3).
const HELP_EXPERIMENTS: Record<string, string> = {
  readyMade: "להכין מראש דבר אחד קטן שיחכה ברגע הקשה",
  reminder: "לקבוע תזכורת לשעה הקשה ולעצור שתי דקות לפני שמחליטים",
  protein: "להשאיר בהישג יד מקור חלבון פשוט, כמו ביצה קשה, גבינה או יוגורט",
  drink: "להכין כוס או בקבוק מים לפני הרגע הקשה",
  planAhead: "בבוקר לכתוב שלוש נקודות אכילה לפי הזמן שיש",
  smallHelp: "לבקש עזרה אחת קטנה שתפנה חמש דקות באותה שעה",
  other: "לבחור צעד קטן אחד ולנסות שלוש פעמים השבוע",
}

// Fillers from day 1's "three things that create order", never repeating.
const FILLER_EXPERIMENTS = [
  "נקודת אכילה אחת קבועה שלא זזה, אפילו קטנה",
  "כוס מים ליד, כדי שהשתייה לא תלויה בזיכרון",
  "לתכנן בערך מה נאכל היום ולוודא שיש בבית את מה שצריך",
]

function pickExperiments(p: Participant): [string, string, string] {
  const picked: string[] = []
  const add = (text: string | undefined) => {
    if (text && !picked.includes(text)) picked.push(text)
  }
  add(MOMENT_EXPERIMENTS[p.day3.momentChoice] ?? MOMENT_EXPERIMENTS.other)
  add(HELP_EXPERIMENTS[p.day3.helpChoice])
  for (const filler of FILLER_EXPERIMENTS) add(filler)
  return [picked[0], picked[1], picked[2]]
}

// ---- Main -----------------------------------------------------------------
function hardMoment(p: Participant): string {
  const fromDay3 = MOMENT_OPTIONS.find((o) => o.value === p.day3.momentChoice)?.label
  if (fromDay3) return fromDay3
  const fromDay1 = HARDEST_OPTIONS.find((o) => o.value === p.day1.hardestMoment)
  return fromDay1 && fromDay1.value !== "none" ? fromDay1.label : ""
}

export function generateSummary(p: Participant, opts: SummaryOptions): SummaryResult {
  const missingDays = ([1, 2, 3] as const).filter((d) => !p[`day${d}` as "day1"].completedAt)
  if (missingDays.length > 0) return { kind: "incomplete", missingDays: [...missingDays] }

  const concerns = detectConcerns(p)
  if (concerns.length > 0) return { kind: "concern", reasons: concerns }

  // Strength first, then the rest in day order.
  const findings = [day1Finding(p, opts.longGapHours), day2Finding(p), day3Finding(p)]
  findings.sort((a, b) => Number(b.strength) - Number(a.strength))

  return {
    kind: "ok",
    data: {
      name: p.firstName,
      findings: [findings[0].text, findings[1].text, findings[2].text],
      hard_moment: hardMoment(p),
      experiments: pickExperiments(p),
      gifts: {
        registration_gift_text: REGISTRATION_GIFT_TEXT,
        challenge_coupon: {
          text: opts.couponText?.trim() || DEFAULT_COUPON_TEXT,
          code: opts.couponCode.trim(),
          expires_at: opts.couponExpiresAt.trim(),
        },
      },
      links: { toolbox: opts.toolboxLink, community: opts.communityUrl?.trim() ?? "" },
    },
  }
}
