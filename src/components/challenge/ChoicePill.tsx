import { Check } from "lucide-react"
import styled from "styled-components"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export const ChoiceGroup = styled(RadioGroup)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const Card = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px 18px;
  border-radius: 16px;
  border: 1.5px solid var(--input);
  background: var(--card);
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  /* The whole card is the radio's hit target; the radio itself stays invisible. */
  button[role="radio"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .tick {
    display: none;
    color: var(--primary);
  }

  &:has([data-state="checked"]) {
    border-color: var(--primary);
    background: var(--lavender);
    font-weight: 700;
  }

  &:has([data-state="checked"]) .tick {
    display: inline-flex;
  }

  &:has(:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export function ChoicePill({ value, children }: { value: string; children: string }) {
  return (
    <Card>
      <RadioGroupItem value={value} />
      <span className="tick" aria-hidden>
        <Check size={18} strokeWidth={3} />
      </span>
      {children}
    </Card>
  )
}
