import type { Participant } from "@/data/participant"
import { pickScenario, productEligibility, productFit, toolName, type ScenarioId } from "@/toolbox/matching"
import { TOOLS_BY_ID } from "@/toolbox/tools"
import { detectConcerns } from "./generate"

// The approved personal-summary templates (docs: "ה. תבניות סיכום אישי").
// Order: what I saw -> what is hard -> one small change -> a tool to start with
// -> (only if it fits) a product -> invitation to talk. No benefit/coupon here.

export type SummaryResult =
  | { kind: "ok"; scenario: ScenarioId; text: string; productOptions: ProductOption[] }
  | { kind: "incomplete"; missingDays: number[] }
  | { kind: "concern"; reasons: string[] }

export type ProductOption = "wakeShake" | "myShia"

export type SummaryOptions = {
  coachName: string
  toolboxLink: string
  /** Product paragraphs the coach chose to add (only offered when there is a fit). */
  includeProducts: ProductOption[]
}

const MOMENT_PHRASE: Record<string, string> = {
  morning: "הבוקר, כשממהרים",
  lunchWork: "הצהריים בעבודה או בדרכים",
  afternoon: "אחר הצהריים",
  evening: "הערב אחרי יום ארוך",
  weekend: "בסופי שבוע וביציאות",
}

const HAPPENS_PHRASE: Record<string, string> = {
  skip: "מדלגים על ארוחה",
  eatAvailable: "אוכלים את מה שזמין",
  veryHungry: "מגיעים רעבים מאוד",
  eatFast: "אוכלים מהר או תוך כדי משהו אחר",
  orderIn: "מזמינים אוכל כי אין פתרון זמין",
}

const HELP_PHRASE: Record<string, string> = {
  readyMade: "משהו מוכן שמחכה לכם",
  quickMeal: "ארוחה מהירה בלי להתארגן",
  proteinAvailable: "מקור חלבון זמין",
  takeAlong: "משהו לקחת מהבית",
  shortPlan: "לדעת מראש מה אוכלים",
  noTimeSolution: "פתרון שעובד גם בלי זמן",
}

