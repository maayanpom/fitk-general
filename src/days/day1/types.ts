export type EatingPoint = {
  time: string
  food: string
}

export type MealKey = "breakfast" | "morningSnack" | "lunch" | "afternoon" | "dinner"

export type HardestMoment = MealKey | "snacks" | ""

export type Day1Data = Record<MealKey, EatingPoint> & {
  additionalSnacks: EatingPoint[]
  hardestMoment: HardestMoment
  completedAt: string
}

const emptyPoint = (): EatingPoint => ({ time: "", food: "" })

export const createEmptyDay1 = (): Day1Data => ({
  breakfast: emptyPoint(),
  morningSnack: emptyPoint(),
  lunch: emptyPoint(),
  afternoon: emptyPoint(),
  dinner: emptyPoint(),
  additionalSnacks: [emptyPoint()],
  hardestMoment: "",
  completedAt: "",
})

export const MEALS: { key: MealKey; emoji: string; label: string }[] = [
  { key: "breakfast", emoji: "🌅", label: "בוקר" },
  { key: "morningSnack", emoji: "☕", label: "ביניים" },
  { key: "lunch", emoji: "☀️", label: "צהריים" },
  { key: "afternoon", emoji: "🌤️", label: "אחר הצהריים" },
  { key: "dinner", emoji: "🌙", label: "ערב" },
]

export const HARDEST_OPTIONS: { value: Exclude<HardestMoment, "">; label: string }[] = [
  ...MEALS.map(({ key, label }) => ({ value: key, label })),
  { value: "snacks", label: "נשנושים בין לבין" },
]
