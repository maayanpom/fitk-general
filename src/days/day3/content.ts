import type { Day3HappensChoice, Day3HelpChoice, Day3MomentChoice } from "@/data/participant"

export const MOMENT_OPTIONS: { value: Exclude<Day3MomentChoice, "">; label: string }[] = [
  { value: "morning", label: "בבוקר כשאני ממהר/ת" },
  { value: "lunchWork", label: "בצהריים בעבודה / בדרכים" },
  { value: "afternoon", label: "אחר הצהריים" },
  { value: "evening", label: "בערב אחרי יום ארוך" },
  { value: "weekend", label: "בסופי שבוע / יציאות" },
  { value: "other", label: "משהו אחר" },
]

export const HAPPENS_OPTIONS: { value: Day3HappensChoice; label: string }[] = [
  { value: "skip", label: "אני מדלג/ת על ארוחה" },
  { value: "eatAvailable", label: "אוכל/ת את מה שזמין" },
  { value: "veryHungry", label: "מגיע/ה רעב/ה מאוד" },
  { value: "eatFast", label: "אוכל/ת מהר או תוך כדי משהו אחר" },
  { value: "orderIn", label: "מזמין/ה אוכל כי אין לי פתרון זמין" },
  { value: "other", label: "משהו אחר" },
]

export const HELP_OPTIONS: { value: Day3HelpChoice; label: string }[] = [
  { value: "readyMade", label: "משהו מוכן שמחכה לי" },
  { value: "quickMeal", label: "ארוחה מהירה, בלי להתארגן עליה" },
  { value: "proteinAvailable", label: "מקור חלבון שכבר זמין לי" },
  { value: "takeAlong", label: "משהו שאפשר לקחת מהבית" },
  { value: "shortPlan", label: "לדעת מראש מה אוכלים" },
  { value: "noTimeSolution", label: "פתרון שעובד גם כשאין לי זמן בכלל" },
  { value: "other", label: "משהו אחר" },
]

// "label; label; משהו אחר: text" - the shape used in the coach's Excel export and details.
export function describeChoices(
  options: { value: string; label: string }[],
  values: string[],
  other: string,
): string {
  return options
    .filter((o) => values.includes(o.value))
    .map((o) => (o.value === "other" && other.trim() ? `${o.label}: ${other.trim()}` : o.label))
    .join("; ")
}
