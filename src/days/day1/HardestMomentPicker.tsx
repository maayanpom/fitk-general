import styled from "styled-components"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HARDEST_OPTIONS, type HardestMoment } from "./types"

const Options = styled(RadioGroup)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const Pill = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1.5px solid var(--border);
  background: var(--card);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:has([data-state="checked"]) {
    border-color: var(--primary);
    background: var(--accent);
    color: var(--accent-foreground);
  }

  &:has(:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
`

type Props = {
  value: HardestMoment
  onChange: (value: HardestMoment) => void
}

export function HardestMomentPicker({ value, onChange }: Props) {
  return (
    <Options
      value={value}
      onValueChange={(v) => onChange(v as HardestMoment)}
      aria-label="איפה היה לי הכי קשה היום?"
    >
      {HARDEST_OPTIONS.map((option) => (
        <Pill key={option.value}>
          <RadioGroupItem value={option.value} />
          {option.label}
        </Pill>
      ))}
    </Options>
  )
}
