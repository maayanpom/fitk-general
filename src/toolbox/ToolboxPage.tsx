import { useEffect, useState } from "react"
import styled from "styled-components"
import { CompletionMessage } from "@/components/challenge/CompletionMessage"
import { DoneButton, DoneHint } from "@/components/challenge/DoneButton"
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
import { TOOLS, type Tool } from "./tools"

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
  const { participant, syncState } = useParticipant()
  const coach = useCoachPublicInfo(participant.coachSlug)
  const { selected } = useSavedTools()
  const { isCompleted, complete, resultRef } = useCompletion("toolbox")
  const [openTool, setOpenTool] = useState<Tool | null>(null)
  const [limitHit, setLimitHit] = useState(false)

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

  return (
    <PageShell>
      <PageInner>
        <div>
          <HeroImage image={toolboxImage} badge="🧰" title="אין זמן? יש פתרון." />
          <HeroText>
            בשלושת הימים האחרונים גילינו איפה השגרה שלך פחות פשוטה. עכשיו הגיע הזמן לבחור כמה כלים
            שיכולים לעזור לך בדיוק ברגעים האלה.
          </HeroText>
          <HeroText>
            לא צריך לבחור הכל. בחר/י 2 עד 4 כלים שאת/ה באמת יכול/ה לראות את עצמך משתמש/ת בהם
            בשבוע הקרוב.
          </HeroText>
        </div>

        <Section>
          <CardList>
            {TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onOpen={setOpenTool} />
            ))}
          </CardList>
          <Transparency>ווייק-שייק ומיי-שיא הם מוצרי HoldOn שאני משווקת.</Transparency>
        </Section>

        <MyTools>
          <SectionTitle>⭐ הכלים שבחרתי לעצמי</SectionTitle>
          <Subtle>בחר/י 2-4 כלים שאת/ה באמת רוצה לנסות בשבוע הקרוב.</Subtle>
          {savedTools.length === 0 ? (
            <Subtle>עוד לא נבחרו כלים.</Subtle>
          ) : (
            <CardList>
              {savedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={setOpenTool} />
              ))}
            </CardList>
          )}
          {limitHit && <Note>אפשר לבחור עד 4 כלים. כדי לבחור כלי אחר, אפשר להסיר אחד קודם.</Note>}
        </MyTools>

        <Note>
          אלה לא דברים שצריך לעשות מושלם. המטרה היא למצוא כמה פתרונות קטנים שעובדים בשבילך בחיים
          האמיתיים ❤️
        </Note>

        <DoneButton disabled={!countOk} onClick={() => void complete()}>
          שמירה לעצמי
        </DoneButton>
        {!countOk && (
          <DoneHint>
            {selected.length < MIN_TOOLS ? "בחר/י לפחות 2 כלים כדי לשמור" : "אפשר לשמור עד 4 כלים"}
          </DoneHint>
        )}

        <ResultArea ref={resultRef}>
          {isCompleted && syncState === "error" && <CompletionMessage />}
          {isCompleted && syncState !== "error" && (
            <>
              <Finale>
                <h2>מעולה ❤️</h2>
                <p>
                  עכשיו יש לנו את שלושת החלקים של התמונה: איך היום שלך נראה, איך נראית ארוחה אחת,
                  ואיפה הכי קשה לך ומה יכול להקל.
                </p>
                <p>אני אעבור על מה ששיתפת ואחזור אליך עם סיכום אישי וכלים שמתאימים לך.</p>
                <p>
                  התשובות שלך נשארות אצלי, ומשמשות רק לסיכום האישי שלך ולהצעה להמשך, אם תרצה.
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
