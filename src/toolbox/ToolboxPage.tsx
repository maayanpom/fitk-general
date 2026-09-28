import { useState } from "react"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { DoneButton } from "@/components/challenge/DoneButton"
import { CommunityInvite, PersonalFeedbackButton } from "@/components/challenge/links"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import { PageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { useParticipant } from "@/data/participantContext"
import { useSavedTools } from "./useSavedTools"
import { SITUATIONS } from "./situations"
import { ToolCard } from "./ToolCard"
import { ToolDialog } from "./ToolDialog"
import { TOOLS, TOOLS_BY_ID, type Tool } from "./tools"

const Hero = styled.header`
  padding: 28px 20px;
  border-radius: calc(var(--radius) * 2);
  background: linear-gradient(160deg, oklch(0.94 0.05 70), oklch(0.9 0.06 40));
  text-align: center;

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
  }

  p {
    margin: 12px 0 0;
    font-size: 1.05rem;
    font-weight: 500;
    line-height: 1.6;
  }
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const SituationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`

const SituationButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 96px;
  padding: 12px;
  border-radius: calc(var(--radius) * 1.4);
  border: 2px solid ${({ $active }) => ($active ? "var(--primary)" : "var(--border)")};
  background: ${({ $active }) => ($active ? "var(--accent)" : "var(--card)")};
  color: var(--foreground);
  font: inherit;
  font-weight: 600;
  line-height: 1.35;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  span {
    font-size: 1.8rem;
  }

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
`

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`

const BoardTile = styled.button<{ $saved: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 6px 12px;
  border-radius: 18px;
  border: 1.5px solid ${({ $saved }) => ($saved ? "var(--primary)" : "transparent")};
  background: var(--card);
  box-shadow: 0 4px 14px -10px oklch(0.4 0.05 50 / 0.35);
  color: var(--foreground);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
  cursor: pointer;

  .emoji {
    font-size: 1.9rem;
  }

  .star {
    position: absolute;
    top: 6px;
    inset-inline-end: 8px;
    font-size: 0.8rem;
  }

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
`

const MyTools = styled(Section)`
  padding: 20px 16px;
  border-radius: calc(var(--radius) * 1.6);
  background: var(--secondary);
`

const Finale = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 26px 20px;
  border-radius: calc(var(--radius) * 1.8);
  background: var(--card);
  border: 1.5px solid var(--primary);
  text-align: center;

  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 800;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
`

export default function ToolboxPage() {
  const { participant, syncState } = useParticipant()
  const { selected } = useSavedTools()
  const { isCompleted, complete, resultRef } = useCompletion("toolbox")
  const [situationId, setSituationId] = useState<string | null>(null)
  const [openTool, setOpenTool] = useState<Tool | null>(null)

  const situation = SITUATIONS.find((s) => s.id === situationId)
  const savedTools = TOOLS.filter((t) => selected.includes(t.id))

  return (
    <PageShell>
      <PageInner>
        <Hero>
          <h1>אין זמן? יש פתרון.</h1>
          <p>לא צריך יום מושלם. צריך כמה פתרונות זמינים שאפשר לשלוף ברגע האמת.</p>
        </Hero>

        <Section>
          <SectionTitle>איזה יום עמוס יש לך?</SectionTitle>
          <SituationGrid>
            {SITUATIONS.map((s) => (
              <SituationButton
                key={s.id}
                type="button"
                aria-pressed={s.id === situationId}
                $active={s.id === situationId}
                onClick={() => setSituationId(s.id === situationId ? null : s.id)}
              >
                <span aria-hidden>{s.emoji}</span>
                {s.label}
              </SituationButton>
            ))}
          </SituationGrid>
          {situation && (
            <CardList>
              <Subtle>הכלים שיכולים לעזור לך ביום כזה:</Subtle>
              {situation.toolIds.map((id) => (
                <ToolCard key={id} tool={TOOLS_BY_ID[id]} onOpen={setOpenTool} />
              ))}
            </CardList>
          )}
        </Section>

        <Section>
          <div>
            <SectionTitle>לוח הכלים</SectionTitle>
            <Subtle>כל הכלים במקום אחד. לחיצה על כלי פותחת את ההסבר.</Subtle>
          </div>
          <Board>
            {TOOLS.map((tool) => {
              const saved = selected.includes(tool.id)
              return (
                <BoardTile
                  key={tool.id}
                  type="button"
                  $saved={saved}
                  onClick={() => setOpenTool(tool)}
                >
                  {saved && (
                    <span className="star" aria-label="נשמר">
                      ⭐
                    </span>
                  )}
                  <span className="emoji" aria-hidden>
                    {tool.emoji}
                  </span>
                  {tool.name}
                </BoardTile>
              )
            })}
          </Board>
        </Section>

        <MyTools>
          <SectionTitle>⭐ הכלים שבחרתי לעצמי</SectionTitle>
          {savedTools.length === 0 ? (
            <Subtle>
              עוד לא בחרת כלים. לחצו על "שומר/ת לעצמי" בכלים שמתאימים לחיים שלכם – מספיקים 2–4.
            </Subtle>
          ) : (
            <CardList>
              {savedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={setOpenTool} />
              ))}
            </CardList>
          )}
        </MyTools>

        <DoneButton onClick={() => void complete()}>סיימתי ✓</DoneButton>

        <ResultArea ref={resultRef}>
          {isCompleted && syncState === "error" && <CompletionMessage />}
          {isCompleted && syncState !== "error" && (
            <>
              <Finale>
                <h2>🎉 כל הכבוד, סיימתם!</h2>
                <p>
                  <strong>כל התשובות שמילאתם במהלך האתגר נשלחו אליי.</strong>
                </p>
                <p>אם תרצו לקבל ממני פידבק אישי על מה שכתבתם – מוזמנים לפנות אליי בפרטי.</p>
                <PersonalFeedbackButton firstName={participant.firstName} />
              </Finale>
              <CommunityInvite />
            </>
          )}
        </ResultArea>

        <PageFooter />
      </PageInner>

      <ToolDialog tool={openTool} onClose={() => setOpenTool(null)} />
    </PageShell>
  )
}
