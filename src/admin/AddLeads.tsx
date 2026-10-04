import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addRegistrations, type Registration } from "./adminData"
import { buildImportRows, guessMapping, parseCsv, type ColumnMapping } from "./csv"
import { isValidEmail, isValidPhone, normalizePhone } from "./phone"

const Card = styled.form`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  background: var(--secondary);

  label {
    font-weight: 600;
    font-size: 0.9rem;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 170px;

  input,
  select {
    height: 44px;
    background: var(--card);
  }

  select {
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0 8px;
    font: inherit;
  }
`

const ConsentRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  font-size: 0.9rem;
  line-height: 1.55;
  cursor: pointer;

  button[role="checkbox"] {
    margin-top: 3px;
    flex-shrink: 0;
  }
`

const ErrorText = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.9rem;
`

const OkText = styled.p`
  margin: 0;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
`

const PreviewTable = styled.div`
  max-height: 260px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.85rem;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 6px 8px;
    text-align: start;
    border-bottom: 1px solid var(--border);
  }

  tr[data-bad="true"] td {
    background: color-mix(in oklab, var(--destructive) 10%, transparent);
  }

  tr[data-dup="true"] td {
    color: var(--muted-foreground);
  }
`

const CONSENT_MANUAL = "המשתתף אישר בטופס של מטא רישום ל-HoldOn וקבלת הודעות."
const CONSENT_BATCH = "כל המיובאים אישרו בטופס מטא רישום ל-HoldOn וקבלת הודעות."

