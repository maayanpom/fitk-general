import { ChevronDown } from "lucide-react"
import styled from "styled-components"

export const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`

const ConnectorWrap = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 36px;
  color: var(--border);

  &::before {
    content: "";
    flex: 1;
    width: 2px;
    background: var(--border);
  }

  svg {
    color: var(--muted-foreground);
    opacity: 0.6;
    margin-top: -4px;
  }
`

export function TimelineConnector() {
  return (
    <ConnectorWrap aria-hidden>
      <ChevronDown size={18} strokeWidth={2.5} />
    </ConnectorWrap>
  )
}
