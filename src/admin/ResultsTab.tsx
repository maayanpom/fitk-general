import { useMemo } from "react"
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
  const rows = useMemo(() => {
    const byId = new Map(participants.map((p) => [p.participantId, p]))
    return registrations.map((r) => {
      const p = r.participantId ? byId.get(r.participantId) : undefined
      return RESULT_COLUMNS.map((c) => c.value(r, p))
    })
  }, [registrations, participants])

  const exportCsv = () => {
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`challenge-results-${date}.csv`, resultsToCsv(rows))
  }

  return (
    <Stack>
      <div>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download />
          ייצוא ל-Excel (CSV)
        </Button>
      </div>
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
              <TableRow key={registrations[i].id}>
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
