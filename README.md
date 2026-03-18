# Skill Passport

> AI-powered developer skill verification platform. Take a secure, proctored coding assessment. Receive a verified Skill Passport with granular AI scores. Share it anywhere.

---

## Tech Stack

| Layer        | Technology                                          |
|--------------|-----------------------------------------------------|
| Framework    | Next.js 15 (App Router)                             |
| Styling      | Tailwind CSS + custom glassmorphism design system   |
| UI           | Shadcn/UI, Radix UI, Lucide React, Framer Motion    |
| State        | Zustand (assessment engine)                         |
| Forms        | React Hook Form + Zod                               |
| Editor       | Monaco Editor (@monaco-editor/react)                |
| Backend/Auth | Supabase (PostgreSQL + Auth + Storage)              |
| AI           | Anthropic Claude (claude-sonnet-4-20250514)         |
| Deployment   | Vercel                                              |

---

## Local Development

### 1. Clone & install

```bash
git clone https://github.com/your-org/skill-passport
cd skill-passport
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full schema from `supabase/schema.sql` (the SQL from Phase 1 of this project)
3. Go to **Authentication → Providers** and enable **GitHub** and **Google**
4. Set the OAuth callback URL: `https://your-project.supabase.co/auth/v1/callback`
5. In your GitHub OAuth App, set the callback to the same URL
6. The `resumes` storage bucket is created by the schema SQL

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

```bash
npx vercel --prod
```

Add all `.env.local` variables to your Vercel project's Environment Variables.

Update your Supabase project's **Site URL** and **Redirect URLs** to your Vercel domain:
- Site URL: `https://your-app.vercel.app`
- Redirect URL: `https://your-app.vercel.app/auth/callback`

---

## Project Structure

```
skill-passport/
├── app/
│   ├── (auth)/callback/route.ts     # OAuth callback
│   ├── api/evaluate/route.ts        # AI evaluation endpoint (Phase 4)
│   ├── assessment/[id]/page.tsx     # Assessment runner
│   ├── dashboard/[username]/page.tsx # Skill Passport profile
│   ├── onboarding/page.tsx          # Multi-step onboarding
│   └── page.tsx                     # Landing page
├── components/
│   ├── assessment/                  # Engine: Monaco, Console, Timer, Anti-cheat
│   ├── dashboard/                   # Passport card, Radar chart, Score breakdown
│   ├── landing/                     # Hero, Features, CTA
│   ├── onboarding/                  # 3-step wizard
│   └── shared/                      # Navbar, GlassCard
├── hooks/
│   ├── useAntiCheat.ts              # Tab/copy/paste detection
│   └── useCountdown.ts             # Server-synced timer
├── lib/
│   ├── encode.ts                    # Base64 encode/decode
│   ├── supabase/                    # Browser + server clients
│   ├── utils.ts                     # Helpers
│   └── validators.ts                # Zod schemas
├── store/
│   └── assessmentStore.ts           # Zustand store
└── types/index.ts                   # Global TypeScript types
```

---

## Key Security Decisions

| Concern | Implementation |
|---|---|
| Code payload integrity | Base64-encoded before POST, decoded server-side |
| Tab switching | `visibilitychange` → warn on 1st, auto-fail on 3rd |
| Copy/paste | Blocked via DOM events on editor wrapper + keyboard capture |
| Timer manipulation | Calculated from server-issued `expires_at` timestamp, not a client counter |
| AI metric writes | Only via `service_role` key — RLS blocks direct client writes |
| Assessment ownership | Every API call verifies `user_id = auth.uid()` |
| Plagiarism | `is_plagiarized_or_suspicious` boolean from AI → auto-flags assessment |

---

## API Reference

### `POST /api/evaluate`

Evaluates a code submission with AI and persists results.

**Request body:**
```json
{
  "assessment_id":         "uuid",
  "question_id":           "uuid",
  "encoded_code":          "base64-string",
  "language":              "javascript",
  "question_title":        "Two Sum",
  "question_description":  "Given an array..."
}
```

**Response:**
```json
{
  "success": true,
  "submission_id": "uuid",
  "ai_metrics": {
    "metrics": {
      "algorithm_efficiency": { "score": 85, "reasoning": "..." },
      "code_readability":     { "score": 90, "reasoning": "..." },
      "problem_solving":      { "score": 78, "reasoning": "..." }
    },
    "overall_score": 84,
    "feedback": {
      "strengths":                ["..."],
      "weaknesses":               ["..."],
      "improvement_suggestions":  ["..."]
    },
    "is_plagiarized_or_suspicious": false
  }
}
```
