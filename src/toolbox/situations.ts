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
    toolIds: ["fiveMinutes", "proteinFirst", "bagSnack", "wakeShake"],
  },
  {
    id: "noEnergy",
    emoji: "🍳",
    label: "אין לי כוח לבשל",
    toolIds: ["cookTwice", "freezer", "lazyPlate", "emergencyMeal"],
  },
  {
    id: "noFood",
    emoji: "🛒",
    label: "אין לי אוכל בבית",
    toolIds: ["homeList", "quickShop", "smartOrder", "emergencyMeal"],
  },
  {
    id: "unplanned",
    emoji: "😵",
    label: "אין לי תכנון מראש",
    toolIds: ["plan30", "tenMinutePause", "notStarving", "leftovers"],
  },
]
