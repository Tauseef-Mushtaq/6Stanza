# Module — Start Project Inquiry Email Notifications

## What this adds

When a `/start-project` inquiry is successfully saved to `project_inquiries`,
two emails now go out via [Resend](https://resend.com):

1. **Company notification** → `INQUIRY_NOTIFICATION_EMAIL` — full inquiry
   detail plus an admin link.
2. **Client confirmation** → the email address the visitor submitted —
   a short "we got it" message with a reference ID. No internal/admin
   content.

Nothing about the existing Start Project flow changed from the visitor's
point of view: same form, same validation, same success/error states. The
only new behavior happens **after** the Supabase insert already succeeded.

## Flow

```
ProjectForm (unchanged)
  → submitInquiry (unchanged)
  → submitProjectInquiryAction (unchanged)
  → submitProjectInquiry (lib/services/projectInquiryService.ts)
      → validate (unchanged)
      → insertProjectInquiry (lib/repositories/projectInquiries.ts)   ← now returns the inserted row
      → sendProjectInquiryNotifications (lib/notifications/inquiryNotifications.ts)   ← NEW, best-effort
      → return { ok: true }   (unchanged contract — ProjectForm never sees the email step)
```

## Files touched

**New:**
- `src/lib/notifications/resendClient.ts` — lazy Resend client + env accessors. Returns `null` if `RESEND_API_KEY`/`RESEND_FROM_EMAIL` are unset, never throws.
- `src/lib/notifications/inquiryEmailTemplates.ts` — HTML+text templates for both emails. Service names are resolved from the existing `@/features/home/data/services` catalog (no duplicated label list).
- `src/lib/notifications/inquiryNotifications.ts` — `sendProjectInquiryNotifications(row)`. Orchestrates both sends, never throws, returns a logged `NotificationOutcome`. Includes a process-local dedupe guard keyed by inquiry id (see "Duplicate handling" below).
- `.env.example` — documents all env vars the project needs, including the three new ones.

**Modified:**
- `src/lib/repositories/projectInquiries.ts` — `insertProjectInquiry` now does `.select("*").single()` and returns the inserted `ProjectInquiryRow` instead of `void`, so the notification step has the generated `id`/`created_at` without a second round trip. No column/table changes; no other repository function touched.
- `src/lib/services/projectInquiryService.ts` — after a successful insert, calls `sendProjectInquiryNotifications` inside its own `try/catch` and only logs the outcome. The function's return type and every existing success/error path are unchanged.
- `package.json` — added `resend` as a dependency.

**Not touched:** `ProjectForm.tsx`, `actions.ts`, `submitInquiry.ts`, validation schemas, admin pages, CMS/SEO/motion/auth code, the database schema/migrations.

## Environment variables

Add these to your deployment environment (Vercel project settings, etc.) and to your local `.env.local`. `.env.example` documents all of them (existing + new); no real values are committed anywhere.

| Variable | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | For emails to send | From resend.com/api-keys. Server-only. |
| `RESEND_FROM_EMAIL` | For emails to send | Must be on a domain verified in Resend, e.g. `"6STANZA <hello@yourdomain.com>"`. |
| `INQUIRY_NOTIFICATION_EMAIL` | For the company email | Set to the real 6STANZA business inbox in each environment. Never hardcoded in source. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Already used by `authService.ts`; also now used to build the "View in admin" link. If unset, the admin email is sent without that link. |

If `RESEND_API_KEY` or `RESEND_FROM_EMAIL` is missing, notifications are
skipped entirely (a warning is logged) and the inquiry save still succeeds
normally — this was a hard constraint, not an oversight.

## Reliability / error handling

- The Supabase insert must succeed before any email is attempted — enforced by ordering in `submitProjectInquiry`, not just convention.
- `sendProjectInquiryNotifications` never throws. Every `resend.emails.send` call is wrapped; failures are logged (`console.error`/`console.warn`) with the inquiry id and error *name* only — never the API key or full provider error body.
- The admin and client emails are independent sends: if one fails, the other is still attempted.
- A failed or skipped notification never changes `submitProjectInquiry`'s return value — `ProjectForm.tsx` always sees the same success state it did before this module, as long as the DB insert worked.

## Duplicate handling

There's a process-local `Set<inquiryId>` in `inquiryNotifications.ts` that
skips re-sending for an inquiry id already handled by that server instance.
This is deliberately **best-effort**, not a strong guarantee, because the
constraints ruled out adding a new table/column to make it durable:

- It only protects against duplicate *notification* attempts for the same
  already-inserted row within one warm serverless instance's lifetime — it
  does **not** deduplicate two genuinely separate form submissions (those
  are two different inquiry rows, and each should be notified).
- On serverless platforms with multiple instances or cold starts, this
  guard will not catch every duplicate.
- If a stronger guarantee is ever needed, the durable fix is a
  `notified_at timestamptz` column on `project_inquiries` (a migration was
  intentionally not added here — "do not create another inquiry table or
  submission path" was read as applying to *new tables*, but a new column
  still felt out of scope for this module — flagging it for a follow-up).

## Fields NOT included (and why)

The prompt asked for these "if available." Checked against the actual
schema (`supabase/migrations/0003_project_inquiries.sql`,
`database.types.ts`) and the current discovery/consultation flow:

- **Smart Project Discovery recommendations/context** — the discovery flow
  (`src/features/discovery/lib/prefillBridge.ts`) already folds its
  answers directly into the normal `ProjectInquiry` fields (message,
  project title, etc.) *before* submission via `sessionStorage`. There is
  no separate "discovery context" object saved anywhere — whatever the
  visitor discovered is already inside `row.message`/`row.project_title`,
  which the admin email already shows in full. Nothing extra to surface.
- **Consultation status** — `consultation_bookings` is a separate table,
  populated later by a Cal.com webhook, and only optionally linked back to
  a `project_inquiry_id`. At the moment an inquiry is first saved, no
  booking can exist yet, so there's nothing to show. (A future module
  could look up `consultation_bookings` by `project_inquiry_id` if the
  admin email needs to reflect a *later* booking — out of scope here since
  it wasn't part of the insert-time flow.)
- **Attachment information** — there is no file-upload/attachment column
  or feature anywhere in the Start Project flow today. Nothing exists to
  include.

The templates (`inquiryEmailTemplates.ts`) are written so any of these
could be added later without restructuring — they just aren't populated
because the underlying data doesn't exist yet.

## Verification performed

```bash
npm install         # added `resend`
npm run build        # ✓ succeeded, all 38 routes compiled
npx tsc --noEmit      # ✓ no type errors
npm run lint          # 1 pre-existing error in StartProjectPageContent.tsx,
                        #   unrelated to this module (react-hooks/set-state-in-effect,
                        #   in a file this module never touches) — present before this change
```

## Tests that require real credentials (not performed here)

These need a live Supabase project + a live Resend account/verified domain,
neither of which exist in this sandbox:

1. Submit `/start-project` end-to-end and confirm the row lands in
   `project_inquiries`.
2. Confirm the company notification arrives at `INQUIRY_NOTIFICATION_EMAIL`
   with correct field values and a working admin link.
3. Confirm the client confirmation arrives at the submitted address and
   contains no internal/admin details.
4. Simulate an email-provider failure (e.g. temporarily wrong
   `RESEND_API_KEY`) and confirm: the inquiry row still exists in Supabase,
   `submitProjectInquiry` still returns `{ ok: true }`, and the failure is
   visible only in server logs.

Recommend running these once real `RESEND_API_KEY` / `RESEND_FROM_EMAIL` /
`INQUIRY_NOTIFICATION_EMAIL` values are available in a deploy preview.