// 5.2
export function ManualAdd({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

  const normalized = normalizePhone(phone)
  const emailOk = !email.trim() || isValidEmail(email.trim())
  const canSubmit = name.trim() && isValidPhone(normalized) && emailOk && confirmed && !busy

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError("")
    setOk("")
    try {
      const res = await addRegistrations(
        [{ full_name: name.trim(), phone: normalized, email: email.trim() }],
        "manual",
        "",
      )
      if (res.inserted === 0) {
        setError("המשתתף כבר קיים ברשימה (לפי טלפון או מייל).")
      } else {
        setOk("נוסף")
        setName("")
        setPhone("")
        setEmail("")
        setConfirmed(false)
        onAdded()
      }
    } catch (err) {
      console.error(err)
      setError("ההוספה נכשלה. נסו שוב.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card onSubmit={(e) => void submit(e)}>
      <Field>
        <Label htmlFor="manual-name">שם מלא</Label>
        <Input id="manual-name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field>
        <Label htmlFor="manual-phone">טלפון</Label>
        <Input
          id="manual-phone"
          type="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Field>
      <Field>
        <Label htmlFor="manual-email">מייל</Label>
        <Input
          id="manual-email"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <ConsentRow>
        <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} />
        <span>{CONSENT_MANUAL}</span>
      </ConsentRow>
      <Button type="submit" disabled={!canSubmit}>
        הוספה
      </Button>
      {error && <ErrorText>{error}</ErrorText>}
      {ok && <OkText>{ok}</OkText>}
    </Card>
  )
}

const NONE = -1

// 5.3
export function CsvImportDialog({
  open,
  onClose,
  existing,
  onImported,
}: {
  open: boolean
  onClose: () => void
  existing: Registration[]
  onImported: () => void
}) {
  const [data, setData] = useState<string[][]>([])
  const [fileName, setFileName] = useState("")
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState("")

  const headers = data[0] ?? []
  const body = useMemo(() => data.slice(1), [data])

  const existingSets = useMemo(
    () => ({
      phones: new Set(existing.map((r) => r.phone)),
      emails: new Set(existing.map((r) => r.email.toLowerCase()).filter(Boolean)),
    }),
    [existing],
  )

  const rows = useMemo(
    () => (mapping ? buildImportRows(body, mapping, existingSets) : []),
    [body, mapping, existingSets],
  )
  const valid = rows.filter((r) => !r.error && !r.duplicate)
  const bad = rows.filter((r) => r.error)
  const dups = rows.filter((r) => r.duplicate)

  const reset = () => {
    setData([])
    setFileName("")
    setMapping(null)
    setConfirmed(false)
    setError("")
    setResult("")
  }

  const close = () => {
    reset()
    onClose()
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setError("")
    setResult("")
    try {
      const parsed = parseCsv(await file.text())
      if (parsed.length < 2) {
        setError("הקובץ ריק או שאין בו שורות נתונים.")
        return
      }
      setData(parsed)
      setFileName(file.name)
      setMapping(guessMapping(parsed[0]))
      setConfirmed(false)
    } catch (err) {
      console.error(err)
      setError("לא הצלחנו לקרוא את הקובץ.")
    }
  }

  const save = async () => {
    setBusy(true)
    setError("")
    try {
      const batch = `${fileName.replace(/\.csv$/i, "")} ${new Date().toISOString().slice(0, 10)}`
      const res = await addRegistrations(
        valid.map((r) => ({
          full_name: r.fullName,
          phone: r.phone,
          email: r.email,
          created_at: r.createdAt || undefined,
        })),
        "meta_ad",
        batch,
      )
      setResult(`יובאו ${res.inserted} משתתפים. דולגו ${res.skippedDuplicates} כפולים.`)
      setData([])
      setMapping(null)
      setConfirmed(false)
      onImported()
    } catch (err) {
      console.error(err)
      setError("הייבוא נכשל. נסו שוב.")
    } finally {
      setBusy(false)
    }
  }

  const setCol = (key: keyof ColumnMapping) => (e: ChangeEvent<HTMLSelectElement>) =>
    setMapping((m) => (m ? { ...m, [key]: Number(e.target.value) } : m))

  const select = (key: keyof ColumnMapping, label: string) => (
    <Field>
      <Label htmlFor={`map-${key}`}>{label}</Label>
      <select id={`map-${key}`} value={mapping?.[key] ?? NONE} onChange={setCol(key)}>
        <option value={NONE}>ללא</option>
        {headers.map((h, i) => (
          <option key={i} value={i}>
            {h || `עמודה ${i + 1}`}
          </option>
        ))}
      </select>
    </Field>
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent dir="rtl" className="max-h-[90dvh] gap-4 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ייבוא CSV מהמודעה</DialogTitle>
          <DialogDescription>
            קובץ ייצוא לידים של מטא, בקידוד UTF-8, עם כותרות בעברית או באנגלית. הקובץ עצמו לא נשמר.
          </DialogDescription>
        </DialogHeader>

        <input type="file" accept=".csv,text/csv" onChange={(e) => void onFile(e)} />

        {mapping && (
          <>
            <Card as="div">
              {select("fullName", "שם מלא")}
              {select("firstName", "שם פרטי")}
              {select("lastName", "שם משפחה")}
              {select("phone", "טלפון")}
              {select("email", "מייל")}
              {select("createdAt", "זמן כניסה")}
            </Card>

            <p className="m-0 text-sm">
              {valid.length} תקינות · {dups.length} כפולות · {bad.length} שגויות
            </p>

            <PreviewTable>
              <table>
                <thead>
                  <tr>
                    <th>שורה</th>
                    <th>שם</th>
                    <th>טלפון</th>
                    <th>מייל</th>
                    <th>כניסה</th>
                    <th>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.line} data-bad={Boolean(r.error)} data-dup={Boolean(r.duplicate)}>
                      <td>{r.line}</td>
                      <td>{r.fullName}</td>
                      <td dir="ltr">{r.phone}</td>
                      <td dir="ltr">{r.email}</td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("he-IL") : "—"}</td>
                      <td>
                        {r.error ??
                          (r.duplicate === "existing"
                            ? "כבר קיים"
                            : r.duplicate === "file"
                              ? "כפול בקובץ"
                              : "תקין")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PreviewTable>

            <ConsentRow>
              <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} />
              <span>{CONSENT_BATCH}</span>
            </ConsentRow>

            <Button disabled={!confirmed || valid.length === 0 || busy} onClick={() => void save()}>
              אישור ושמירה של {valid.length} שורות תקינות
            </Button>
          </>
        )}

        {error && <ErrorText>{error}</ErrorText>}
        {result && <OkText>{result}</OkText>}
      </DialogContent>
    </Dialog>
  )
}
