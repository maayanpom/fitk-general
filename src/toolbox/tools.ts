import type { ToolboxData } from "@/data/participant"

export type ToolBlock =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; title?: string; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "pick"; field: "fiveMinuteMeal" | "bagSnack"; label: string; items: string[] }
  | { type: "checklist"; field: keyof Pick<ToolboxData, "homeChecklist">; label: string; items: string[] }

export type Tool = {
  id: string
  emoji: string
  /** Short name used on the tools board and in "my tools". */
  name: string
  heading: string
  summary: string
  blocks: ToolBlock[]
  isProduct?: boolean
}

// Order matters: product tools (shake, My-Shia) always come last.
export const TOOLS: Tool[] = [
  {
    id: "plan30",
    emoji: "🗓️",
    name: "מתכננים מראש",
    heading: "30 שניות של תכנון",
    summary: "בוחרים מראש מתי אוכלים ומה בערך תהיה הארוחה.",
    blocks: [
      { type: "strong", text: "בחרו מראש מתי אתם אוכלים ומה בערך תהיה הארוחה." },
      { type: "text", text: "לדוגמה:" },
      { type: "quote", text: "13:00 – עוף + אורז + ירקות" },
      { type: "text", text: "ולא:" },
      { type: "quote", text: "\"נראה כבר מה יהיה.\"" },
      { type: "text", text: "הכוונה היא להפחית את הצורך לקבל החלטה כשכבר רעבים ועמוסים." },
    ],
  },
  {
    id: "emergencyMeal",
    emoji: "🆘",
    name: "ארוחת חירום",
    heading: "תמיד שיהיה משהו זמין",
    summary: "כמה אפשרויות מהירות שתמיד נמצאות בבית.",
    blocks: [
      { type: "text", text: "במקום להגיע למצב:" },
      { type: "quote", text: "\"אין לי כלום בבית!\"" },
      { type: "text", text: "להחזיק כמה אפשרויות מהירות. לדוגמה:" },
      {
        type: "list",
        items: [
          "טונה",
          "ביצים",
          "גבינה או יוגורט",
          "פיתה",
          "ירקות חתוכים",
          "טחינה",
          "קטניות מוכנות",
          "ירקות קפואים",
        ],
      },
    ],
  },
  {
    id: "cookTwice",
    emoji: "🍲",
    name: "מכינים פעם אחת, אוכלים כמה פעמים",
    heading: "\"כבר מבשלים? תעשו כפול.\"",
    summary: "מכינים כמות נוספת – והארוחה הבאה כבר מוכנה.",
    blocks: [
      { type: "list", title: "כשמכינים:", items: ["עוף", "אורז", "ירקות", "מרק", "תבשיל"] },
      {
        type: "text",
        text: "מכינים כמות גדולה יותר של מנה בסיסית ואוכלים אותה בכמה ארוחות, כמו שהיא או בצורה אחרת. זה חוסך את הרגע של אין לי מה לאכול.",
      },
      { type: "strong", text: "כך הארוחה הבאה כבר מתחילה מוכנה." },
    ],
  },
  {
    id: "freezer",
    emoji: "❄️",
    name: "המקפיא עובד בשבילי",
    heading: "המקפיא הוא חבר",
    summary: "מרכיבים ארוחה גם ביום שבו אין זמן לבשל.",
    blocks: [
      {
        type: "list",
        title: "להחזיק במקפיא:",
        items: [
          "ירקות קפואים",
          "לחם או פיתות",
          "מנות שהכנו מראש",
          "מרק",
          "תבשילים",
          "רכיבי ארוחה מוכנים",
        ],
      },
      { type: "text", text: "המטרה:" },
      { type: "strong", text: "לאפשר לעצמנו להרכיב ארוחה גם ביום שבו אין זמן לבשל." },
    ],
  },
  {
    id: "easyVeg",
    emoji: "🥦",
    name: "ירקות בלי עבודה",
    heading: "לא חייבים לשטוף ולחתוך עכשיו",
    summary: "ירקות מוכנים, קפואים או חתוכים – בלי חיכוך.",
    blocks: [
      {
        type: "list",
        title: "אפשר להחזיק:",
        items: [
          "ירקות קפואים",
          "שקית סלט מוכנה",
          "ירקות שטופים",
          "ירקות חתוכים מראש",
          "ירקות שאפשר לאכול כמו שהם",
        ],
      },
      { type: "text", text: "המטרה:" },
      { type: "strong", text: "להוריד את החיכוך." },
      {
        type: "text",
        text: "אם כדי לאכול ירק צריך 10 דקות עבודה – ביום עמוס הוא עלול להישאר במקרר.",
      },
    ],
  },
  {
    id: "lazyPlate",
    emoji: "🍽️",
    name: "צלחת עצלנית",
    heading: "אין כוח לבשל?",
    summary: "חלבון + פחמימה + ירק – ממה שיש.",
    blocks: [
      { type: "text", text: "לא חייבים." },
      { type: "text", text: "אפשר להרכיב ארוחה פשוטה ממה שיש:" },
      { type: "strong", text: "חלבון + פחמימה + ירק" },
      { type: "text", text: "לדוגמה:" },
      { type: "quote", text: "טונה + פיתה + מלפפון" },
      { type: "text", text: "או:" },
      { type: "quote", text: "ביצים + לחם + סלט מוכן" },
      { type: "text", text: "או:" },
      { type: "quote", text: "עוף מוכן + אורז מוכן + ירקות קפואים" },
      {
        type: "strong",
        text: "ארוחה פשוטה עדיפה על ויתור על ארוחה כי לא היה כוח להכין משהו \"נכון\".",
      },
    ],
  },
  {
    id: "fiveMinutes",
    emoji: "⏱️",
    name: "ארוחת 5 דקות",
    heading: "יש לך 5 דקות?",
    summary: "שילוב שאפשר להכין כמעט בלי לחשוב.",
    blocks: [
      { type: "text", text: "בחרו שילוב שאתם יודעים להכין כמעט בלי לחשוב." },
      {
        type: "pick",
        field: "fiveMinuteMeal",
        label: "שמרו את ארוחת ה־5 דקות שלי",
        items: [
          "חביתה + לחם + ירקות",
          "טונה + פיתה + ירקות",
          "יוגורט + תוספות מתאימות",
          "קוטג' + לחם + ירקות",
          "שאריות עוף + פחמימה מוכנה + ירק",
        ],
      },
    ],
  },
  {
    id: "proteinFirst",
    emoji: "🥚",
    name: "קודם חלבון",
    heading: "לא יודעים ממה להתחיל?",
    summary: "בוחרים קודם מקור חלבון, ואז משלימים.",
    blocks: [
      { type: "text", text: "כשמרכיבים ארוחה במהירות:" },
      { type: "strong", text: "קודם בוחרים מקור חלבון." },
      { type: "text", text: "אחר כך:" },
      { type: "strong", text: "מוסיפים ירק + פחמימה לפי הצורך." },
    ],
  },
  {
    id: "bagSnack",
    emoji: "🎒",
    name: "משהו בתיק",
    heading: "לא יוצאים מהבית בלי תוכנית",
    summary: "יום ארוך? מכניסים לתיק אפשרות זמינה.",
    blocks: [
      {
        type: "text",
        text: "אם יודעים שהולך להיות יום ארוך: להכניס לתיק אפשרות זמינה.",
      },
      {
        type: "pick",
        field: "bagSnack",
        label: "מה יש לי בתיק היום?",
        items: ["אגוזים", "חטיף חלבון", "טונה", "פיתה עם חלבון", "פרי"],
      },
    ],
  },
  {
    id: "notStarving",
    emoji: "🚨",
    name: "לא להגיע מורעבים",
    heading: "\"אני אחכה עד הערב\"",
    summary: "מתכננים מראש משהו קטן וזמין.",
    blocks: [
      { type: "text", text: "זו מלכודת נפוצה ביום עמוס." },
      {
        type: "text",
        text: "במקום לדלג על ארוחות ואז להגיע לארוחה כשאתם רעבים מאוד:",
      },
      { type: "strong", text: "תכננו מראש משהו קטן וזמין." },
      { type: "text", text: "אפשר להשתמש באפשרות ביניים חלבונית, בהתאם למבנה היום ולרעב." },
    ],
  },
  {
    id: "quickShop",
    emoji: "🛒",
    name: "קנייה של 10 דקות",
    heading: "כשאין אוכל בבית",
    summary: "רשימת חירום קבועה – בלי קנייה גדולה.",
    blocks: [
      { type: "text", text: "לא חייבים לעשות קנייה גדולה. להחזיק רשימת חירום קבועה:" },
      { type: "list", title: "חלבון:", items: ["טונה / ביצים / גבינה / יוגורט / עוף מוכן"] },
      { type: "list", title: "פחמימה:", items: ["לחם / פיתה / אורז / תפוחי אדמה"] },
      { type: "list", title: "ירקות:", items: ["סלט מוכן / ירקות קפואים / ירקות חתוכים"] },
      { type: "list", title: "שומן:", items: ["טחינה / אבוקדו"] },
      { type: "text", text: "כך אפשר להרכיב כמה ארוחות בלי לחשוב יותר מדי." },
    ],
  },
  {
    id: "smartOrder",
    emoji: "📱",
    name: "להזמין אוכל בלי \"הרסתי\"",
    heading: "אין זמן לבשל? גם הזמנה היא אפשרות.",
    summary: "חלבון, ירקות, פחמימה לפי הצורך ורטבים בצד.",
    blocks: [
      {
        type: "steps",
        items: [
          "מחפשים מקור חלבון.",
          "מוסיפים ירקות.",
          "בוחרים פחמימה בהתאם לצורך.",
          "מבקשים רטבים בצד אם זה עוזר.",
        ],
      },
    ],
  },
  {
    id: "leftovers",
    emoji: "🔄",
    name: "אותו אוכל, שימוש חדש",
    heading: "שאריות לא חייבות להרגיש כמו שאריות",
    summary: "מה שנשאר מאתמול הופך לארוחה חדשה.",
    blocks: [
      { type: "text", text: "לדוגמה:" },
      {
        type: "list",
        items: [
          "עוף מאתמול ← היום בפיתה עם ירקות.",
          "ירקות בתנור ← מחר בתוך חביתה, סלט או פיתה.",
          "אורז ← למחרת לצד חלבון וירקות.",
        ],
      },
    ],
  },
  {
    id: "tenMinutePause",
    emoji: "⏸️",
    name: "עצירה של 10 דקות",
    heading: "לפעמים הבעיה היא לא שאין אוכל. פשוט לא עצרנו.",
    summary: "10 דקות ביומן – רק לארוחה.",
    blocks: [
      { type: "text", text: "לקבוע ביומן:" },
      { type: "strong", text: "10 דקות לארוחה." },
      {
        type: "list",
        items: [
          "בלי לעבוד תוך כדי.",
          "בלי לסדר את הבית תוך כדי.",
          "בלי \"אני רק אעשה משהו קטן\".",
        ],
      },
      { type: "text", text: "המטרה:" },
      { type: "strong", text: "לתת לאכילה מקום אמיתי בתוך היום." },
    ],
  },
  {
    id: "homeList",
    emoji: "🏠",
    name: "מה תמיד יש לי בבית",
    heading: "בונים לעצמנו רשימת ביטחון",
    summary: "רשימה קטנה שמבטיחה שתמיד יש ממה להרכיב ארוחה.",
    blocks: [
      {
        type: "checklist",
        field: "homeChecklist",
        label: "מה תמיד יש לי בבית?",
        items: ["חלבון", "פחמימה", "ירקות", "שומן", "פתרון חירום"],
      },
    ],
  },
  {
    id: "wakeShake",
    emoji: "🥤",
    name: "ווייק-שייק",
    heading: "כשאין זמן לעצור לארוחה",
    summary: "אפשרות נוחה לימים שבהם אין זמן לעצור לארוחה.",
    isProduct: true,
    blocks: [
      {
        type: "list",
        items: [
          "25 גרם חלבון",
          "3 גרם קריאטין",
          "21 ויטמינים ומינרלים",
          "3.3 גרם סיבים",
          "כ־180 קלוריות למנה",
        ],
      },
      { type: "strong", text: "אפשרות נוחה לימים שבהם אין זמן לעצור לארוחה." },
      { type: "text", text: "בשיתוף HoldOn. נתוני המוצר לפי העלון הרשמי בלבד." },
    ],
  },
  {
    id: "myShia",
    emoji: "🍑",
    name: "מיי-שיא",
    heading: "כשמחפשים אפשרות נוחה לצד אוכל",
    summary: "כלי שאפשר לשלב לצד אוכל רגיל.",
    isProduct: true,
    blocks: [
      {
        type: "list",
        items: ["ויטמין A – 700 מק\"ג למנה", "כ־70% מהקצובה היומית", "ביוטין"],
      },
      { type: "strong", text: "כלי שאפשר לשלב לצד אוכל רגיל כשמחפשים אפשרות נוחה." },
      { type: "text", text: "בשיתוף HoldOn. נתוני המוצר לפי העלון הרשמי בלבד." },
    ],
  },
]

export const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<string, Tool>
