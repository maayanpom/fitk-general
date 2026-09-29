import styled from "styled-components"

// 24-hour time as two selects (hour 00-23, minutes 00/15/30/45). Never a native
// time input, which shows AM/PM on some devices. Stored as "HH:MM", "" when empty.
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = ["00", "15", "30", "45"]

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  direction: ltr;

  select {
    flex: 1;
    min-width: 0;
    height: 48px;
    padding: 0 6px;
    border: 1px solid var(--input);
    border-radius: 12px;
    background: var(--background);
    color: var(--foreground);
    font: inherit;
    text-align: center;
    text-align-last: center;
  }

  span {
    font-weight: 700;
  }
`

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
}

export function TimeField({ id, value, onChange }: Props) {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  const hour = match?.[1] ?? ""
  const minute = match?.[2] ?? ""
  // Keep an old free-typed minute (e.g. 07:20) selectable instead of losing it.
  const minutes = minute && !MINUTES.includes(minute) ? [...MINUTES, minute].sort() : MINUTES

  return (
    <Row>
      <select
        id={`${id}-hour`}
        aria-label="שעה"
        value={hour}
        onChange={(e) => onChange(e.target.value ? `${e.target.value}:${minute || "00"}` : "")}
      >
        <option value="">--</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span aria-hidden>:</span>
      <select
        id={`${id}-minute`}
        aria-label="דקות"
        value={minute}
        disabled={!hour}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
      >
        {!hour && <option value="">--</option>}
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </Row>
  )
}
