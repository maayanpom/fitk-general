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
    } else if (ch === '"') {
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
  return {
    fullName,
    firstName: find(["first_name", "first name", "שם פרטי", "פרטי"]),
    lastName: find(["last_name", "last name", "שם משפחה", "משפחה"]),
    phone: find(["phone", "טלפון", "נייד", "mobile"]),
    email: find(["email", "e-mail", "מייל", "דוא"]),
  }
}

export type ImportRow = {
  line: number
  fullName: string
  phone: string // normalized
  email: string
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
    const row: ImportRow = { line: idx + 2, fullName, phone, email }

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
