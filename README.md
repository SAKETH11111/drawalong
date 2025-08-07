# DrawAlong

A minimal, elegant art-learning app. Pick a tutorial, draw along, upload your piece, and receive human feedback via email.

## Tech
- Next.js (App Router), Tailwind CSS 4
- UploadThing for image uploads (no local storage)
- Resend for transactional emails
- Optional: Supabase for persistence fallback (storage + `submissions` table)

## Local setup
```bash
npm install
# create .env.local and fill the variables below
npm run dev
```

## Environment variables (.env.local)
Required for uploads and email:

```
# Uploads (UploadThing)
UPLOADTHING_TOKEN=your_uploadthing_token

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
REVIEW_INBOX=reviewer@yourdomain.com
# Use onboarding sender until your domain is verified in Resend
MAIL_FROM='DrawAlong <onboarding@resend.dev>'
```

Optional (enable persistence fallback via Supabase):
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Notes:
- If `RESEND_API_KEY` is missing, `/api/submit` returns `{ ok: true, dev: true }` and does not send email (dev mode).
- If `MAIL_FROM` is a free mailbox domain (e.g., gmail.com), the API auto-falls back to `onboarding@resend.dev` to avoid 403 validation errors. Verify your own domain in Resend and then set `MAIL_FROM` to that domain when ready.
- UploadThing URL uses `ufsUrl` when available (v9-safe).

## Workflow
1) Home → choose a category (Anime, Animals, Fashion)
2) Pick a tutorial → watch (Next enables at end or at 80% progress)
3) Upload drawing (client-side compressed and retained between steps)
4) Enter name + email (required) → submit
5) Reviewer receives email with the image attached (and a link if available)

## API
`POST /api/submit` (multipart/form-data)
- Fields: `name` (required), `email` (required), `category` (optional), `videoId` (optional), `image` (required)
- Validates email, type (jpeg/png/webp), size (≤6MB)
- Uploads via UploadThing; falls back to Supabase if configured
- Sends email via Resend to `REVIEW_INBOX`
- Response: `{ ok: true, publicUrl?, submissionId?, storagePath? }` or `{ error }`

## Accessibility & UX
- High-contrast focus rings using theme `--ring`
- Motion kept subtle; respects `prefers-reduced-motion`

## License
MIT
