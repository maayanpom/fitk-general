import styled from "styled-components"
import { SaveToolButton } from "./SaveToolButton"
import type { Tool } from "./tools"

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--card);
  box-shadow: 0 1px 2px oklch(0.4 0.05 50 / 0.06), 0 6px 18px -10px oklch(0.4 0.05 50 / 0.18);
`

const Open = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 4px;
    border-radius: 8px;
  }
`

const Icon = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--secondary);
  font-size: 1.8rem;
`

const Text = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 1.05rem;
  }

  span {
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const More = styled.button`
  padding: 0;
  border: 0;
  background: none;
  color: var(--primary);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
`

type Props = {
  tool: Tool
  onOpen: (tool: Tool) => void
}

export function ToolCard({ tool, onOpen }: Props) {
  return (
    <Card>
      <Open type="button" onClick={() => onOpen(tool)}>
        <Icon aria-hidden>{tool.emoji}</Icon>
        <Text>
          <strong>{tool.name}</strong>
          <span>{tool.summary}</span>
        </Text>
      </Open>
      <Actions>
        <SaveToolButton toolId={tool.id} />
        <More type="button" onClick={() => onOpen(tool)}>
          לכל הפרטים
        </More>
      </Actions>
    </Card>
  )
}
