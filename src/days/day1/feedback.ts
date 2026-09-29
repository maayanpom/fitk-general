import { HARDEST_OPTIONS, MEALS, type Day1Data, type EatingPoint } from "./types"

export type Day1Feedback = {
  title: string
  body: string
}

// Gaps at or above this many hours between meal points count as "long"
// (default; each coach can change it in settings).
const DEFAULT_LONG_GAP_HOURS = 5

type TimedPoint = { minutes: number; time: string }

function toTimedPoint(p: EatingPoint): TimedPoint | null {
  const match = /^(\d{2}):(\d{2})$/.exec(p.time)
  if (!match) return null
  return { minutes: Number(match[1]) * 60 + Number(match[2]), time: p.time }
}

function formatHours(minutes: number): string {
  const hours = minutes / 60
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1)
}

const TITLE = "התובנה הראשונה שלכם"

// The longest gap between two consecutive timed points, or null when fewer
// than two points have a time. Used by the summary draft generator.
export function getLongestGap(
  data: Day1Data,
): { hours: number; from: string; to: string; timedCount: number } | null {
  const points: EatingPoint[] = [...MEALS.map((m) => data[m.key]), ...data.additionalSnacks]
  const timed = points
    .map(toTimedPoint)
    .filter((p): p is TimedPoint => p !== null)
    .sort((a, b) => a.minutes - b.minutes)
  if (timed.length < 2) return null

  let best = { gap: -1, from: timed[0], to: timed[1] }
  for (let i = 1; i < timed.length; i++) {
    const gap = timed[i].minutes - timed[i - 1].minutes
    if (gap > best.gap) best = { gap, from: timed[i - 1], to: timed[i] }
  }
  return {
    hours: best.gap / 60,
    from: best.from.time,
    to: best.to.time,
    timedCount: timed.length,
  }
}

export function getDay1Feedback(
  data: Day1Data,
  longGapHours: number = DEFAULT_LONG_GAP_HOURS,
): Day1Feedback {
  const points: EatingPoint[] = [...MEALS.map((m) => data[m.key]), ...data.additionalSnacks]
  const allEmpty = points.every((p) => !p.time && !p.food.trim())

  if (allEmpty) {
    return {
      title: TITLE,
      body: "תודה ששיתפתם. אפשר לחזור ולמלא בסוף היום, ואם משהו סביב אוכל קשה לכם, כדאי לדבר עם רופא או דיאטנית מורשית. אפשר גם לכתוב לי.",
    }
  }

  const label =
    data.hardestMoment && data.hardestMoment !== "none"
      ? HARDEST_OPTIONS.find((o) => o.value === data.hardestMoment)?.label
      : undefined

  const sentences: string[] = []
  if (label) {
    sentences.push(`הנקודה הקשה שבחרתם: ${label}. זה הרגע שדורש הכי הרבה תשומת לב. ביום 3 נחפש לו פתרון קטן.`)
  } else if (data.hardestMoment === "none") {
    sentences.push("יופי, יום בלי נקודה קשה. ביום 3 נבדוק מה עוזר לשמור על זה.")
  }

  const gap = getLongestGap(data)
  if (gap && gap.hours >= longGapHours) {
    sentences.push(
      `המרווח הארוך ביותר היה כ-${formatHours(gap.hours * 60)} שעות, בין ${gap.from} ל-${gap.to}.`,
    )
  }

  if (sentences.length === 0) sentences.push("תודה ששיתפתם. ביום 3 נחפש יחד פתרון קטן.")
  return { title: TITLE, body: sentences.join(" ") }
}
