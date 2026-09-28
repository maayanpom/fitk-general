# Onboarding a new coach

This is a single multi-tenant deployment now — one Vercel project, one
Supabase project, shared by every coach. Each coach's data (participants,
leads, settings) is kept fully separate by the database's row-level security
policies (see `supabase/coaches.sql`), not by separate infrastructure.

A new coach signs herself up, with no Vercel/Supabase/GitHub access needed:

1. Send her the sign-up link: `https://<your-domain>/coach-signup`.
2. She fills in her name, email, password and WhatsApp number.
3. She immediately gets her own public registration link
   (`https://<your-domain>/{her-slug}/register`) and her own `/admin`
   dashboard, scoped to only her own participants and leads.
4. She can adjust her WhatsApp number, community link, or her registration
   link's slug any time from the "הגדרות" tab in her dashboard.

The platform owner (super admin) has one extra tab in `/admin` — "מאמנות
במערכת" — a read-only list of every registered coach (name, email, phone,
their link, join date) for support purposes, such as resending a lost link.
It never shows any coach's participants or leads.

## Older, single-tenant approach (superseded)

Earlier in this project, before self-signup existed, each new coach needed
her own separate Vercel project and Supabase project, deployed from this same
codebase with her own environment variables. That approach still works as a
fallback (e.g. if a coach ever needs to be fully isolated on her own
infrastructure), but is no longer the normal path - self-signup above is.
