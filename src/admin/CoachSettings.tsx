import { useState, type FormEvent } from "react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isSlugTaken, updateOwnCoach, type Coach } from "@/data/coach"

const Card = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 16px;
  border-radius: 16px;
  background: var(--card);
  box-shadow: 0 6px 20px -14px oklch(0.4 0.05 50 / 0.35);
  max-width: 420px;

  label {
    font-weight: 600;
    font-size: 0.9rem;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  input {
    height: 42px;
  }
`

const LinkPreview = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted-foreground);
  direction: ltr;
  text-align: right;
  word-break: break-all;
`

const ErrorText = styled.p`
  margin: 0;
  color: var(--destructive);
  font-size: 0.9rem;
`

const SavedText = styled.span`
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
`

function friendlyError(message: string) {
  if (message.includes("duplicate") || message.includes("unique")) {
    return "הקישור הזה כבר תפוס. נסו קישור אחר."
  }
  return "השמירה נכשלה. נסו שוב."
}

export function CoachSettings({
  coach,
  onSaved,
}: {
  coach: Coach
  onSaved: (coach: Coach) => void
}) {
  const [name, setName] = useState(coach.name)
  const [phone, setPhone] = useState(coach.phone)
  const [communityUrl, setCommunityUrl] = useState(coach.communityUrl ?? "")
  const [slug, setSlug] = useState(coach.slug)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      if (slug.trim() !== coach.slug && (await isSlugTaken(slug, coach.id))) {
        setError("הקישור הזה כבר תפוס. נסו קישור אחר.")
        return
      }
      await updateOwnCoach(coach.id, { name, phone, communityUrl, slug })
      onSaved({ ...coach, name, phone, communityUrl: communityUrl.trim() || null, slug })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error("Failed to update coach settings", err)
      setError(friendlyError(err instanceof Error ? err.message : ""))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card onSubmit={(e) => void submit(e)}>
      <Field>
        <Label htmlFor="settings-name">שם (יוצג למשתתפים)</Label>
        <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field>
        <Label htmlFor="settings-phone">טלפון (וואטסאפ)</Label>
        <Input
          id="settings-phone"
          type="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor="settings-community">קישור לקהילה (אופציונלי)</Label>
        <Input
          id="settings-community"
          type="url"
          dir="ltr"
          placeholder="https://chat.whatsapp.com/..."
          value={communityUrl}
          onChange={(e) => setCommunityUrl(e.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor="settings-slug">קישור ציבורי להרשמה</Label>
        <Input
          id="settings-slug"
          dir="ltr"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <LinkPreview>{window.location.origin}/{slug}/register</LinkPreview>
      </Field>

      {error && <ErrorText>{error}</ErrorText>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving || !name.trim() || !phone.trim() || !slug.trim()}>
          שמירה
        </Button>
        {saved && <SavedText>נשמר ✓</SavedText>}
      </div>
    </Card>
  )
}
