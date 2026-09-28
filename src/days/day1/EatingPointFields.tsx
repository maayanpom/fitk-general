import styled from "styled-components"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EatingPoint } from "./types"

const Row = styled.div`
  display: grid;
  grid-template-columns: 104px 1fr;
  gap: 10px;
  align-items: end;
  flex: 1;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.8rem;
    color: var(--muted-foreground);
    font-weight: 500;
  }

  input {
    height: 42px;
    background: var(--background);
  }

  input[type="time"] {
    text-align: center;
  }
`

type Props = {
  id: string
  value: EatingPoint
  foodLabel: string
  onChange: (value: EatingPoint) => void
}

export function EatingPointFields({ id, value, foodLabel, onChange }: Props) {
  return (
    <Row>
      <Field>
        <Label htmlFor={`${id}-time`}>שעה</Label>
        <Input
          id={`${id}-time`}
          type="time"
          dir="ltr"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
        />
      </Field>
      <Field>
        <Label htmlFor={`${id}-food`}>{foodLabel}</Label>
        <Input
          id={`${id}-food`}
          maxLength={60}
          value={value.food}
          onChange={(e) => onChange({ ...value, food: e.target.value })}
        />
      </Field>
    </Row>
  )
}
