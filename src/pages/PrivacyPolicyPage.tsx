import { useEffect } from "react"
import styled from "styled-components"
import { PageInner, PageShell, PageTitle, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { COACH_EMAIL, COACH_NAME } from "@/config"

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Body = styled.p`
  margin: 0;
  line-height: 1.75;
  color: var(--secondary-foreground);

  a {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`

const Disclaimer = styled.section`
  padding: 16px;
  border-radius: calc(var(--radius) * 1.4);
  background: var(--secondary);

  h2 {
    margin: 0 0 6px;
  }

  p {
    margin: 0;
    line-height: 1.7;
  }
`

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'מדיניות פרטיות – אתגר "3 ימים חוזרים לשגרה"'
  }, [])

  return (
    <PageShell>
      <PageInner>
        <header>
          <PageTitle>מדיניות פרטיות</PageTitle>
          <Subtle>אתגר "3 ימים חוזרים לשגרה"</Subtle>
        </header>

        <Section>
          <SectionTitle>מי אנחנו</SectionTitle>
          <Body>
            האתגר מנוהל על ידי {COACH_NAME}. ליצירת קשר:{" "}
            <a href={`mailto:${COACH_EMAIL}`}>{COACH_EMAIL}</a>.
          </Body>
        </Section>

        <Section>
          <SectionTitle>איזה מידע נאסף</SectionTitle>
          <Body>
            שם מלא, טלפון ומייל (בטופס במודעה), ותשובות שתמלאו בדפי האתגר על שגרת האכילה והיום
            שלכם. אנא אל תכתבו מידע רפואי. האתגר מיועד לגילאי 18 ומעלה.
          </Body>
        </Section>

        <Section>
          <SectionTitle>למה</SectionTitle>
          <Body>
            ליצירת קשר לגבי האתגר, לרישום חינמי לאתר HoldOn (רק לפי אישורכם המפורש), להכנת סיכום
            אישי ולהזמנה לקהילה.
          </Body>
        </Section>

        <Section>
          <SectionTitle>עם מי משתפים</SectionTitle>
          <Body>
            HoldOn (שם, טלפון ומייל, רק לאחר אישורכם), Supabase (שירות אחסון הנתונים, שרתים
            ב-ap-southeast-2), Meta (איסוף הטופס) ו-WhatsApp (תקשורת). לא מוכרים מידע.
          </Body>
        </Section>

        <Section>
          <SectionTitle>כמה זמן שומרים</SectionTitle>
          <Body>
            עד 3 חודשים מסיום הפעילות שלכם באתגר, או עד בקשת מחיקה.
          </Body>
        </Section>

        <Section>
          <SectionTitle>הזכויות שלכם</SectionTitle>
          <Body>
            לעיין, לתקן, למחוק ולבטל הסכמה בכל עת, בפנייה ל-
            <a href={`mailto:${COACH_EMAIL}`}>{COACH_EMAIL}</a>.
          </Body>
        </Section>

        <Disclaimer>
          <h2>חשוב</h2>
          <p>האתגר הוא תוכן חינוכי ואינו ייעוץ רפואי או תזונתי.</p>
        </Disclaimer>
      </PageInner>
    </PageShell>
  )
}
