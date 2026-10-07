import { useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { ChoiceGroup, ChoicePill } from "@/components/challenge/ChoicePill"
import { DoneButton, DoneHint } from "@/components/challenge/DoneButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CommunityInvite } from "@/components/challenge/links"
import { PageFooter } from "@/components/challenge/PageFooter"
import { ResultArea } from "@/components/challenge/ResultArea"
import { useCompletion } from "@/components/challenge/useCompletion"
import toolboxImage from "@/assets/toolbox.webp"
import { HeroImage } from "@/components/challenge/HeroImage"
import { PageInner as BasePageInner, PageShell, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { useParticipant } from "@/data/participantContext"
import { useCoachPublicInfo } from "@/data/useCoachPublicInfo"
import { MAX_TOOLS, MIN_TOOLS, TOOLS_LIMIT_EVENT, useSavedTools } from "./useSavedTools"
import { ToolCard } from "./ToolCard"
import { ToolDialog } from "./ToolDialog"
import { TOOLS, TOOLS_BY_ID, type Tool } from "./tools"
import { computeTiers, type ProductId, type ScoredTool } from "./matching"

// Wider than the day pages, so the tool board fits in fewer rows on tablets and desktops.
const PageInner = styled(BasePageInner)`
  @media (min-width: 640px) {
    max-width: 720px;
  }
`

const HeroText = styled.p`
  margin: 14px 0 0;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.7;
  color: var(--secondary-foreground);
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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

const Note = styled.p`
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: center;
`

const Transparency = styled.p`
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.8rem;
  line-height: 1.5;
  text-align: center;
`

export default function ToolboxPage() {
  const { participant, syncState, updateSection } = useParticipant()
  const coach = useCoachPublicInfo(participant.coachSlug)
  const { selected } = useSavedTools()
  const { isCompleted, complete, resultRef } = useCompletion("toolbox")
  const [openTool, setOpenTool] = useState<Tool | null>(null)
  const [limitHit, setLimitHit] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const onLimit = () => setLimitHit(true)
    window.addEventListener(TOOLS_LIMIT_EVENT, onLimit)
    return () => window.removeEventListener(TOOLS_LIMIT_EVENT, onLimit)
  }, [])
  useEffect(() => {
    if (selected.length < MAX_TOOLS) setLimitHit(false)
  }, [selected.length])

  const savedTools = TOOLS.filter((t) => selected.includes(t.id))
  const countOk = selected.length >= MIN_TOOLS && selected.length <= MAX_TOOLS
  const tiers = useMemo(() => computeTiers(participant), [participant])
  const toolOf = (id: string) => TOOLS_BY_ID[id]
  const renderCard = (t: ScoredTool, because = false) => (
    <ToolCard
      key={t.id}
      tool={toolOf(t.id)}
      onOpen={setOpenTool}
      framed={tiers.framedProducts.includes(t.id as ProductId)}
      because={because ? t.because : undefined}
    />
  )

  const anchor = participant.toolbox.anchorTool
  const anchorValid = anchor === "unsure" || selected.includes(anchor)
  const showAnchor = (saved || Boolean(anchor)) && countOk

  return (
    <PageShell>
      <PageInner>
        <div>
          <HeroImage image={toolboxImage} badge="🧰" title="אין זמן? יש פתרון." />
          <HeroText>
            לפי מה ששיתפתם בשלושת הימים, ליקטתי לכם את הכלים שהכי קרובים למה שסיפרתם.
          </HeroText>
          <HeroText>
            לא צריך הכול. בחרו 2 עד 4 כלים שאתם באמת רואים את עצמכם משתמשים בהם בשבוע הקרוב.
          </HeroText>
        </div>

        {tiers.closest.length > 0 && (
          <Section>
            <SectionTitle>⭐ הכי קרוב למה ששיתפתם</SectionTitle>
            <CardList>{tiers.closest.map((t) => renderCard(t, true))}</CardList>
          </Section>
        )}

        {tiers.maybe.length > 0 && (
          <Section>
            <SectionTitle>💡 יכולים גם להתאים</SectionTitle>
            <CardList>{tiers.maybe.map((t) => renderCard(t))}</CardList>
          </Section>
        )}

        <Section>
          <SectionTitle>עוד רעיונות</SectionTitle>
          {showMore ? (
            <CardList>{tiers.more.map((t) => renderCard(t))}</CardList>
          ) : (
            <Button type="button" variant="outline" onClick={() => setShowMore(true)}>
              להציג עוד רעיונות
            </Button>
          )}
          {!tiers.hideProducts && (
            <Transparency>
              ווייק-שייק ומיי-שיא הם מוצרים של HoldOn, שאני משווקת. אני מציגה אותם רק כשהם
              מתאימים למה ששיתפתם.
            </Transparency>
          )}
        </Section>

        <MyTools>
          <SectionTitle>⭐ הכלים שבחרתי לעצמי</SectionTitle>
          <Subtle>בחרו 2-4 כלים שאתם באמת רוצים לנסות בשבוע הקרוב.</Subtle>
          {savedTools.length === 0 ? (
            <Subtle>עוד לא נבחרו כלים.</Subtle>
          ) : (
            <CardList>
              {savedTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onOpen={setOpenTool}
                  framed={tiers.framedProducts.includes(tool.id as ProductId)}
                />
              ))}
            </CardList>
          )}
          {limitHit && <Note>אפשר לבחור עד 4 כלים. כדי לבחור כלי אחר, אפשר להסיר אחד קודם.</Note>}
        </MyTools>

        <Note>
          אלה לא דברים שצריך לעשות מושלם. המטרה היא למצוא כמה פתרונות קטנים שעובדים בשבילכם בחיים
          האמיתיים ❤️
        </Note>

        {!showAnchor && (
          <>
            <DoneButton disabled={!countOk} onClick={() => setSaved(true)}>
              שמירה לעצמי
            </DoneButton>
            {!countOk && (
              <DoneHint>
                {selected.length < MIN_TOOLS ? "בחרו לפחות 2 כלים כדי לשמור" : "אפשר לשמור עד 4 כלים"}
              </DoneHint>
            )}
          </>
        )}

        {showAnchor && (
          <MyTools>
            <SectionTitle>
              מתוך הכלים שבחרתם, איזה מהם הכי הייתם רוצים שבאמת יעבוד לכם השבוע?
            </SectionTitle>
            <ChoiceGroup
              value={anchorValid ? anchor : ""}
              onValueChange={(v) => updateSection("toolbox", { anchorTool: v })}
              aria-label="הכלי שהכי הייתם רוצים שיעבוד לכם השבוע"
            >
              {savedTools.map((t) => (
                <ChoicePill key={t.id} value={t.id}>
                  {`${t.emoji} ${t.name}`}
                </ChoicePill>
              ))}
              <ChoicePill value="unsure">עוד לא יודעים</ChoicePill>
            </ChoiceGroup>
            <Label htmlFor="anchor-note">מה הכי יעזור לכם שזה יקרה?</Label>
            <Input
              id="anchor-note"
              maxLength={100}
              placeholder="רשות"
              value={participant.toolbox.anchorNote}
              onChange={(e) => updateSection("toolbox", { anchorNote: e.target.value })}
            />
            <DoneButton disabled={!anchorValid || !anchor} onClick={() => void complete()}>
              סיימתי ✓
            </DoneButton>
            {(!anchorValid || !anchor) && <DoneHint>בחרו כלי אחד, או "עוד לא יודעים"</DoneHint>}
          </MyTools>
        )}

        <ResultArea ref={resultRef}>
          {isCompleted && syncState === "error" && <CompletionMessage />}
          {isCompleted && syncState !== "error" && (
            <>
              <Finale>
                <h2>מעולה ❤️</h2>
                <p>
                  עכשיו יש לנו את שלושת החלקים של התמונה: איך היום שלכם נראה, איך נראית ארוחה אחת,
                  ואיפה הכי קשה לכם ומה יכול להקל.
                </p>
                <p>אני אעבור על מה ששיתפתם ואחזור אליכם עם סיכום אישי.</p>
                <p>
                  התשובות נשארות אצלי, ומשמשות רק לסיכום האישי ולהצעה להמשך, אם תרצו.
                </p>
              </Finale>
              <CommunityInvite communityUrl={coach?.communityUrl} />
            </>
          )}
        </ResultArea>

        <PageFooter coachSlug={participant.coachSlug} />
      </PageInner>

      <ToolDialog tool={openTool} onClose={() => setOpenTool(null)} />
    </PageShell>
  )
}
