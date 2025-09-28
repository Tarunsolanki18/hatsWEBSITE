# Setup Guide (Free Stack with Supabase)

- Auth, DB, Storage: Supabase free tier
- Hosting: GitHub Pages/Netlify/Vercel (free)

## Steps
1) Create Supabase project → copy Project URL and anon key (Settings → API).
2) Storage → Create public bucket `proofs`.
3) SQL: paste and run `public/assets/schema.sql` in Supabase SQL Editor.
4) Auth → Providers → enable Email+Password. (Optional: Magic Link)
5) Edit `public/assets/config.js` with your URL, anon key, and admin emails.
6) Deploy `public/` folder on any static host.

## Test
- Open `login.html` → Sign up → Sign in → see `dashboard.html`.
- Submit a report on `submit-report.html` (optional proof upload).
- As an admin (email in `ADMIN_EMAILS`), open `admin.html` to edit earnings, report statuses, and campaigns.
- `campaign.html` lists public campaigns.

## Limits / Trade-offs
- Supabase free: ~1GB storage, 500MB DB, bandwidth caps (subject to change).
- Admin auth is email-allowlist in client (sufficient for demo). For stronger security, add RPCs with `security definer` and call via serverless functions.
- Public bucket exposes proof URLs (fine for demo). Tighten with storage policies if needed.

## Notes
- If OTP/magic links used, set Site URL in Supabase to your deployed origin.
- Serve over HTTP(s) locally (e.g., VS Code Live Server) to avoid CORS.
