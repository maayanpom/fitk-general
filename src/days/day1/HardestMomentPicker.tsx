import { ChoiceGroup, ChoicePill } from "@/components/challenge/ChoicePill"
import { HARDEST_OPTIONS, type HardestMoment } from "./types"

type Props = {
  value: HardestMoment
  onChange: (value: HardestMoment) => void
}

export function HardestMomentPicker({ value, onChange }: Props) {
  return (
    <ChoiceGroup
      value={value}
      onValueChange={(v) => onChange(v as HardestMoment)}
      aria-label="איפה הכי קשה לכם לשמור על הסדר היום?"
    >
      {HARDEST_OPTIONS.map((option) => (
        <ChoicePill key={option.value} value={option.value}>
          {option.label}
        </ChoicePill>
      ))}
    </ChoiceGroup>
  )
}
