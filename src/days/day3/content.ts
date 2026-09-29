import type { Day3HappensChoice, Day3HelpChoice, Day3MomentChoice } from "@/data/participant"

export const MOMENT_OPTIONS: { value: Exclude<Day3MomentChoice, "">; label: string }[] = [
  { value: "morning", label: "בבוקר כשממהרים" },
  { value: "lunchWork", label: "בצהריים בעבודה או בדרכים" },
  { value: "afternoon", label: "אחר הצהריים כשהאנרגיה יורדת" },
  { value: "evening", label: "בערב אחרי יום ארוך" },
  { value: "weekend", label: "בסופי שבוע ובאירועים" },
  { value: "other", label: "אחר" },
]

export const HAPPENS_OPTIONS: { value: Exclude<Day3HappensChoice, "">; label: string }[] = [
  { value: "skip", label: "דילוג על ארוחה" },
  { value: "grabWhatever", label: "נשנוש ממה שנמצא" },
  { value: "quickStanding", label: "אכילה מהירה בעמידה" },
  { value: "screen", label: "אכילה מול מסך" },
  { value: "orderIn", label: "הזמנת אוכל מוכן" },
  { value: "largeAmount", label: "אכילה בכמויות גדולות" },
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
