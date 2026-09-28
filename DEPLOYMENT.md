# Setting up a new trainer/coach

This codebase is single-tenant: one deployment = one coach, with their own
participants, their own admin login, and their own settings. To onboard a
new coach, you create a *new* Vercel project and a *new* Supabase project
from this same code — you do not add them into the existing one.

Why separate, not shared: the admin dashboard shows *every* participant to
*every* admin listed in the `admins` table - there's no per-coach filtering
built in. Sharing one Supabase project between two coaches would mean each
one sees the other's participants and leads. Separate projects keep that
data fully apart with zero extra code.

## Checklist per new coach

1. **New Vercel project**, same repo.
   Vercel dashboard → Add New → Project → import this same GitHub repo again
   → give it its own name (e.g. `fitk-dana`). It gets its own URL
   automatically (`fitk-dana.vercel.app`), or attach a custom domain later
   under that project's Domains tab.

2. **New Supabase project** for this coach.
   In its SQL Editor, run these files from this repo, in order:
   - `supabase/schema.sql`
   - `supabase/registrations.sql`
   - `supabase/registration_links.sql`
   - `supabase/retention.sql`
   Then create the coach's login (Authentication → Users → Add user) and run:
   ```sql
   insert into public.admins (email) values ('coach-email@example.com');
   ```

3. **Environment variables**, on the new Vercel project (Settings →
   Environment Variables) - not in the code:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — from step 2's project
   - `VITE_WHATSAPP_PHONE` — this coach's number
   - `VITE_COMMUNITY_URL` — this coach's community link
   - `VITE_COACH_NAME`, `VITE_COACH_EMAIL` — shown on the privacy policy

4. **Deploy.** Done - this coach now has their own live site, own database,
   own admin login, fully separate from every other coach.

## Updating the code later

Every coach's Vercel project watches the same GitHub branch, so a single
`git push` redeploys all of them at once, each still using its own env vars
and its own data. You never need to repeat a code change per coach.
