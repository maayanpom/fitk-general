import type { Day2Data } from "@/data/participant"

export type Day2Feedback = {
  title: string
  body: string
}

const TITLE = "התובנה שלכם מהצלחת"

// One message, by priority: protein first, then vegetables, then carbs
// - fat doesn't affect the outcome. "יש הכול"/nothing-checked are the two
// remaining edge cases.
export function getDay2Feedback({ protein, vegetables, carbs, fat }: Day2Data): Day2Feedback {
  if (!protein && !vegetables && !carbs && !fat) {
    return { title: TITLE, body: "כדי לקבל תובנה סמנו לפחות מרכיב אחד." }
  }
  if (!protein) {
    return {
      title: TITLE,
      body: "בצלחת הזו לא סימנתם מקור חלבון. הוספה קטנה, למשל ביצים, קוטג', יוגורט או טונה, יכולה לעזור לארוחה להחזיק יותר זמן.",
    }
  }
  if (!vegetables) {
    return {
      title: TITLE,
      body: "לא סימנתם ירקות. כמה חתיכות בצד מספיקות כדי להתחיל.",
    }
  }
  if (!carbs) {
    return {
      title: TITLE,
      body: "לא סימנתם מקור פחמימה. פחמימה היא חלק רגיל מהצלחת והיא נותנת אנרגיה. פרוסת לחם או פרי הן דוגמאות פשוטות, ואין צורך לוותר עליה.",
    }
  }
  return { title: TITLE, body: "יש לכם בצלחת שילוב מגוון. יפה." }
}
