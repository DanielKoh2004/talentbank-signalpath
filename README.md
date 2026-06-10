# SignalPath

**Proof over prediction for the next generation of career navigation.**

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

SignalPath turns messy career evidence into a living, auditable career graph that candidates own, employers can trust, and universities can use to understand readiness gaps.

## The Problem & Our Solution

AI in hiring often becomes a black box: candidates are reduced to opaque fit scores, employers are asked to trust unexplained recommendations, and universities rarely see which skills their graduates can actually prove.

SignalPath takes a different position: **AI should not predict a person’s future. It should organize evidence, expose uncertainty, and make decisions auditable.**

Instead of generating unverifiable match scores, SignalPath builds an evidence graph from candidate artifacts such as project writeups, certificates, case studies, and repositories. Each claim is connected to:

- the source artifact,
- the extracted claim,
- the mapped canonical skill,
- the evidence quality score,
- the downstream role requirement it supports.

This creates a shared Career OS where:

- **Candidates** build a living portfolio with proof-backed CV claims.
- **Employers** evaluate candidates through an auditable match matrix.
- **Universities** see aggregate readiness gaps without exposing individual student data.

## Key Modules

### Living Portfolio

Candidates upload career artifacts and review extracted evidence claims before they become part of their profile. The portfolio behaves like a CV that updates from proof, not memory.

Key features:

- artifact upload and extraction jobs,
- claim review and acceptance,
- taxonomy-constrained skill mapping,
- evidence quality scoring,
- proof-linked Living CV.

### Career Marketplace

The marketplace connects both sides of the Career OS. Candidates discover roles and see their readiness against each requirement, while employers see interested and near-ready candidates.

Key features:

- candidate opportunity board,
- employer role workspace,
- shared readiness matrix,
- consent-aware candidate visibility.

### Smart Talent Matching

SignalPath does not return a mysterious AI ranking. It computes a deterministic match score and exposes the requirement-by-requirement evidence behind it.

Key features:

- deterministic scoring engine,
- skill taxonomy relation handling,
- evidence matrix,
- score breakdown,
- AI memo generated only from visible evidence rows.

### Talent Re-Engagement

Rejected candidates are not lost forever. When a candidate improves their evidence, SignalPath compares the live score against the stored rejection snapshot and surfaces the delta.

Key features:

- rejection baseline snapshot,
- precomputed JSON delta summary,
- threshold-based re-engagement,
- HR-reviewed outreach drafts.

### Adaptive Readiness Profile

Universities get an aggregate-only dashboard showing cohort readiness gaps. This helps institutions understand where curriculum and evidence-building opportunities are misaligned with market demand.

Key features:

- cohort readiness by role family,
- top missing evidence-backed skills,
- curriculum gap cards,
- marketplace demand signals,
- no individual student exposure.

## How It Works

```text
Candidate uploads artifact
        |
        v
Extraction job creates structured evidence claims
        |
        v
Candidate reviews and accepts claims
        |
        v
Accepted claims become a living career evidence graph
        |
        v
Employer role requirements are matched against visible evidence
        |
        v
Deterministic score + auditable evidence matrix + AI memo
        |
        v
Re-engagement engine tracks score improvement after rejection
        |
        v
University dashboard receives aggregate readiness signals
```

The loop is deliberately designed around **auditable evidence**, not unverifiable prediction.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Database | PostgreSQL via Neon |
| AI Layer | Vercel AI SDK, Xiaomi MiMo v2 Pro via OpenAI-compatible API |
| State Management | TanStack Query for bounded async polling |
| Deployment Target | Vercel |

## Local Development

### 1. Clone the repository

