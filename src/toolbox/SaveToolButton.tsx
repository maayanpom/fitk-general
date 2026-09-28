import { Star } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { useSavedTools } from "./useSavedTools"

const StarButton = styled(Button)<{ $saved: boolean }>`
  border-radius: 999px;
  font-weight: 600;

  svg {
    fill: ${({ $saved }) => ($saved ? "currentColor" : "none")};
  }
`

export function SaveToolButton({ toolId, className }: { toolId: string; className?: string }) {
  const { isSaved, toggle } = useSavedTools()
  const saved = isSaved(toolId)

  return (
    <StarButton
      type="button"
      size="sm"
      variant={saved ? "default" : "outline"}
      aria-pressed={saved}
      $saved={saved}
      className={className}
      onClick={(e) => {
        e.stopPropagation()
        toggle(toolId)
      }}
    >
      <Star />
      {saved ? "נשמר אצלי" : "שמירה לעצמי"}
    </StarButton>
  )
}
