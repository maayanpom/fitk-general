import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import styled from "styled-components"

const Details = styled.details`
  border-radius: calc(var(--radius) * 1.4);
  border: 1.5px solid var(--border);
  background: var(--card);

  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 52px;
    padding: 12px 16px;
    font-weight: 700;
    color: var(--deep);
    cursor: pointer;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
    border-radius: calc(var(--radius) * 1.4);
  }

  svg {
    transition: transform 0.2s;
  }

  &[open] svg {
    transform: rotate(180deg);
  }

  .body {
    padding: 0 16px 16px;
    line-height: 1.7;
  }

  @media (prefers-reduced-motion: reduce) {
    svg {
      transition: none;
    }
  }
`

export function WhyItMatters({
  title = "למה זה חשוב",
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <Details>
      <summary>
        {title}
        <ChevronDown size={20} aria-hidden />
      </summary>
      <div className="body">{children}</div>
    </Details>
  )
}