```bash
git clone <repository-url>
cd CareerOS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update `.env` with your Neon `DATABASE_URL` and optional AI provider credentials.

### 4. Push the Prisma schema

```bash
npx prisma db push
```

### 5. Seed the demo data

```bash
npx prisma db seed
```

This creates the built-in Aisha/DataCo/UM demo scenario.

### 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Scripts

```bash
npm run dev        # Start local development server
npm run build      # Build production bundle
npm run lint       # Run ESLint
npm run db:deploy  # Push schema and seed demo data
npx tsc --noEmit   # Type-check the project
npx prisma studio  # Inspect local database
```

## Deploying on Vercel with Neon

SignalPath uses a real PostgreSQL database in production. The deployed app will not work with the local SQLite-style `file:./dev.db` URL.

### 1. Create a Neon database

Create a Neon project and copy the pooled connection string. It should look like:

```text
postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

### 2. Add Vercel environment variables

In Vercel Project Settings -> Environment Variables, add:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
AI_API_KEY=...
AI_BASE_URL=...
AI_MODEL=...
```

The AI variables are optional for the stable demo path, but required if you want live AI memo or extraction behavior.

### 3. Push and seed the Neon database

Run this locally with the same Neon `DATABASE_URL` in your `.env`:

```bash
npm run db:deploy
```

This runs:

```bash
npx prisma db push
npx prisma db seed
```

### 4. Redeploy Vercel

After Neon has the schema and seed data, redeploy the app. The following API routes should return data:

```text
/api/roles
/api/paths?candidateId=profile_aisha
/api/re-engagement?employerId=user_dataco_hr
/api/university
/api/demo
```

## The Demo Narrative

SignalPath includes a complete seeded demo scenario:

1. **Aisha Razak**, a UM graduate, has a portfolio with accepted evidence claims.
2. **DataCo** is hiring for a Junior Product Analyst role.
3. Aisha is initially not ready because she lacks strong experimentation and product analytics evidence.
4. The employer sees this through an auditable evidence matrix, not a black-box score.
5. Aisha later adds an A/B testing project.
6. The re-engagement engine compares her live score against the stored rejection baseline and surfaces the improvement.
7. The university dashboard shows the same issue at cohort scale: **0% of the 2025 cohort have artifact-backed experimentation evidence, while 61% of Product Analytics role briefs require it.**

This demonstrates the full Career OS loop:

```text
candidate evidence -> employer decision -> re-engagement signal -> university readiness gap
```

## Demo Control

Visit:

```text
http://localhost:3000/demo-control
```

The Demo Control page provides:

- health checks for known seeded rows,
- direct launch buttons for each demo scene,
- a bounded “Restore Demo Scenario” action,
- debug IDs and key scores.

For safety, the app does **not** run a full database reset from an HTTP route. Full reseeding should be done locally against Neon with:

```bash
npm run db:deploy
```

The in-app restore action only repairs known scenario rows, which avoids Vercel serverless timeout risk during a live demo.

## Demo Routes

| Route | Purpose |
| --- | --- |
| `/portfolio` | Candidate Living Portfolio |
| `/marketplace` | Candidate marketplace |
| `/roles/rb_junior_product_analyst` | Employer match matrix |
| `/re-engagement` | Employer re-engagement dashboard |
| `/readiness` | University readiness dashboard |
| `/demo-control` | Demo health and recovery panel |

## Design Principles

- **Proof over prediction:** recommendations must be grounded in visible evidence.
- **Auditable AI:** AI explains from the matrix; it does not invent the matrix.
- **Candidate agency:** candidates review claims before they become part of their profile.
- **Employer trust:** every match score can be inspected requirement by requirement.
- **Institutional privacy:** universities receive aggregate signals, never individual surveillance.

## Production Notes

The app is configured for PostgreSQL through Neon. If API routes fail on Vercel, first check that `DATABASE_URL` is set in Vercel and that `npm run db:deploy` has been run against the same Neon database.

For deployment, avoid doing heavy work inside serverless request paths:

- do not run database seed/reset from API routes,
- do not process PDFs inside upload requests,
- do not require LLM extraction for the demo path,
- use precomputed aggregates for university dashboards,
- use manifest-backed demo artifacts for stable presentations.

## License

MIT
