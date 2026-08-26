# Clinic Desk — Doctor Dashboard

A single-page Next.js + Tailwind dashboard for a dental clinic, wired directly to Supabase:

- **Daily OP** — book appointment slots and click a status pill to cycle it through Waiting → In Progress → Completed → Cancelled. Updates live across tabs/devices via Supabase Realtime.
- **Patients** — registration form (name, age, phone, medical history, allergies) plus a searchable list. Anyone with an allergy on file gets a red "Allergy" badge that follows them into the OP list and treatment form.
- **Treatment & billing** — log a procedure, prescription, and cost against a patient, with one-click presets for common procedures.

## 1. Set up the database

1. Open your Supabase project → **SQL Editor**.
2. Paste in the contents of `supabase/schema.sql` from this project and run it.
   - If you already have `patients`, `appointments`, `treatments` tables with different columns, either rename your columns to match, or edit the code in `lib/types.ts` and the three components in `components/` to match your existing column names.
   - The script also enables Row Level Security with a wide-open policy (`using (true)`) so the app works immediately with just the publishable key. See the security note below before using this with real patient data.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://rhyywqdnjpffdjosinmq.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_ZPutLokpmwPqBYzLAbtoXQ_ILSmXqnc
```

(This is the "publishable" key you shared — it's the client-side key, the same kind that would ship in any browser app, so it's fine to use here. Just don't ever put a **service role / secret** key in this file or in any client code.)

## 3. Install and run

Requires [Node.js](https://nodejs.org) 18.18 or later.

```bash
npm install
npm run dev
```

Open **http://localhost:3000** — you should see the dashboard. Try registering a patient first, then book them an appointment on the Daily OP tab.

## 4. Build for production (optional)

```bash
npm run build
npm run start
```

## Project structure

```
app/
  layout.tsx        Root layout, fonts
  page.tsx           Main dashboard — tabs, patient list
  globals.css        Tailwind + base styles
components/
  PatientForm.tsx        Registration form
  AppointmentsList.tsx   Booking form + daily OP list with status toggle + realtime
  TreatmentForm.tsx      Treatment/prescription entry + billing + recent log
  StatusPill.tsx          Status badge
  AllergyBadge.tsx        Recurring allergy-warning badge
lib/
  supabaseClient.ts   Supabase client (reads env vars)
  types.ts            Shared TypeScript types
supabase/
  schema.sql          Table definitions, RLS policies, realtime setup
```

## A security note before this touches real patient data

The publishable key is meant to be exposed in the browser, but the RLS policy in `schema.sql` currently grants that key full read/write access to every row — there's no login, so anyone who gets your project URL and key can read or edit every patient record. That's a reasonable trade-off for local development, but for real clinic use you'll want to:

1. Add [Supabase Auth](https://supabase.com/docs/guides/auth) (email/password or magic link is enough for a single-clinic login).
2. Replace the `using (true)` policies in `schema.sql` with something like `using (auth.role() = 'authenticated')`.
3. Wrap the dashboard in a login screen so only signed-in staff can reach it.

Happy to build that auth layer next if you want it.
