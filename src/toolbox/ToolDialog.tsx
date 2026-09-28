import styled from "styled-components"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SaveToolButton } from "./SaveToolButton"
import { ToolDetails } from "./ToolDetails"
import type { Tool } from "./tools"

const BigIcon = styled.span`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 4px;
  border-radius: 24px;
  background: var(--secondary);
  font-size: 2.4rem;
`

const Name = styled.span`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary);
  text-align: center;
`

type Props = {
  tool: Tool | null
  onClose: () => void
}

export function ToolDialog({ tool, onClose }: Props) {
  return (
    <Dialog open={Boolean(tool)} onOpenChange={(open) => !open && onClose()}>
      {tool && (
        <DialogContent
          dir="rtl"
          className="max-h-[88dvh] gap-5 overflow-y-auto rounded-3xl p-6 sm:max-w-md"
        >
          <DialogHeader>
            <BigIcon aria-hidden>{tool.emoji}</BigIcon>
            <Name>{tool.name}</Name>
            <DialogTitle className="text-center text-xl leading-snug font-bold">
              {tool.heading}
            </DialogTitle>
            <DialogDescription className="sr-only">{tool.summary}</DialogDescription>
          </DialogHeader>
          <ToolDetails tool={tool} />
          <SaveToolButton toolId={tool.id} className="h-11 w-full" />
        </DialogContent>
      )}
    </Dialog>
  )
}
