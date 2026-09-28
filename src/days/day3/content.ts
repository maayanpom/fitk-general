import type { Day2Data, Day3HappensChoice, Day3HelpChoice, Day3MomentChoice } from "@/data/participant"
import type { HardestMoment } from "@/days/day1/types"

export const MOMENT_OPTIONS: { value: Exclude<Day3MomentChoice, "">; label: string }[] = [
  { value: "morning", label: "בבוקר כשממהרים" },
  { value: "lunchWork", label: "בצהריים בעבודה או בדרכים" },
  { value: "afternoon", label: "אחר הצהריים כשהאנרגיה יורדת" },
  { value: "evening", label: "בערב אחרי יום ארוך" },
  { value: "weekend", label: "בסופי שבוע ובאירועים" },
  { value: "other", label: "אחר" },
]

export const HAPPENS_OPTIONS: { value: Exclude<Day3HappensChoice, "">; label: string }[] = [
  { value: "skip", label: "דילוג על אוכל" },
  { value: "grabWhatever", label: "נשנוש ממה שנמצא" },
  { value: "quickStanding", label: "אכילה מהירה בעמידה" },
  { value: "screen", label: "אכילה מול מסך" },
  { value: "orderIn", label: "הזמנת אוכל מוכן" },
  { value: "largeAmount", label: "אכילה בכמות גדולה" },
  { value: "other", label: "אחר" },
]

export const HELP_OPTIONS: { value: Exclude<Day3HelpChoice, "">; label: string }[] = [
  { value: "readyMade", label: "משהו מוכן מראש" },
  { value: "reminder", label: "תזכורת לעצור" },
  { value: "protein", label: "חלבון זמין" },
  { value: "drink", label: "שתייה" },
  { value: "planAhead", label: "תכנון מראש של היום" },
  { value: "smallHelp", label: "עזרה קטנה בבית או בזמן" },
  { value: "other", label: "אחר" },
]

// The weekly experiment, in first person, by the same categories as "what
// would help" (question 3) - the doc's day3.experiment sentences.
export const EXPERIMENTS: Record<Exclude<Day3HelpChoice, "">, string> = {
  readyMade: "הערב אכין מראש דבר אחד קטן שיחכה לי ברגע הקשה.",
  reminder: "אקבע תזכורת לשעה הקשה, ואעצור שתי דקות לפני שאחליט.",
  protein: "אשאיר בהישג יד מקור חלבון פשוט, כמו ביצה קשה, גבינה או יוגורט.",
  drink: "אכין כוס או בקבוק מים לפני הרגע הקשה.",
  planAhead: "בבוקר אכתוב שלוש נקודות אכילה לפי הזמן שיש לי.",
  smallHelp: "אבקש עזרה אחת קטנה שתפנה לי חמש דקות באותה שעה.",
  other: "אבחר צעד קטן אחד ואנסה אותו שלוש פעמים השבוע.",
}

// Pre-selects question 1 from the hard point picked on day 1 - best-effort
// mapping between the two different option sets, since day 1 has no direct
// equivalent for "weekend" and day 3 has no direct equivalent for "snacks".
export function momentChoiceFromDay1(hardestMoment: HardestMoment): Day3MomentChoice {
  switch (hardestMoment) {
    case "breakfast":
    case "morningSnack":
      return "morning"
    case "lunch":
      return "lunchWork"
    case "afternoon":
      return "afternoon"
    case "dinner":
      return "evening"
    case "snacks":
      return "other"
    default:
      return ""
  }
}

// Which plate component was missing most often per day 2's priority order -
// mirrors day2/feedback.ts's own priority (protein, then vegetables/fruit,
// then carbs), returning just the label for the day 3 summary line.
export function day2MissingLabel(data: Day2Data): string {
  if (!data.protein) return "חלבון"
  if (!data.vegetables) return "ירקות או פרי"
  if (!data.carbs) return "פחמימה"
  return "כלום"
}
