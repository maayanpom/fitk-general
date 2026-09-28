export type Situation = {
  id: string
  emoji: string
  label: string
  toolIds: string[]
}

export const SITUATIONS: Situation[] = [
  {
    id: "noTime",
    emoji: "🏃",
    label: "אין לי זמן",
    toolIds: ["fiveMinutes", "proteinFirst", "freezer", "emergencyMeal", "wakeShake"],
  },
  {
    id: "noEnergy",
    emoji: "🍳",
    label: "אין לי כוח לבשל",
    toolIds: ["lazyPlate", "easyVeg", "leftovers", "freezer", "smartOrder"],
  },
  {
    id: "noFood",
    emoji: "🛒",
    label: "אין לי אוכל בבית",
    toolIds: ["quickShop", "emergencyMeal", "freezer", "fiveMinutes", "smartOrder"],
  },
  {
    id: "unplanned",
    emoji: "😵",
    label: "אני פשוט לא מתוכננ/ת",
    toolIds: ["plan30", "emergencyMeal", "bagSnack", "notStarving", "homeList"],
  },
]
