import { useState, type FormEvent } from "react"
import { Check, Copy } from "lucide-react"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  box-shadow: 0 6px 20px -14px oklch(0.3 0.06 300 / 0.35);
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

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const LinkPreview = styled.p`
  margin: 0;
  flex: 1;
  min-width: 0;
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

function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable - nothing else to do here.
    }
  }

  return (
    <Button type="button" size="icon-sm" variant="outline" onClick={() => void copy()}>
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

function friendlyError(err: unknown) {
  const code = err && typeof err === "object" && "code" in err ? String(err.code) : ""
  const message = err instanceof Error ? err.message : ""
  if (code === "23505" || message.includes("duplicate") || message.includes("unique")) {
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
  const [privacyUrl, setPrivacyUrl] = useState(coach.privacyUrl ?? "")
  const [couponText, setCouponText] = useState(coach.couponText ?? "")
  const [deliveryText, setDeliveryText] = useState(coach.summaryDeliveryText ?? "")
  const [longGap, setLongGap] = useState(String(coach.longGapHours))
  const [requireHoldon, setRequireHoldon] = useState(coach.requireHoldonConsent)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      if (slug.trim() !== coach.slug && (await isSlugTaken(slug))) {
        setError("הקישור הזה כבר תפוס. נסו קישור אחר.")
        return
      }
      const gap = Math.max(1, Math.min(24, Math.round(Number(longGap)) || 5))
      await updateOwnCoach(coach.id, {
        name,
        phone,
        communityUrl,
        slug,
        privacyUrl,
        couponText,
        summaryDeliveryText: deliveryText,
        longGapHours: gap,
        requireHoldonConsent: requireHoldon,
      })
      onSaved({
        ...coach,
        name,
        phone,
        communityUrl: communityUrl.trim() || null,
        slug,
        privacyUrl: privacyUrl.trim() || null,
        couponText: couponText.trim() || null,
        summaryDeliveryText: deliveryText.trim() || null,
        longGapHours: gap,
        requireHoldonConsent: requireHoldon,
      })
      setLongGap(String(gap))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error("Failed to update coach settings", err)
      setError(friendlyError(err))
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
        <LinkRow>
          <LinkPreview>{window.location.origin}/{slug}/register</LinkPreview>
          <CopyLinkButton link={`${window.location.origin}/${slug}/register`} />
        </LinkRow>
      </Field>

      <Field>
        <Label htmlFor="settings-privacy">קישור למדיניות פרטיות (אופציונלי)</Label>
        <Input
          id="settings-privacy"
          type="url"
          dir="ltr"
          value={privacyUrl}
          onChange={(e) => setPrivacyUrl(e.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor="settings-coupon">נוסח קופון האתגר</Label>
        <Input
          id="settings-coupon"
          value={couponText}
          onChange={(e) => setCouponText(e.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor="settings-delivery">נוסח מסירת הסיכום</Label>
        <Input
          id="settings-delivery"
          value={deliveryText}
          onChange={(e) => setDeliveryText(e.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor="settings-gap">פער ארוך בין ארוחות (שעות)</Label>
        <Input
          id="settings-gap"
          type="number"
          min={1}
          max={24}
          dir="ltr"
          value={longGap}
          onChange={(e) => setLongGap(e.target.value)}
        />
      </Field>

      <label className="flex items-start gap-2">
        <Checkbox
          className="mt-1"
          checked={requireHoldon}
          onCheckedChange={(v) => setRequireHoldon(v === true)}
        />
        <span>לדרוש הסכמה להעברת פרטים ל-HoldOn</span>
      </label>

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
