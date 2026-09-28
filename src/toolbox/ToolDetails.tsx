import { Check } from "lucide-react"
import styled from "styled-components"
import { useParticipant } from "@/data/participantContext"
import type { Tool, ToolBlock } from "./tools"

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 1rem;
  line-height: 1.65;

  p {
    margin: 0;
  }

  ul,
  ol {
    margin: 0;
    padding-inline-start: 22px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  ul {
    list-style: disc;
  }

  ol {
    list-style: decimal;
  }

  li::marker {
    color: var(--primary);
  }
`

const Strong = styled.p`
  font-weight: 700;
`

const Quote = styled.p`
  padding: 8px 14px;
  border-inline-start: 3px solid var(--primary);
  background: var(--secondary);
  border-radius: 8px;
  font-weight: 500;
`

const ListTitle = styled.p`
  font-weight: 600;
`

const ChoiceGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
`

const ChoiceLabel = styled.p`
  font-weight: 700;
  color: var(--primary);
`

const Choice = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid ${({ $active }) => ($active ? "var(--primary)" : "var(--border)")};
  background: ${({ $active }) => ($active ? "var(--accent)" : "var(--card)")};
  color: var(--foreground);
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
`

const Mark = styled.span<{ $active: boolean; $round?: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: ${({ $round }) => ($round ? "999px" : "6px")};
  border: 2px solid ${({ $active }) => ($active ? "var(--primary)" : "var(--input)")};
  background: ${({ $active }) => ($active ? "var(--primary)" : "transparent")};
  color: var(--primary-foreground);
`

function Block({ block }: { block: ToolBlock }) {
  const { participant, updateSection } = useParticipant()
  const toolbox = participant.toolbox

  switch (block.type) {
    case "text":
      return <p>{block.text}</p>
    case "strong":
      return <Strong>{block.text}</Strong>
    case "quote":
      return <Quote>{block.text}</Quote>
    case "list":
      return (
        <div>
          {block.title && <ListTitle>{block.title}</ListTitle>}
          <ul>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )
    case "steps":
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )
    case "pick":
      return (
        <ChoiceGroup role="radiogroup" aria-label={block.label}>
          <ChoiceLabel>{block.label}</ChoiceLabel>
          {block.items.map((item) => {
            const active = toolbox[block.field] === item
            return (
              <Choice
                key={item}
                type="button"
                role="radio"
                aria-checked={active}
                $active={active}
                onClick={() => updateSection("toolbox", { [block.field]: active ? "" : item })}
              >
                <Mark $active={active} $round>
                  {active && <Check size={12} strokeWidth={3} />}
                </Mark>
                {item}
              </Choice>
            )
          })}
        </ChoiceGroup>
      )
    case "checklist": {
      const checked = toolbox[block.field]
      return (
        <ChoiceGroup>
          <ChoiceLabel>{block.label}</ChoiceLabel>
          {block.items.map((item) => {
            const active = checked.includes(item)
            return (
              <Choice
                key={item}
                type="button"
                role="checkbox"
                aria-checked={active}
                $active={active}
                onClick={() =>
                  updateSection("toolbox", {
                    [block.field]: active ? checked.filter((i) => i !== item) : [...checked, item],
                  })
                }
              >
                <Mark $active={active}>{active && <Check size={12} strokeWidth={3} />}</Mark>
                {item}
              </Choice>
            )
          })}
        </ChoiceGroup>
      )
    }
  }
}

export function ToolDetails({ tool }: { tool: Tool }) {
  return (
    <Body>
      {tool.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </Body>
  )
}
