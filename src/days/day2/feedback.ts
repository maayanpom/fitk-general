import type { Day2Data } from "@/data/participant"

export type Day2Feedback = {
  title: string
  body: string
}

const TITLE = "התובנה שלכם מהצלחת"

const GOAL = "זכרו, המטרה שלנו: שלוש ארוחות מאוזנות ביום."

// A balanced meal = protein + carbs + vegetables. Fat is not required.
export type PlateComponent = "protein" | "carbs" | "vegetables"

const ORDER: PlateComponent[] = ["protein", "carbs", "vegetables"]

export const PLATE_LABELS: Record<PlateComponent, string> = {
  protein: "חלבון",
  carbs: "פחמימה",
  vegetables: "ירקות",
}

export const PLATE_TIPS: Record<PlateComponent, string> = {
  protein: "חלבון: ביצים, קוטג', יוגורט, טונה מספיקים.",
  carbs: "פחמימה: פרוסת לחם, מנת אורז, תפוח אדמה או פרי.",
  vegetables: "ירקות: מלפפון או עגבנייה חתוכים בצד.",
}

export function missingComponents(data: Pick<Day2Data, PlateComponent>): PlateComponent[] {
  return ORDER.filter((c) => !data[c])
}

// "חלבון, פחמימה וירקות"
export function joinHebrew(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} ו${items[items.length - 1]}`
}

export function getDay2Feedback(data: Day2Data): Day2Feedback {
  if (!data.protein && !data.vegetables && !data.carbs && !data.fat) {
    return { title: TITLE, body: ["כדי לקבל תובנה, סמנו לפחות מרכיב אחד.", GOAL].join("\n") }
  }

  const missing = missingComponents(data)
  if (missing.length === 0) {
    return { title: TITLE, body: ["יש בצלחת חלבון, פחמימה וירקות. שילוב מצוין.", GOAL].join("\n") }
  }

  const list = joinHebrew(missing.map((c) => PLATE_LABELS[c]))
  return {
    title: TITLE,
    body: [
      `בצלחת שבדקתם חסר: ${list}. ארוחה מאוזנת כוללת חלבון, פחמימה וירקות.`,
      ...missing.map((c) => PLATE_TIPS[c]),
      GOAL,
    ].join("\n"),
  }
}
