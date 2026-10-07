import { useMemo, useState } from "react"
import { Download } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Participant } from "@/data/participant"
import type { Registration } from "./adminData"
import { downloadCsv, RESULT_COLUMNS, resultsToCsv } from "./resultsExport"

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  input {
    height: 40px;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0 8px;
    background: var(--card);
    font: inherit;
  }
`

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" })

const Panel = styled.div`
  padding: 8px;
  border-radius: 18px;
  background: var(--card);
  overflow-x: auto;
`

// One row per person, one column per answer - the same layout the CSV export uses.
export function ResultsTab({
  registrations,
  participants,
}: {
  registrations: Registration[]
  participants: Participant[]
}) {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  // Filter by registration date (Israel calendar day); inputs are YYYY-MM-DD.
  const shown = useMemo(
    () =>
      registrations.filter((r) => {
        const day = dayKey.format(new Date(r.createdAt))
        return (!from || day >= from) && (!to || day <= to)
      }),
    [registrations, from, to],
  )

  const rows = useMemo(() => {
    const byId = new Map(participants.map((p) => [p.participantId, p]))
    return shown.map((r) => {
      const p = r.participantId ? byId.get(r.participantId) : undefined
      return RESULT_COLUMNS.map((c) => c.value(r, p))
    })
  }, [shown, participants])

  const exportCsv = () => {
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`challenge-results-${date}.csv`, resultsToCsv(rows))
  }

  return (
    <Stack>
      <Filters>
        <label>
          הרשמה מתאריך <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          עד תאריך <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download />
          ייצוא ל-Excel (CSV)
        </Button>
      </Filters>
      <Panel>
        <Table>
          <TableHeader>
            <TableRow>
              {RESULT_COLUMNS.map((c) => (
                <TableHead key={c.header} className="text-start whitespace-nowrap">
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={RESULT_COLUMNS.length} className="text-center text-muted-foreground">
                  עוד אין תוצאות
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, i) => (
              <TableRow key={shown[i].id}>
                {row.map((v, col) => (
                  <TableCell key={col} className="whitespace-nowrap">
                    {v}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </Stack>
  )
}
