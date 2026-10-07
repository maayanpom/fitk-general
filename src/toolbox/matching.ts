import type { Participant } from "@/data/participant"
import { detectConcerns } from "@/summary/generate"
import { TOOLS_BY_ID } from "./tools"

// Maps what a participant said (day 3) to the tools that fit them best.
// Needs are internal labels; weights: question 3 (what they asked for) = 3,
// question 2 (what happens) = 2, question 1 (when) = 1.

type Need =
  | "time" | "quickMeal" | "morning" | "outside" | "carry" | "noFoodHome" | "planAhead"
  | "ready" | "protein" | "hunger" | "afternoon" | "evening" | "autopilot" | "fast"
  | "order" | "skip" | "routine" | "social" | "lowEnergy"

const MOMENT_NEEDS: Record<string, Need[]> = {
  morning: ["morning"],
  lunchWork: ["outside"],
  afternoon: ["afternoon"],
  evening: ["evening"],
  weekend: ["social", "outside"],
}

const HAPPENS_NEEDS: Record<string, Need[]> = {
  skip: ["time", "skip"],
  eatAvailable: ["noFoodHome"],
  veryHungry: ["hunger"],
  eatFast: ["fast", "autopilot"],
  orderIn: ["order"],
}

const HELP_NEEDS: Record<string, Need[]> = {
  readyMade: ["ready"],
  quickMeal: ["quickMeal", "time"],
  proteinAvailable: ["protein"],
  takeAlong: ["carry"],
  shortPlan: ["planAhead", "routine"],
  noTimeSolution: ["time", "quickMeal"],
}

const TOOL_NEEDS: Record<string, Need[]> = {
  fiveMinutes: ["time", "quickMeal", "morning"],
  emergencyMeal: ["noFoodHome", "time"],
  bagSnack: ["outside", "carry"],
  proteinFirst: ["protein", "fast"],
  plan30: ["planAhead", "skip", "morning", "evening"],
  notStarving: ["hunger", "skip", "afternoon"],
  quickShop: ["noFoodHome", "planAhead"],
  homeList: ["noFoodHome", "planAhead", "routine"],
  freezer: ["ready", "lowEnergy", "evening"],
  cookTwice: ["ready", "evening"],
  easyVeg: ["ready", "fast"],
  lazyPlate: ["lowEnergy", "noFoodHome", "quickMeal"],
  smartOrder: ["order", "outside", "social"],
  leftovers: ["ready", "evening"],
  tenMinutePause: ["autopilot", "fast"],
  wakeShake: ["time", "quickMeal"],
  myShia: ["routine", "ready"],
}

// Tie-break: simpler tools first.
const PRIORITY = [
  "fiveMinutes", "bagSnack", "proteinFirst", "plan30", "emergencyMeal", "notStarving", "homeList",
  "quickShop", "lazyPlate", "easyVeg", "freezer", "cookTwice", "leftovers", "smartOrder",
  "tenMinutePause", "wakeShake", "myShia",
]

const BECAUSE: Record<Need, string> = {
  time: "אין לכם זמן",
  quickMeal: "ביקשתם משהו מהיר",
  morning: "הבוקר עמוס",
  outside: "אתם הרבה מחוץ לבית",
  carry: "ביקשתם משהו לקחת מהבית",
  noFoodHome: "לא תמיד יש משהו זמין",
  planAhead: "ביקשתם לדעת מראש",
  ready: "ביקשתם משהו מוכן",
  protein: "ביקשתם חלבון זמין",
  hunger: "מגיעים רעבים מאוד",
  afternoon: "אחר הצהריים קשה",
  evening: "הערב אחרי יום ארוך קשה",
  autopilot: "אוכלים תוך כדי משהו אחר",
  fast: "אוכלים מהר",
  order: "מזמינים אוכל כי אין פתרון זמין",
  skip: "קורה שמדלגים על ארוחה",
  routine: "ביקשתם משהו שמשתלב בשגרה",
  social: "סופי שבוע ויציאות",
  lowEnergy: "אין כוח להתעסק",
}

type Hit = { need: Need; weight: number }

function answerHits(p: Participant): Hit[] {
  const d = p.day3
  const hits: Hit[] = []
  for (const n of MOMENT_NEEDS[d.momentChoice] ?? []) hits.push({ need: n, weight: 1 })
  for (const c of d.happensChoices) for (const n of HAPPENS_NEEDS[c] ?? []) hits.push({ need: n, weight: 2 })
  for (const c of d.helpChoices) for (const n of HELP_NEEDS[c] ?? []) hits.push({ need: n, weight: 3 })
  return hits
}

