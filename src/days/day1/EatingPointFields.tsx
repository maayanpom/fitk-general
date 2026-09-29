import styled from "styled-components"
import { TimeField } from "@/components/challenge/TimeField"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EatingPoint } from "./types"

const Row = styled.div`
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 10px;
  align-items: end;
  flex: 1;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.9rem;
    color: var(--muted-foreground);
    font-weight: 500;
  }

  input {
    height: 48px;
    background: var(--background);
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
        <TimeField
          id={`${id}-time`}
          value={value.time}
          onChange={(time) => onChange({ ...value, time })}
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
