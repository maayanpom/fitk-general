import type { Participant } from "@/data/participant"

// Signs that need a personal reply before any summary (and never a product).

// ---- Concerning answers ---------------------------------------------------
// The content doc's list of signs. Only the free-text fields (what was eaten,
// the day-3 note) can carry them, so those are scanned for keywords, plus one
// structural sign: a day with no eating points at all combined with "skipping".
const CONCERN_KEYWORDS: { pattern: RegExp; reason: string }[] = [
  { pattern: /הקא|להקיא|הקיא/, reason: "אזכור של הקאות" },
  { pattern: /צום/, reason: "אזכור של צום" },
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
  const texts = [
    ...points.map((x) => x.food),
    p.day3.extraNote,
    p.day3.oneThing,
    p.day3.momentOther,
    p.day3.happensOther,
    p.day3.helpOther,
    p.toolbox.fiveMinuteMeal,
    p.toolbox.bagSnack,
  ]

  for (const text of texts) {
    for (const { pattern, reason } of CONCERN_KEYWORDS) {
      if (pattern.test(text)) reasons.add(reason)
    }
  }

  const noPoints = points.every((x) => !x.time && !x.food.trim())
  if (day1.completedAt && noPoints && p.day3.happensChoices.includes("skip")) {
    reasons.add("יום ללא נקודות אכילה, יחד עם דילוג על אוכל")
  }
  // Manual-review rules: skipping a meal together with arriving very hungry,
  // or fewer than three filled eating points on day 1.
  if (p.day3.happensChoices.includes("skip") && p.day3.happensChoices.includes("veryHungry")) {
    reasons.add("דילוג על ארוחה יחד עם הגעה רעבה מאוד")
  }
  const filled = points.filter((x) => x.time || x.food.trim()).length
  if (day1.completedAt && filled < 3) {
    reasons.add("ביום 1 מולאו פחות משלוש נקודות אכילה")
  }
  return [...reasons]
}

