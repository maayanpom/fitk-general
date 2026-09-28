import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import { PageInner, PageShell, PageTitle, SectionTitle, Subtle } from "@/components/layout/PageShell"
import { getCoachPublicBySlug, type CoachPublicInfo } from "@/data/coach"

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

const Center = styled(PageInner)`
  min-height: calc(100dvh - 64px);
  justify-content: center;
  text-align: center;
`

// Shown at the slug-less /privacy-policy route, so there's always one stable
// URL that's reachable without a specific coach's link (e.g. for ad-platform
// review) - attributed to the platform owner rather than a specific coach.
//
// public/privacy-policy.html is a hand-written static copy of this same
// generic content, served directly (bypassing this React page) so the
// content is visible to crawlers that don't run JavaScript - see vercel.json.
// Keep both in sync when editing the policy text.
const PLATFORM_OWNER: CoachPublicInfo = {
  name: "מעיין פאר",
  email: "maayanpom@gmail.com",
  phone: "",
  communityUrl: null,
  slug: "",
}

export default function PrivacyPolicyPage() {
  const { slug } = useParams<{ slug: string }>()
  const [coach, setCoach] = useState<CoachPublicInfo | null | undefined>(
    slug ? undefined : PLATFORM_OWNER,
  )

  useEffect(() => {
    if (!slug) {
      setCoach(PLATFORM_OWNER)
      return
    }
    let cancelled = false
    getCoachPublicBySlug(slug)
      .then((data) => {
        if (!cancelled) setCoach(data)
      })
      .catch(() => {
        if (!cancelled) setCoach(null)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    document.title = 'מדיניות פרטיות – אתגר "3 ימים חוזרים לשגרה"'
  }, [])

  if (coach === undefined) {
    return (
      <PageShell>
        <Center>
          <Subtle>טוען...</Subtle>
        </Center>
      </PageShell>
    )
  }

  if (coach === null) {
    return (
      <PageShell>
        <Center>
          <PageTitle as="h1">הקישור אינו תקין</PageTitle>
          <Subtle>ייתכן שהקישור הועתק בטעות.</Subtle>
        </Center>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageInner>
        <header>
          <PageTitle>מדיניות פרטיות</PageTitle>
          <Subtle>אתגר "3 ימים חוזרים לשגרה"</Subtle>
        </header>

        <Section>
          <SectionTitle>מי אנחנו</SectionTitle>
          {slug ? (
            <Body>
              האתגר מנוהל על ידי {coach.name}. ליצירת קשר:{" "}
              <a href={`mailto:${coach.email}`}>{coach.email}</a>.
            </Body>
          ) : (
            <Body>
              האתגר מופעל על ידי מספר מאמנות ומאמנים באמצעות פלטפורמה משותפת. המאמן/ת ששלח/ה לכם
              את הקישור לאתגר הוא/היא איש/אשת הקשר שלכם לגבי השתתפותכם. הפלטפורמה, בבעלות{" "}
              {coach.name} (<a href={`mailto:${coach.email}`}>{coach.email}</a>), מארחת ומעבדת את
              הנתונים עבור כלל המאמנות/ים.
            </Body>
          )}
        </Section>

        <Section>
          <SectionTitle>איזה מידע נאסף</SectionTitle>
          <Body>
            שם מלא, טלפון ומייל (בטופס ההרשמה, במודעה או באתר), ותשובות שתמלאו בדפי האתגר על שגרת
            האכילה והיום שלכם. אנא אל תכתבו מידע רפואי. האתגר מיועד לגילאי 18 ומעלה.
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
            ב-ap-southeast-2), Vercel (מארחת את האתר, וכחלק מכך רואה את כתובת ה-IP שלכם), Meta
            (איסוף הטופס) ו-WhatsApp (תקשורת). לא מוכרים מידע.
          </Body>
        </Section>

        <Section>
          <SectionTitle>כמה זמן שומרים</SectionTitle>
          <Body>עד 3 חודשים מסיום הפעילות שלכם באתגר, או עד בקשת מחיקה.</Body>
        </Section>

        <Section>
          <SectionTitle>הזכויות שלכם</SectionTitle>
          <Body>
            לעיין, לתקן, למחוק ולבטל הסכמה בכל עת, בפנייה ל-
            <a href={`mailto:${coach.email}`}>{coach.email}</a>.
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
