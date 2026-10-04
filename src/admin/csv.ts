import { isValidEmail, isValidPhone, normalizePhone } from "./phone"

// Minimal RFC 4180 style parser: quoted fields, doubled quotes, CRLF, and a
// delimiter guessed from the header line (Meta and Excel exports use "," ";" or tab).
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "")
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ""
  const delimiter = [",", ";", "\t"]
    .map((d) => ({ d, n: firstLine.split(d).length }))
    .sort((a, b) => b.n - a.n)[0].d

  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        field += ch
      }
    } else if (ch === '"' && field === "") {
      // Only a quote at the start of a field opens quoting; a mid-field quote
      // (e.g. the header דוא"ל) is literal text.
      quoted = true
    } else if (ch === delimiter) {
      row.push(field)
      field = ""
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      field = ""
      rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""))
}

export type ColumnMapping = {
  fullName: number // -1 = none
  firstName: number
  lastName: number
  phone: number
  email: number
  createdAt: number
}

const has = (header: string, words: string[]) => {
  const h = header.trim().toLowerCase()
  return words.some((w) => h.includes(w))
}

// Guesses columns from Hebrew or English (Meta lead export) headers.
export function guessMapping(headers: string[]): ColumnMapping {
  const find = (words: string[], skip: (h: string) => boolean = () => false) =>
    headers.findIndex((h) => has(h, words) && !skip(h))
  const isFirst = (h: string) => has(h, ["first", "פרטי"])
  const isLast = (h: string) => has(h, ["last", "משפחה"])
  const fullName = find(["full_name", "full name", "שם מלא", "name", "שם"], (h) => isFirst(h) || isLast(h))
  const exactPhone = headers.findIndex((h) => ["טלפון", "phone", "phone_number"].includes(h.trim().toLowerCase()))
  return {
    fullName,
    firstName: find(["first_name", "first name", "שם פרטי", "פרטי"]),
    lastName: find(["last_name", "last name", "שם משפחה", "משפחה"]),
    phone: exactPhone >= 0 ? exactPhone : find(["phone", "טלפון", "נייד", "mobile"]),
    email: find(["email", "e-mail", "מייל", "דוא"]),
    createdAt: find(["created", "נוצר", "תאריך", "date"]),
  }
}

// Parses "10/04/2026 7:00am" (US order, as in the CRM export), "2026-10-04 07:00",
// and "04/10/2026 19:00" (day-first only when the first number can't be a month).
export function parseCreated(raw: string): string {
  const text = raw.trim()
  if (!text) return ""
  let y: number, mo: number, d: number, rest: string
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/)
  const slash = text.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})(.*)$/)
  if (iso) {
    ;[y, mo, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    rest = iso[4]
  } else if (slash) {
    const a = Number(slash[1])
    const b = Number(slash[2])
    ;[mo, d] = a > 12 ? [b, a] : [a, b]
    y = Number(slash[3])
    rest = slash[4]
  } else {
    return ""
  }
  const t = rest.match(/(\d{1,2}):(\d{2})\s*([ap]m)?/i)
  let h = t ? Number(t[1]) : 0
  const mi = t ? Number(t[2]) : 0
  const ap = t?.[3]?.toLowerCase()
  if (ap === "pm" && h < 12) h += 12
  if (ap === "am" && h === 12) h = 0
  const date = new Date(y, mo - 1, d, h, mi)
  if (Number.isNaN(date.getTime()) || date.getMonth() !== mo - 1 || date > new Date()) return ""
  return date.toISOString()
}

export type ImportRow = {
  line: number
  fullName: string
  phone: string // normalized
  email: string
  createdAt: string // ISO, or "" when missing / unparseable
  error?: string
  duplicate?: "existing" | "file"
}

export function buildImportRows(
  data: string[][],
  mapping: ColumnMapping,
  existing: { phones: Set<string>; emails: Set<string> },
): ImportRow[] {
  const cell = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "")
  const seenPhones = new Set<string>()
  const seenEmails = new Set<string>()

  return data.map((r, idx) => {
    const fullName =
      cell(r, mapping.fullName) ||
      [cell(r, mapping.firstName), cell(r, mapping.lastName)].filter(Boolean).join(" ")
    const phone = normalizePhone(cell(r, mapping.phone))
    const email = cell(r, mapping.email).toLowerCase()
    const createdAt = parseCreated(cell(r, mapping.createdAt))
    const row: ImportRow = { line: idx + 2, fullName, phone, email, createdAt }

    if (!fullName) row.error = "חסר שם"
    else if (!isValidPhone(phone)) row.error = "טלפון לא תקין"
    else if (email && !isValidEmail(email)) row.error = "מייל לא תקין"
    else if (existing.phones.has(phone) || (email && existing.emails.has(email))) {
      row.duplicate = "existing"
    } else if (seenPhones.has(phone) || (email && seenEmails.has(email))) {
      row.duplicate = "file"
    }

    if (!row.error && !row.duplicate) {
      seenPhones.add(phone)
      if (email) seenEmails.add(email)
    }
    return row
  })
}