function joinHe(items: string[]) {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} ו${items[items.length - 1]}`
}

function phrases(map: Record<string, string>, values: string[], other: string) {
  const list = values.filter((v) => v !== "other").map((v) => map[v]).filter(Boolean)
  if (values.includes("other") && other.trim()) list.push(other.trim())
  return joinHe(list)
}

// In the product scenarios the "tool to start with" is a regular tool; the product
// comes after it, as an additional option.
function anchorTool(p: Participant, skipProducts: boolean): string {
  const ok = (id: string) => TOOLS_BY_ID[id] && !(skipProducts && TOOLS_BY_ID[id].isProduct)
  const a = p.toolbox.anchorTool
  const id = a && a !== "unsure" && ok(a) ? a : p.toolbox.selectedTools.find(ok)
  return id ? toolName(id) : "{כלי_עוגן}"
}

function smallChange(p: Participant): string {
  const a = p.toolbox.anchorTool
  const id = a && a !== "unsure" ? a : p.toolbox.selectedTools[0]
  const summary = id ? TOOLS_BY_ID[id]?.summary : ""
  return (summary || "{שינוי_קטן}").replace(/[.]$/, "")
}

const INVITE = "אם תרצו, נעבור על זה יחד ונבנה משהו שמתאים בדיוק לכם. מתי נוח לכם לדבר?"

const WAKE_PARAGRAPH = (help: string) =>
  [
    `בגלל שציינתם שהיה עוזר לכם ${help || "משהו זמין"}, יש עוד אפשרות לימים כאלה: ווייק-שייק.`,
    "זו אחת האפשרויות לארוחה כשאין זמן או כוח להתארגן.",
    "(ווייק-שייק הוא מוצר של HoldOn, שאני משווקת.)",
    "אפשר להשתמש בו בימים העמוסים, ובשאר הימים להמשיך עם הכלי שבחרתם.",
    "אין צורך להחליט עכשיו. אם תרצו, נדבר ונראה אם זה בכלל מתאים לכם.",
  ].join("\n")

const MYSHIA_PARAGRAPH = [
  "בגלל שציינתם שאתם מחפשים משהו פשוט וקבוע, יש עוד אפשרות לשילוב בשגרה: מיי-שיא.",
  "זה משקה פשוט להכנה במים, עם 10 רכיבים תזונתיים, שאפשר לשלב בשגרה היומית לצד תזונה מגוונת.",
  "(מיי-שיא הוא מוצר של HoldOn, שאני משווקת.)",
  "אין צורך להחליט עכשיו. אם תרצו, נדבר ונראה אם זה בכלל מתאים לכם.",
].join("\n")

export function generateSummary(p: Participant, opts: SummaryOptions): SummaryResult {
  const missingDays = ([1, 2, 3] as const).filter((d) => !p[`day${d}` as "day1"].completedAt)
  if (missingDays.length > 0) return { kind: "incomplete", missingDays: [...missingDays] }

  const concerns = detectConcerns(p)
  if (concerns.length > 0) return { kind: "concern", reasons: concerns }

  const scenario = pickScenario(p) as ScenarioId
  const d = p.day3
  const happens = phrases(HAPPENS_PHRASE, d.happensChoices, d.happensOther) || "{מה_קורה}"
  const help = phrases(HELP_PHRASE, d.helpChoices, d.helpOther)
  const moment =
    d.momentChoice === "other"
      ? d.momentOther.trim() || "רגע מסוים ביום"
      : MOMENT_PHRASE[d.momentChoice] ?? "רגע מסוים ביום"
  const tool = anchorTool(p, scenario >= 6 && scenario <= 8)
  const hello = `היי ${p.firstName}, כאן ${opts.coachName} 💜`

  const fit = productFit(p)
  const elig = productEligibility(p)
  const productOptions: ProductOption[] = []
  if (fit !== "none") {
    if (elig.wakeShake) productOptions.push("wakeShake")
    if (elig.myShiaConfirmed) productOptions.push("myShia")
  }

  const body: Record<ScenarioId, string[]> = {
    1: [
      `${hello} עברתי על מה ששיתפתם בשלושת הימים.`,
      "",
      `מה שראיתי: הרגע הכי קשה שלכם הוא הבוקר, כשממהרים, ו${happens}.`,
      "נראה שזה לא עניין של כוח רצון אלא של זמן: בבוקר אין רגע להתארגן.",
      "",
      "שינוי קטן אחד שיכול להקל: להחליט בערב מה אוכלים בבוקר, או להכין משהו קטן מראש.",
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
    2: [
      `${hello} עברתי על התשובות שלכם.`,
      "",
      `מה שראיתי: הרגע שבו הכי קשה לכם הוא ${moment}, ו${happens}.`,
      "כשאין משהו בהישג יד, ההחלטה נעשית בלחץ, ואז לוקחים את מה שזמין.",
      "",
      "שינוי קטן אחד: להכניס מראש משהו קטן לתיק, כדי שלא תהיו תלויים במה שיש בדרך.",
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
    3: [
      `${hello} עברתי על מה ששיתפתם.`,
      "",
      `מה שראיתי: כשמגיע הרגע, לא תמיד יש משהו מוכן, אז ${happens}.`,
      "זו בעיה שקל לפתור, כי זה בעיקר עניין של הכנה קטנה מראש.",
      "",
      "שינוי קטן אחד: רשימה קצרה של כמה דברים שתמיד יש בבית, כדי שתמיד אפשר להרכיב משהו.",
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
    4: [
      `${hello} עברתי על התשובות שלכם.`,
      "",
      `מה שראיתי: אחר הצהריים הוא הרגע הכי קשה, האנרגיה יורדת, ו${happens}.`,
      "זה קורה להרבה אנשים, והפתרון בדרך כלל פשוט.",
      "",
      "שינוי קטן אחד: לתכנן מראש משהו קטן לשעה הזו, עדיף עם מקור חלבון זמין.",
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
    5: [
      `${hello} עברתי על מה ששיתפתם.`,
      "",
      "מה שראיתי: אתם מחפשים משהו פשוט שאפשר לשלב בשגרה בלי לחשוב יותר מדי.",
      "כשיש משהו קבוע וקל, הרבה יותר פשוט להתמיד.",
      "",
      "שינוי קטן אחד: לבחור דבר אחד קבוע ביום, ולהתחיל ממנו.",
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
    6: [
      `${hello} עברתי על התשובות שלכם.`,
      "",
      `מה שראיתי: הרגע הכי קשה שלכם הוא ${moment}, ו${happens}.${help ? ` מה ששיתפתם שהיה עוזר: ${help}.` : ""}`,
      "זה מצב של חוסר זמן, ולא עניין של כוח רצון.",
      "",
      "שינוי קטן אחד: להחזיק מראש משהו זמין לרגע הזה.",
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
    7: [
      `${hello} עברתי על התשובות שלכם.`,
      "",
      "מה שראיתי: אתם מחפשים משהו פשוט וקבוע שאפשר לשלב בשגרה היומית.",
      "בשביל זה בדרך כלל עובד הכי טוב משהו קטן שחוזרים עליו כל יום.",
      "",
      "שינוי קטן אחד: לבחור פעולה אחת יומית קבועה, ולבנות סביבה.",
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
    8: [
      `${hello} עברתי על התשובות שלכם.`,
      "",
      `מה שראיתי: ${moment}, ו${happens}.${help ? ` ומה שהיה עוזר לכם: ${help}.` : ""}`,
      "יש כאן שני צרכים: ארוחה זמינה ברגעים בלי זמן, ומשהו פשוט שמשתלב בשגרה היומית.",
      "",
      "שינוי קטן אחד: להתחיל בדבר אחד, ולא בהכול ביחד.",
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
    9: [
      `${hello} עברתי על מה ששיתפתם.`,
      "",
      `מה שראיתי: ${moment}, ו${happens}.`,
      "יש כאן משהו שאפשר להקל עליו בלי להוסיף שום דבר חדש.",
      "",
      `שינוי קטן אחד: ${smallChange(p)}.`,
      `הכלי שהייתי מתחילה איתו: ${tool}.`,
    ],
  }

  const lines = [...body[scenario], ""]

  // Product paragraphs: scenarios 6-8 carry them by design, 1-5 only when chosen.
  const wanted = new Set<ProductOption>(opts.includeProducts)
  if (scenario === 6) wanted.add("wakeShake")
  if (scenario === 7) wanted.add("myShia")
  if (scenario === 8) {
    wanted.add("wakeShake")
    wanted.add("myShia")
  }
  const allowed = new Set(productOptions)
  const include = [...wanted].filter((x) => allowed.has(x))

  if (scenario === 8 && include.length === 2) {
    lines.push(
      "יש שתי אפשרויות שאפשר לשקול, כל אחת לצורך אחר:",
      "• ווייק-שייק, לימים שאין זמן או כוח להתארגן על ארוחה.",
      "• מיי-שיא, משקה להכנה במים עם 10 רכיבים תזונתיים, לשילוב בשגרה היומית.",
      "(שניהם מוצרים של HoldOn, שאני משווקת.)",
      "אין צורך בשניהם. נבחר יחד מה מתאים, אם בכלל.",
      "",
    )
  } else {
    if (include.includes("wakeShake")) lines.push(WAKE_PARAGRAPH(help), "")
    if (include.includes("myShia")) lines.push(MYSHIA_PARAGRAPH, "")
  }

  lines.push(
    scenario === 9
      ? "זה כל מה שצריך בשלב הזה. נסו שבוע, ואשמח לשמוע איך הלך. אם תרצו, אפשר גם לדבר ולראות מה עוד יכול לעזור."
      : INVITE,
  )
  lines.push("", `ארגז הכלים שלכם: ${opts.toolboxLink}`)

  return { kind: "ok", scenario, text: lines.join("\n"), productOptions }
}
