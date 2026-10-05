import type { Participant } from "@/data/participant"
import { HARDEST_OPTIONS, MEALS } from "@/days/day1/types"
import { MEAL_OPTIONS } from "@/days/day2/content"
import { HAPPENS_OPTIONS, HELP_OPTIONS, MOMENT_OPTIONS } from "@/days/day3/content"
import { formatDateTime, SOURCE_LABELS, type Registration } from "./adminData"

export type ResultColumn = {
  header: string
  value: (r: Registration, p: Participant | undefined) => string
}

const point = ({ time, food }: { time: string; food: string }) =>
  [time, food].filter(Boolean).join(" · ")
const mark = (v: boolean | undefined) => (v ? "כן" : "")
const done = (iso: string | undefined) => (iso ? formatDateTime(iso) : "")

// One flat row per person: everything a coach would want in a single Excel line.
export const RESULT_COLUMNS: ResultColumn[] = [
  { header: "שם", value: (r) => r.fullName },
  { header: "טלפון", value: (r) => r.phone },
  { header: "מייל", value: (r) => r.email },
  { header: "מקור", value: (r) => SOURCE_LABELS[r.source] },
  { header: "תאריך הרשמה", value: (r) => formatDateTime(r.createdAt) },
  { header: "נרשם ל-HoldOn", value: (r) => (r.holdonRegisteredAt ? "כן" : "") },
  { header: "יום 1 הושלם", value: (_, p) => done(p?.day1.completedAt) },
  ...MEALS.map<ResultColumn>((m) => ({
    header: `יום 1 – ${m.label}`,
    value: (_, p) => (p ? point(p.day1[m.key]) : ""),
  })),
  {
    header: "יום 1 – נשנושים",
    value: (_, p) =>
      p ? p.day1.additionalSnacks.filter((s) => s.time || s.food).map(point).join(" | ") : "",
  },
  {
    header: "יום 1 – הכי קשה",
    value: (_, p) => HARDEST_OPTIONS.find((o) => o.value === p?.day1.hardestMoment)?.label ?? "",
  },
  { header: "יום 2 הושלם", value: (_, p) => done(p?.day2.completedAt) },
  {
    header: "יום 2 – ארוחה",
    value: (_, p) => MEAL_OPTIONS.find((o) => o.value === p?.day2.mealChosen)?.label ?? "",
  },
  { header: "יום 2 – חלבון", value: (_, p) => mark(p?.day2.protein) },
  { header: "יום 2 – ירקות", value: (_, p) => mark(p?.day2.vegetables) },
  { header: "יום 2 – פחמימה", value: (_, p) => mark(p?.day2.carbs) },
  { header: "יום 2 – שומן", value: (_, p) => mark(p?.day2.fat) },
  { header: "יום 3 הושלם", value: (_, p) => done(p?.day3.completedAt) },
  {
    header: "יום 3 – הרגע הקשה",
    value: (_, p) => MOMENT_OPTIONS.find((o) => o.value === p?.day3.momentChoice)?.label ?? "",
  },
  {
    header: "יום 3 – בדרך כלל קורה",
    value: (_, p) => HAPPENS_OPTIONS.find((o) => o.value === p?.day3.happensChoice)?.label ?? "",
  },
  {
    header: "יום 3 – מה היה עוזר",
    value: (_, p) => HELP_OPTIONS.find((o) => o.value === p?.day3.helpChoice)?.label ?? "",
  },
  { header: "יום 3 – הערה", value: (_, p) => p?.day3.extraNote.trim() ?? "" },
  { header: "הערות המאמן/ת", value: (r) => r.coachNotes },
]

const quote = (v: string) => `"${v.replace(/"/g, '""')}"`

// UTF-8 with a BOM so Excel opens Hebrew correctly. The phone is forced to text
// (="...") so Excel doesn't turn 9725... into scientific notation.
export function resultsToCsv(rows: string[][]): string {
  const lines = [RESULT_COLUMNS.map((c) => c.header), ...rows].map((row, i) =>
    row.map((v, col) => (i > 0 && RESULT_COLUMNS[col].header === "טלפון" && v ? `="${v}"` : quote(v))).join(","),
  )
  return `﻿${lines.join("\r\n")}`
}

export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
