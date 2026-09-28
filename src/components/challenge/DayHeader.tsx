import styled from "styled-components"
import { Eyebrow, PageTitle } from "@/components/layout/PageShell"

const Lead = styled.p`
  margin: 10px 0 0;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.55;
  color: var(--secondary-foreground);
`

type Props = {
  eyebrow: string
  title: string
  lead?: string
}

export function DayHeader({ eyebrow, title, lead }: Props) {
  return (
    <header>
      <Eyebrow>{eyebrow}</Eyebrow>
      <PageTitle>{title}</PageTitle>
      {lead && <Lead>{lead}</Lead>}
    </header>
  )
}