export type ProductId = "wakeShake" | "myShia"
export const PRODUCT_IDS: ProductId[] = ["wakeShake", "myShia"]
const isProduct = (id: string): id is ProductId => (PRODUCT_IDS as string[]).includes(id)

// Eligibility from the answers alone; myShiaConfirmed also needs a routine tool chosen.
export function productEligibility(p: Participant, selectedTools: string[] = p.toolbox.selectedTools) {
  const happens = p.day3.happensChoices
  const help = p.day3.helpChoices
  const wakeShake =
    help.some((h) => h === "quickMeal" || h === "noTimeSolution") &&
    happens.some((h) => ["skip", "eatAvailable", "eatFast", "orderIn"].includes(h))
  const myShia = help.some((h) => ["readyMade", "shortPlan", "noTimeSolution"].includes(h))
  const myShiaConfirmed =
    myShia && selectedTools.some((t) => ["plan30", "homeList", "fiveMinutes"].includes(t))
  return { wakeShake, myShia, myShiaConfirmed }
}

export type ScoredTool = { id: string; score: number; because: string }

export type Tiers = {
  closest: ScoredTool[]
  maybe: ScoredTool[]
  more: ScoredTool[]
  /** Products shown framed by a need (they sit in tier 1 or 2). */
  framedProducts: ProductId[]
  /** No products anywhere: a red flag needs a personal reply first. */
  hideProducts: boolean
}

export function computeTiers(p: Participant): Tiers {
  const hideProducts = detectConcerns(p).length > 0
  const elig = productEligibility(p)
  const hits = answerHits(p)

  const scored: ScoredTool[] = Object.keys(TOOL_NEEDS)
    .filter((id) => !isProduct(id) || !hideProducts)
    .map((id) => {
      let score = 0
      let best: Hit | null = null
      for (const h of hits) {
        if (TOOL_NEEDS[id].includes(h.need)) {
          score += h.weight
          if (!best || h.weight > best.weight) best = h
        }
      }
      return { id, score, because: best ? `בגלל ש${BECAUSE[best.need]}` : "" }
    })
    .sort((a, b) => b.score - a.score || PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id))

  const allowed = (t: ScoredTool) => !isProduct(t.id) || elig[t.id]

  const closest = scored.filter((t) => t.score >= 4 && allowed(t)).slice(0, 3)
  const used = new Set(closest.map((t) => t.id))
  const maybe = scored.filter((t) => !used.has(t.id) && t.score >= 2 && allowed(t)).slice(0, 4)
  maybe.forEach((t) => used.add(t.id))
  const more = scored.filter((t) => !used.has(t.id))

  const framedProducts = [...closest, ...maybe].map((t) => t.id).filter(isProduct)

  return { closest, maybe, more, framedProducts, hideProducts }
}

// ---- Coach side: product fit and summary scenario -----------------------

export type ProductFit = "wakeShake" | "myShia" | "both" | "none"

export function productFit(p: Participant): ProductFit {
  if (detectConcerns(p).length > 0) return "none"
  const e = productEligibility(p)
  if (e.wakeShake && e.myShiaConfirmed) return "both"
  if (e.wakeShake) return "wakeShake"
  if (e.myShiaConfirmed) return "myShia"
  return "none"
}

export type ScenarioId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export const SCENARIO_TITLES: Record<ScenarioId, string> = {
  1: "בוקר עמוס",
  2: "ימים מחוץ לבית",
  3: "אין אוכל זמין בבית",
  4: "אחר הצהריים",
  5: "פתרון פשוט לשילוב יומי",
  6: "מתאים ווייק-שייק",
  7: "מתאים מיי-שיא",
  8: "מתאים שילוב של שניהם",
  9: "אין התאמה למוצר כרגע",
}

// Order from the approved spec: red flag, anchored products, both, then by moment.
export function pickScenario(p: Participant): ScenarioId | "manual" {
  if (detectConcerns(p).length > 0) return "manual"
  const fit = productFit(p)
  const anchor = p.toolbox.anchorTool
  if (anchor === "wakeShake" && (fit === "wakeShake" || fit === "both")) return 6
  if (anchor === "myShia" && (fit === "myShia" || fit === "both")) return 7
  if (fit === "both") return 8

  const moment = p.day3.momentChoice
  if (moment === "morning") return 1
  if (moment === "lunchWork" || moment === "weekend") return 2
  if (p.day3.happensChoices.some((h) => h === "eatAvailable" || h === "orderIn")) return 3
  if (moment === "afternoon") return 4
  if (p.day3.helpChoices.some((h) => h === "shortPlan" || h === "readyMade")) return 5
  return 9
}

export const toolName = (id: string) => TOOLS_BY_ID[id]?.name ?? id
