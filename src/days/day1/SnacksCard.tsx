import { Plus, Trash2 } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { EatingPointFields } from "./EatingPointFields"
import { PointCard } from "./PointCard"
import type { EatingPoint } from "./types"

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SnackRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;

  & + & {
    padding-top: 12px;
    border-top: 1px dashed var(--border);
  }
`

const AddButton = styled(Button)`
  align-self: flex-start;
  color: var(--primary);
`

type Props = {
  snacks: EatingPoint[]
  onChange: (snacks: EatingPoint[]) => void
}

export function SnacksCard({ snacks, onChange }: Props) {
  const update = (index: number, value: EatingPoint) =>
    onChange(snacks.map((s, i) => (i === index ? value : s)))

  const remove = (index: number) => onChange(snacks.filter((_, i) => i !== index))

  const add = () => onChange([...snacks, { time: "", food: "" }])

  return (
    <PointCard emoji="🍪" title="היו עוד נשנושים בין לבין?">
      <List>
        {snacks.map((snack, index) => (
          <SnackRow key={index}>
            <EatingPointFields
              id={`snack-${index}`}
              value={snack}
              foodLabel="מה בערך?"
              onChange={(value) => update(index, value)}
            />
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="הסרת נשנוש"
                onClick={() => remove(index)}
              >
                <Trash2 className="text-muted-foreground" />
              </Button>
            )}
          </SnackRow>
        ))}
      </List>
      <AddButton variant="ghost" onClick={add}>
        <Plus />
        הוספת נשנוש נוסף
      </AddButton>
    </PointCard>
  )
}
