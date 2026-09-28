import type { Day2MealChoice } from "@/data/participant"

export const MEAL_OPTIONS: { value: Exclude<Day2MealChoice, "">; label: string }[] = [
  { value: "morning", label: "בוקר" },
  { value: "lunch", label: "צהריים" },
  { value: "afternoon", label: "אחר הצהריים" },
  { value: "evening", label: "ערב" },
  { value: "between", label: "ביניים" },
]
