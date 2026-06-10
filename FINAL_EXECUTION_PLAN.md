# SignalPath Final Execution Plan

## 1. Summary

**Project name:** SignalPath, a Career OS evidence and marketplace layer.

**Core idea:** SignalPath helps candidates, employers, and universities use the same career evidence graph from different angles. Candidates own and update their evidence. Employers inspect auditable fit. Universities see anonymized readiness gaps.

**Honest framing:** SignalPath is a navigation tool, not a prediction tool. It does not claim to predict a person's career. It shows realistic paths, visible trade-offs, and evidence-backed readiness.

**Chosen modules:**

| Module | Audience | Priority |
|---|---|---|
| Living Portfolio | Candidate | Core |
| Career Path Navigator | Candidate | Core |
| Career Marketplace | Candidate + Employer | Core, compulsory |
| Smart Talent Matching | Employer | Core |
| Talent Re-Engagement | Employer | Core demo differentiator |
| Adaptive Readiness Profile | University | Core |
| Fair Pay Engine | Candidate + Employer | Optional |
| Admin and Demo Control | Internal | Required for stable demo |

**Core loop:**

```text
Candidate uploads evidence
  -> claims are extracted, reviewed, and approved
  -> Living Portfolio updates with provenance
  -> Career Path Navigator shows realistic options and gaps
  -> Marketplace roles show readiness from the same evidence rows
  -> Employers inspect auditable match matrices
  -> Re-engagement resurfaces opt-in candidates when evidence or role context changes
  -> Universities see anonymized cohort gaps
```

## 2. Requirements Alignment

### 2.1 Brief Alignment

SignalPath satisfies the brief because it:

- Treats Career OS as a navigation system, not a prediction system.
- Includes the compulsory Career Marketplace.
- Serves all three audiences: candidates, employers, universities.
- Makes AI useful without making AI the final authority.
- Shows uncertainty, missing evidence, and provenance.
- Avoids fantasy integrations such as LinkedIn, Workday, HRIS, LMS, or university database syncs in the MVP.

### 2.2 Judge Criteria Alignment

| Criterion | How SignalPath responds |
|---|---|
| Product and UX Thinking | Evidence-backed career navigation, shared opportunity workspace, one-person demo arc |
| System Design and Integration | Shared evidence graph, canonical skill taxonomy, deterministic scoring, audit matrix |
| Completeness | Candidate ingestion -> portfolio -> marketplace -> employer match -> re-engagement -> university dashboard |
| AI Craft | AI extracts, maps, drafts, and explains; deterministic code scores |
| Code Quality | TypeScript, Prisma, clear service boundaries, tests for scoring/provenance/taxonomy/jobs |

## 3. Product Boundaries

### 3.1 What SignalPath Does

- Converts candidate-controlled artifacts into reviewed evidence claims.
- Generates a living CV from accepted claims only.
- Shows realistic career paths and gaps.
- Publishes marketplace opportunities with shared candidate/employer readiness logic.
- Produces auditable employer match matrices.
- Re-engages candidates only when consent and retention rules allow.
- Shows universities anonymized aggregate readiness gaps.

### 3.2 What SignalPath Does Not Do

- Predict a person's exact future.
- Claim every artifact is legally verified.
- Treat a high number of extracted claims as proof of quality.
- Use LinkedIn, Workday, SAP, HRIS, LMS, or university APIs in the MVP.
- Replace an ATS.
- Automatically contact rejected candidates without consent.
- Let the LLM create canonical skills or generate match scores.
- Continuously poll the database every 2 seconds from Vercel serverless functions.

## 4. Shared Evidence Graph

### 4.1 Principle

The evidence graph is the source of truth, but not every actor writes the same kind of data.

| Actor | Writes | Reads |
|---|---|---|
| Candidate | Artifacts, approved claims, visibility settings, interest signals | Portfolio, paths, opportunity readiness |
| Employer | Role briefs, role requirements, shortlist states, outreach requests, rejection context | Candidate-visible evidence summaries and match matrices |
| University | Cohort metadata and program mapping in demo seed data | Anonymized aggregate readiness signals |
| System | Extraction jobs, score rows, provenance metadata, aggregate records | All derived product surfaces |

Use this wording in the pitch:

> Candidates own evidence. Employers define demand. Universities read aggregate readiness. Everyone sees a different lens over the same graph.

Do not say "only candidates write." That is inaccurate.

### 4.2 Evidence Claim Model

Each claim stores:

- Claim text
- Source artifact
- Canonical skill IDs
- Suggested unmapped skill names
- Provenance status
- Candidate review status
- Evidence quality score
- Source span or quote where available
- Visibility and shareability setting

### 4.3 Provenance Statuses

| Status | Meaning | Scoring role |
|---|---|---|
| `repo_backed` | Supported by public repository or code artifact | Strong evidence |
| `artifact_backed` | Supported by uploaded project or case artifact | Medium-high evidence |
| `document_backed` | Supported by certificate, award, letter, transcript, or formal document | Medium evidence |
| `reviewer_confirmed` | Confirmed through optional lightweight reviewer link | Strong evidence |
| `self_claimed` | Candidate-entered without proof | Low evidence |
| `unmapped` | Not mapped to canonical skill | Does not score |

## 5. Evidence Metrics

### 5.1 Metric Boundary

Do not use a raw "Trust Ratio" as the headline metric. A simple percentage of evidence-backed claims rewards claim quantity rather than evidence quality.

Bad metric:

```text
evidence-backed claims / total accepted claims
```

This rewards claim quantity, not candidate quality.

### 5.2 Replacement Metric: Evidence Coverage

Use **Evidence Coverage** and **Role Evidence Coverage**, not Trust Ratio.

**Profile Evidence Coverage** is a descriptive profile-health metric:

- Shows the share of accepted claims with some provenance.
- Does not affect match ranking directly.
- Includes a warning label: "Coverage measures provenance, not ability."

**Role Evidence Coverage** is the important marketplace metric:

- Measures how much of a specific role's requirements are supported by accepted evidence.
- Weighted by role requirement importance.
- Weighted by evidence strength.
- Capped per requirement to prevent many weak claims from inflating score.

### 5.3 Evidence Quality Score

Each claim receives an evidence quality score from 0 to 5.

| Evidence type | Base score |
|---|---:|
| `repo_backed` with relevant project | 5 |
| `reviewer_confirmed` with specific claim confirmation | 5 |
| `artifact_backed` project with source span | 4 |
| `document_backed` certificate or formal proof | 3 |
| `artifact_backed` generic document mention | 2 |
| `self_claimed` | 1 |
| `unmapped` or missing | 0 |

Quality modifiers:

- +1 if the artifact directly demonstrates output, capped at 5.
- +1 if source span is specific and inspectable, capped at 5.
- -1 if the claim is generic, broad, or passive.
- -1 if the source is a syllabus, course outline, or attendance-only artifact.
- -2 if the artifact proves exposure but not execution.

### 5.4 Anti-Gaming Rules

- Cap score contribution per role requirement.
- Deduplicate near-identical claims from the same artifact.
- Mark syllabus-derived claims as `exposure_only`, not execution evidence.
- Do not let more than one claim from the same artifact satisfy the same role requirement unless it proves different outputs.
- Weight claims by requirement relevance, evidence quality, and recency.
- Show "Evidence Quality" separately from "Match Score."

### 5.5 UI Labels

Use:

- **Evidence Coverage**
- **Evidence Quality**
- **Role Evidence Coverage**
- **Provenance Mix**

Avoid:

- Trust Ratio
- Truth Score
- Verified Score
- AI Confidence Score as a standalone hiring signal

## 6. Canonical Skill Taxonomy

### 6.1 Hard Rule

The LLM may not invent canonical skills. It receives a seeded taxonomy subset and must return IDs from that subset.

If the model sees an unknown concept, it must store it as `suggested_skill_names`. Suggested skills do not affect deterministic scoring until mapped by seed data or human review.

### 6.2 Skill Fields

| Field | Example |
|---|---|
| Canonical ID | `zk_proofs` |
| Display name | Zero-Knowledge Proofs |
| Aliases | ZK proofs, zero knowledge, zk-SNARKs |
| Category | Security |
| Parent skill ID | `cryptography` |
| Adjacent skills | `identity_verification`, `cryptographic_infrastructure` |

### 6.3 Skill Relation Rules

- Exact canonical skill match scores highest.
- Child skill can satisfy broad parent requirement with slightly reduced score.
- Parent skill only partially satisfies child requirement.
- Adjacent skill contributes only when explicitly configured in `SkillRelation`.
- Free-text skill names never score.

Example:

```text
Artifact text: "Implemented a Zero-Knowledge proof system"
AI output: skill_ids = ["zk_proofs"]

Employer requirement: "Cryptographic Infrastructure"
Role parser output: skill_id = "cryptographic_infrastructure"

Scorer:
zk_proofs -> cryptography -> cryptographic_infrastructure relation
partial or strong-adjacent credit depending on configured relation weight
```

### 6.4 MVP Seed Taxonomy

Seed around 40 to 60 skills across:

- Data
- Product
- Communication
- Technical
- Business
- Security
- Operations

Include aliases and parent/adjacent relations for every seeded skill used in the demo.

## 7. Async Extraction Without Database Polling Storms

### 7.1 Problem

Do not implement frontend polling every 2 seconds against a Vercel serverless endpoint backed by Prisma and standard Postgres connections. This can exhaust the Supabase/Postgres connection pool during a live demo.

### 7.2 Final MVP Approach

Use **event-first job status**, with **bounded fallback polling**.

Recommended implementation:

- `POST /api/artifacts` uploads the artifact and creates `ExtractionJob`.
- API returns `{ artifactId, extractionJobId }` immediately.
- Job worker updates status in the database.
- Frontend subscribes to job updates using Supabase Realtime or a lightweight server-sent events channel.
- If realtime fails, frontend uses bounded fallback polling:
  - first poll after 3 seconds
  - then 6 seconds
  - then 10 seconds
  - stop after 6 attempts
  - show "Refresh status" button after timeout

### 7.3 Database Connection Safety

Required infrastructure rules:

- Use Supabase connection pooler or Prisma Accelerate/Data Proxy for serverless Prisma.
- Do not create a new Prisma client per request.
- Keep job-status endpoint read-only and lightweight.
- Cache active job status in Upstash Redis or Vercel KV if available.
- During demo, seeded manifest extraction can complete synchronously after job creation, avoiding long-running background work.
- Batch recomputation of score rows after claim acceptance.

### 7.4 UI States

| State | UI text | Behavior |
|---|---|---|
| `queued` | Preparing artifact | Artifact card appears immediately |
| `processing` | Reading evidence and drafting claims | User can navigate away |
| `needs_input` | We need help reading this file | Show paste/manual/demo fallback |
| `completed` | Claims ready for review | Insert pending claim cards |
| `failed` | Extraction failed, continue manually | Keep artifact and fallback actions |

### 7.5 Demo Safety

For the live demo:

- Use seeded artifacts with manifest-backed extraction.
- Keep native parser path available but not required for the main flow.
- Provide "Use demo artifact" fallback button.
- Never make the demo depend on an arbitrary PDF parsing successfully.

## 8. Module Build Guidelines

This section is the implementation guideline for the product team. Each module description includes the intended user outcome, UI/UX requirements, behavior, boundaries, data/AI needs, and technical notes.

### 8.1 Living Portfolio

**Module description:** The Living Portfolio turns candidate-controlled artifacts into a reviewed, evidence-backed CV. It answers the prompt: "What if your CV updated itself, and was actually true?" In the MVP, "actually true" means every claim has visible provenance and review status, not that SignalPath legally verifies every claim.

**Primary user outcome:** Candidates can build a credible profile without rewriting their CV from memory. Employers can inspect the proof level behind each claim.

**UI/UX direction:**

- Should feel like a clean evidence workspace, not a resume builder form.
- The first visual priority is claim provenance: proof links, badges, and source snippets.
- Use a split view: Evidence Inbox on one side, Living CV preview on the other.
- Keep AI-generated claims visually marked as pending until the candidate approves them.
- Use calm status colors: green for strong evidence, amber for weak/self-claimed, grey for missing, red only for blocking gaps.

**Must have:**

- Artifact upload zone.
- Artifact list with extraction status.
- Evidence Inbox with pending claim cards.
- Claim review actions: accept, edit, reject.
- Living CV preview generated from accepted claims.
- Proof links from each CV bullet to artifact metadata, source quote, or repository link.
- Provenance badges.
- Evidence Coverage and Evidence Quality summaries.
- Privacy controls per artifact and claim.

**Behavior:**

- Uploading an artifact creates an `ExtractionJob`.
- Claims appear as suggestions only after extraction completes.
- Accepted claims enter the evidence graph and can appear in the CV and matching.
- Edited claims must preserve their original source artifact and source span where available.
- Rejected claims never affect CV, matching, career paths, or university aggregates.
- Self-claimed entries can appear but must be visually separated and scored low.
- Syllabus, transcript, and course-outline artifacts prove exposure, not execution, unless paired with a project artifact.

**Boundaries:**

- Do not auto-publish AI claims into the CV.
- Do not call Evidence Coverage a trust score.
- Do not claim all evidence is verified.
- Do not let one long artifact produce many weak claims that inflate quality.
- Do not depend on LinkedIn, LMS, university databases, or employer systems.

**Data and AI needs:**

- Reads/writes: `Artifact`, `ExtractionJob`, `EvidenceClaim`, `Skill`, `SkillRelation`.
- AI extracts claim suggestions and maps them to canonical skill IDs from the provided taxonomy subset.
- AI cannot create canonical skill IDs.
- Evidence quality scoring is deterministic code, not LLM judgment.

**Tech notes:**

- Next.js page under candidate area.
- React Query for artifact and claim data.
- Supabase Storage for files.
- Supabase Realtime or SSE for extraction job status.
- Bounded fallback polling only if realtime fails.
- Use manifest-backed seeded artifacts for live demo safety.

### 8.2 Career Path Navigator

**Module description:** The Career Path Navigator shows realistic next directions based on accepted evidence and role-family requirements. It is the core Career OS navigation experience.

**Primary user outcome:** Candidates see several plausible paths, understand trade-offs, and know which evidence would make each path more realistic.

**UI/UX direction:**

- Should feel like a navigation cockpit, not a fortune teller.
- Show multiple options side by side.
- Make uncertainty normal and visible.
- Use comparison tables and gap checklists rather than chat-only advice.
- Give the candidate agency: "Here are routes and trade-offs," not "Here is your destiny."

**Must have:**

- Current career shape summary.
- 3 to 5 path cards.
- Path comparison table.
- Readiness level per path.
- Supporting evidence section.
- Missing skills checklist.
- Suggested evidence to build next.
- Uncertainty note per path.
- Optional salary range with source/confidence label.

**Path types:**

- Nearby: lowest-friction next role.
- Stretch: plausible but requires clear gap closure.
- Pivot: adjacent field using transferable skills.
- Higher-pay: route optimized for compensation growth.
- Stability: route optimized for lower transition risk.

**Behavior:**

- Paths update when candidate accepts or removes evidence.
- Each path must show why it appears.
- Each missing skill should link to suggested proof-building actions.
- If evidence is weak, readiness must stay low even if the profile has many claims.
- No path should be described as guaranteed.

**Boundaries:**

- Do not use "prediction" language.
- Do not show false salary precision.
- Do not rank a path highly from self-claimed skills alone.
- Do not hide uncertainty.

**Data and AI needs:**

- Reads: accepted `EvidenceClaim`, `Skill`, `SkillRelation`, `RoleFamily`, seeded role patterns.
- AI may summarize trade-offs and uncertainty.
- Deterministic code computes readiness and missing skills.

**Tech notes:**

- Use Recharts only for simple path comparison if helpful.
- Use shared scoring and taxonomy utilities from `lib/scoring` and `lib/taxonomy`.
- Reuse the same requirement-row components as marketplace readiness.

### 8.3 Career Marketplace

**Module description:** The compulsory module. The Career Marketplace connects candidate evidence to employer demand through shared opportunity cards. Candidate and employer views must be two sides of the same object.

**Primary user outcome:** Candidates understand how close they are to a role. Employers understand who is credible and why.

**UI/UX direction:**

- Should not feel like a separate job board bolted onto a CV builder.
- The opportunity card is the central object.
- Candidate view: "What evidence do I have for this role?"
- Employer view: "What evidence does this candidate have for my requirements?"
- Keep consent and privacy controls visible.

**Must have:**

- Candidate opportunity board.
- Opportunity detail page.
- Candidate-facing readiness matrix.
- Employer role workspace.
- Role brief builder.
- Interested candidates list.
- Matched candidates list.
- Near-ready candidates list.
- Consent-aware outreach actions.
- Shared viewed/interested/shortlisted/contacted status.

**Behavior:**

- Employer creates a role brief with taxonomy-constrained requirements.
- Candidate opens the same opportunity and sees readiness rows.
- Candidate can add or approve evidence from a missing requirement.
- Candidate can express interest without exposing private artifacts.
- Employer sees updated readiness after candidate consent.
- Employer cannot preview private artifacts unless shared.

**Boundaries:**

- Do not expose private artifact content by default.
- Do not let employers spam candidates outside platform consent.
- Do not make candidate and employer scoring logic diverge.
- Do not use black-box candidate ordering.

**Data and AI needs:**

- Reads/writes: `RoleBrief`, `RoleRequirement`, `OpportunityInteraction`, `MatchScore`.
- AI can parse job descriptions into draft role requirements, but employer must review them.
- Role requirements must map to canonical taxonomy IDs.

**Tech notes:**

- Build one `OpportunityCard` component with candidate and employer variants.
- Store all readiness rows from the same requirement source.
- Use server actions/API routes for interest and visibility updates.

### 8.4 Smart Talent Matching

**Module description:** Smart Talent Matching creates an auditable shortlist for employers. pgvector retrieves a candidate pool, deterministic scoring ranks it, and AI explains the visible evidence matrix.

**Primary user outcome:** Employers get a ranked list they can trust because every score has visible receipts.

**Pipeline:**

```text
Role brief
  -> taxonomy-constrained role requirements
  -> pgvector retrieves candidate pool
  -> deterministic scorer ranks candidates
  -> evidence matrix generated
  -> AI memo explains visible rows only
```

**Score dimensions:**

| Dimension | Weight |
|---|---:|
| Role evidence coverage | 35% |
| Trajectory fit | 25% |
| Adjacent experience | 15% |
| Logistics fit | 10% |
| Growth signal | 10% |
| Preference alignment | 5% |

**UI/UX direction:**

- The evidence matrix must be more prominent than the AI memo.
- Show score breakdown before prose explanation.
- Use row-level "why this score?" drawers.
- Use compact employer-dashboard layouts for scanning.

**Must have:**

- Candidate shortlist.
- Role Evidence Coverage.
- Evidence Quality summary.
- Score breakdown.
- Evidence matrix.
- Provenance mix.
- Missing requirements.
- AI memo with cited matrix rows.
- "View proof" action.
- "Why this score?" action.

**Behavior:**

- Vector search narrows the pool only.
- Deterministic scorer produces the final ranking.
- Exact taxonomy match scores highest.
- Parent/child/adjacent matches use explicit `SkillRelation` weights.
- Suggested/unmapped skills never score.
- AI memo is generated after matrix rows exist.
- AI memo must not mention factors absent from the matrix.

**Boundaries:**

- Do not let the LLM produce match scores.
- Do not use protected attributes.
- Do not treat school prestige as a primary scoring factor.
- Do not allow many weak claims to satisfy one requirement.
- Do not auto-learn scoring weights in MVP.

**Data and AI needs:**

- Reads: `EvidenceClaim`, `Skill`, `SkillRelation`, `RoleRequirement`.
- Writes: `MatchScore` and matrix explanation inputs.
- AI creates memo from stored matrix JSON only.

**Tech notes:**

- Put scoring in `lib/scoring`.
- Keep scoring pure and testable.
- Persist score inputs so judges can audit reproducibility.
- Use pgvector only as a first-pass candidate retrieval tool.

### 8.5 Talent Re-Engagement

**Module description:** Talent Re-Engagement resurfaces previously reviewed candidates when their evidence changes or when role context changes. This is the employer-side "memory" of the marketplace, but it must be consent-first.

**Primary user outcome:** Employers do not lose near-miss candidates, and candidates who grow can be rediscovered without reapplying from scratch.

**UI/UX direction:**

- The key screen is the delta card.
- Make "what changed" obvious within 5 seconds.
- Show previous rejection context carefully and respectfully.
- Outreach must feel like a reviewed interest request, not automated pursuit.

**Must have:**

- Opt-in control for candidates.
- Retention duration and scope display.
- Re-engagement pool.
- Delta card.
- Previous score vs current score.
- "What changed" explanation.
- "Why resurfaced?" drawer.
- Draft message.
- HR review/send step.
- Revoke visibility behavior.

**Behavior:**

- Candidate must opt in to ongoing marketplace visibility.
- Re-score only candidates with active consent.
- Trigger on accepted new evidence or role requirement edits.
- Show exact delta: e.g. Experimentation missing -> A/B testing project artifact-backed.
- Draft messages require HR approval.
- Outcomes are logged for later analysis.
- Scoring weights remain fixed in MVP.

**Boundaries:**

- Do not keep rejected candidates in employer pools by default.
- Do not send automatic external emails.
- Do not imply the candidate is actively job-seeking unless they signaled it.
- Do not auto-update scoring weights from outcomes.
- Do not include Workday, SAP, HRIS, or MCP sync in MVP.

**Data and AI needs:**

- Reads/writes: `CandidateRetentionConsent`, `RejectedCandidateContext`, `ReEngagementEvent`, `OpportunityInteraction`.
- AI can draft a message using visible delta and shared history.
- AI cannot send messages.

**Tech notes:**

- Reuse deterministic scorer.
- Recompute only candidate-role pairs affected by a claim or requirement change.
- Use queued jobs or batched API logic to avoid expensive synchronous reranking.

### 8.6 Adaptive Readiness Profile

**Module description:** Adaptive Readiness Profile gives universities anonymized insight into whether cohorts are developing market-relevant evidence.

**Primary user outcome:** Universities can spot readiness gaps early enough to adjust curriculum, internships, or career support.

**UI/UX direction:**

- Should feel like an institutional dashboard, not student surveillance.
- Keep one highlighted insight per screen.
- Use aggregate charts with denominators.
- Avoid ranking individual students.

**Must have:**

- Cohort selector.
- Readiness distribution by role family.
- Top missing skills.
- Evidence coverage by program.
- Curriculum gap cards.
- Internship readiness summary.
- Data source and denominator labels.

**Behavior:**

- Uses accepted candidate evidence and seeded role demand.
- Shows aggregate data only.
- No individual candidate names or artifacts.
- Each insight includes context, e.g. "22% of 75 students."
- Insights should support curriculum decisions, not judge students.

**Boundaries:**

- Do not expose individual identities.
- Do not expose private artifacts.
- Do not imply university dashboards are production analytics without real institution data.
- Do not present seeded demo data as real market research.

**Data and AI needs:**

- Reads: `UniversityCohort`, `CohortAggregate`, accepted claim aggregates, role demand aggregates.
- AI may summarize one insight, but charts and counts come from deterministic aggregate queries.

**Tech notes:**

- Use Recharts for simple bar charts and distribution charts.
- Use precomputed seed aggregates for demo stability.
- Keep queries simple and cacheable.

### 8.7 Fair Pay Engine

**Module description:** Fair Pay Engine adds salary context to paths and opportunities when reliable or clearly labelled seeded data exists.

**Primary user outcome:** Candidates and employers see compensation context without false precision.

**UI/UX direction:**

- Salary should be secondary context, not the center of the product.
- Always show a source/confidence label.
- Use ranges, not exact values.
- Hide or soften low-confidence salary data.

**Must have:**

- Salary band on path cards when available.
- Salary band on opportunity cards when employer provides it.
- Source label: seeded estimate, employer-provided, public estimate.
- Confidence label.
- "Insufficient data" state.

**Behavior:**

- Do not show salary if no defensible source exists.
- Do not use salary to dominate match scoring.
- Candidate salary expectations remain private unless explicitly shared.
- Salary estimates should use broad bands.

**Boundaries:**

- No real salary benchmarking in MVP.
- No promises that listed salaries are market truth.
- No compensation advice that looks legal or financial.

**Data and AI needs:**

- Reads: role brief salary range, seeded salary bands.
- AI is not needed for MVP salary calculation.

**Tech notes:**

- Implement as optional fields on role/path cards.
- Keep all salary strings labelled.

### 8.8 Admin and Demo Control

**Module description:** Admin and Demo Control keeps the live prototype repeatable, recoverable, and safe during judging.

**Primary user outcome:** The team can run the exact Aisha/DataCo/UM story every time without manual database repair.

**UI/UX direction:**

- Hidden from normal user flow.
- Simple, utilitarian, and presenter-friendly.
- Must not distract from the product demo.

**Must have:**

- Persona switcher.
- Demo reset button.
- Seeded artifact picker.
- Demo scenario status.
- Hidden debug panel for extraction source, job status, and current score values.
- Backup route that shows precomputed post-extraction state.

**Behavior:**

- Reset restores known scores and artifacts.
- Seeded artifacts use manifest-backed extraction.
- Debug panel can reveal why extraction/scoring failed.
- If native parsing fails, presenter can switch to seeded manifest state.

**Boundaries:**

- Do not show admin/debug controls to judges unless needed.
- Do not require manual DB edits during the demo.
- Do not rely on network-heavy background jobs for the main story.

**Data and AI needs:**

- Reads/writes seed scenario records.
- No AI needed except normal extraction/memo paths.

**Tech notes:**

- Add protected or hidden `/demo-control` route.
- Add `npm run seed:demo` or equivalent reset command.
- Keep seed data deterministic.

## 9. Final Demo Narrative

### 9.1 Personas

- Candidate: Aisha Razak
- Employer: DataCo HR
- University: UM Faculty of Computing
- Role: Junior Product Analyst

### 9.2 Demo 1: Candidate

Goal: Show that a SignalPath profile is evidence-backed and career-aware.

Steps:

1. Aisha opens Living Portfolio.
2. She toggles "Show evidence" to reveal proof links and self-claimed labels.
3. She uploads seeded artifacts:
   - `google_data_analytics_cert.pdf`
   - `retail_dashboard_project.pdf`
4. Extraction job appears immediately.
5. Claims appear in Evidence Inbox.
6. Aisha approves the useful claims.
7. Living CV updates with proof links.
8. Career Path Navigator shows Junior Product Analyst at 61%.
9. The readiness matrix shows Experimentation missing.
10. Aisha applies or expresses interest anyway.
11. DataCo rejects or passes because Experimentation is missing.
12. Aisha opts in to ongoing marketplace visibility for 6 months.

Do not say the CV rewrites itself without candidate review. Say:

> SignalPath drafts the update from evidence. Aisha approves what becomes part of her living CV.

### 9.3 Demo 2: Employer

Goal: Show auditable matching and re-engagement.

Steps:

1. DataCo HR opens Junior Product Analyst role.
2. Employer sees shortlist with match score and Role Evidence Coverage.
3. HR opens Aisha detail.
4. Evidence matrix shows SQL and dashboarding supported, Experimentation missing.
5. AI memo explains only visible matrix rows.
6. Later, Aisha uploads and approves `ab_testing_project.pdf`.
7. Re-engagement pool updates because Aisha opted in and her evidence changed.
8. Delta card shows:

```text
Previous score: 61%
Current score: 79%
What changed: Experimentation now artifact-backed through A/B testing project
Role Evidence Coverage: improved for Product Analyst requirement set
```

9. HR opens "Why resurfaced?"
10. HR reviews and sends platform interest request.

No Workday, SAP, HRIS, Notion, or MCP sync appears in the live demo. Strategy changes are manual role brief edits only.

### 9.4 Demo 3: University

Goal: Show the same evidence graph creates aggregate institutional value.

Steps:

1. Open UM dashboard.
2. Show one highlighted card:

```text
0% of the 2025 cohort have artifact-backed experimentation evidence.
This skill appears in 61% of Product Analyst role briefs.
```

3. Tie it back to Aisha's rejection gap.

Closing line:

> One evidence graph. Aisha owns her evidence. DataCo reads it as auditable fit. UM reads it as a curriculum signal. Career OS becomes navigation, not prediction.

## 10. Data Model

### 10.1 Core Entities

| Entity | Purpose |
|---|---|
| `User` | Candidate, employer, university admin |
| `CandidateProfile` | Location, education, preferences, visibility |
| `Artifact` | Uploaded files, links, source metadata |
| `ExtractionJob` | Async extraction status and fallback state |
| `EvidenceClaim` | Claim text, skill IDs, provenance, review state |
| `Skill` | Canonical taxonomy item |
| `SkillRelation` | Parent, child, adjacent, prerequisite relations |
| `RoleBrief` | Employer role opportunity |
| `RoleRequirement` | Canonical skill requirement and importance |
| `OpportunityInteraction` | Viewed, interested, applied, hidden, shortlisted, contacted |
| `MatchScore` | Score breakdown and matrix inputs |
| `CandidateRetentionConsent` | Re-engagement opt-in, employer scope, expiry |
| `RejectedCandidateContext` | Rejection context for opt-in candidates only |
| `ReEngagementEvent` | Resurfacing event and delta explanation |
| `UniversityCohort` | Cohort metadata |
| `CohortAggregate` | Anonymized readiness aggregates |

### 10.2 ExtractionJob Fields

- id
- artifact_id
- candidate_id
- status: queued, processing, needs_input, completed, failed
- extraction_source: manifest, native_text, pasted_summary, manual_entry, failed
- progress_label
- error_message
- created_claim_count
- started_at
- completed_at

### 10.3 CandidateRetentionConsent Fields

- id
- candidate_id
- employer_id
- role_family_id
- consent_status: active, revoked, expired
- scope: role_only, employer_only, marketplace
- expires_at
- created_at
- revoked_at

## 11. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Charts | Recharts |
| Server state | React Query |
| Backend | Next.js API routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Serverless DB safety | Supabase pooler or Prisma Accelerate/Data Proxy |
| Vector search | pgvector |
| File storage | Supabase Storage |
| Job status events | Supabase Realtime or SSE |
| Fallback job cache | Upstash Redis or Vercel KV if available |
| AI | OpenAI API or equivalent |
| Deployment | Vercel + Supabase |

## 12. AI Responsibilities

| AI may | AI may not |
|---|---|
| Extract claims from artifacts | Invent canonical skill IDs |
| Suggest taxonomy IDs from provided dictionary | Treat self-claimed data as verified |
| Draft CV bullets from accepted claims | Publish claims without candidate review |
| Explain path trade-offs | Generate final match scores |
| Generate match memo from evidence matrix | Use protected attributes for matching |
| Draft re-engagement message | Automatically contact candidates |

## 13. Implementation Schedule

### Week 1: Foundation

Deliverables:

- Next.js app shell
- Prisma schema
- Supabase/Postgres setup with pooling
- Canonical taxonomy seed
- Seed data for Aisha/DataCo/UM scenario
- Persona switcher
- Demo reset command

Tasks:

- Set up Next.js, TypeScript, Tailwind, shadcn/ui.
- Add Prisma and PostgreSQL.
- Configure Supabase pooler or Prisma Accelerate/Data Proxy.
- Seed skills, aliases, parent/adjacent relations.
- Seed candidates, roles, artifacts, claims, cohorts.
- Build shared badges and matrix components.

### Week 2: Living Portfolio and Ingestion

Deliverables:

- Artifact upload
- ExtractionJob lifecycle
- Realtime/SSE status updates with bounded fallback polling
- Extractor ladder
- Evidence Inbox
- Claim review
- Living CV with proof links
- Evidence Coverage and Evidence Quality UI

Tasks:

- Implement `POST /api/artifacts`.
- Implement job worker or server-side job simulation for MVP.
- Add manifest-backed demo extraction.
- Add native parser path.
- Add paste/manual fallback.
- Add taxonomy-constrained claim extraction.
- Add anti-gaming evidence quality rules.

### Week 3: Navigator, Marketplace, Matching, Re-Engagement

Deliverables:

- Career Path Navigator
- Role brief builder
- Shared opportunity card
- Candidate readiness matrix
- Employer evidence matrix
- Deterministic scoring service
- AI memo from matrix
- Opt-in re-engagement pool
- Delta card and draft message

Tasks:

- Parse role requirements against taxonomy.
- Build candidate/employer views from same requirement rows.
- Implement pgvector retrieval as first pass.
- Implement deterministic scoring and evidence quality caps.
- Add candidate visibility and retention consent.
- Add re-engagement trigger on accepted evidence or role requirement edit.

### Week 4: University, Polish, Tests, Deployment

Deliverables:

- University readiness dashboard
- Cohort gap cards
- Test suite
- README
- Architecture diagram
- Demo script
- Live deployed URL
- Backup demo route with seeded state

Tasks:

- Build aggregate queries.
- Add charts.
- Add tests.
- Rehearse demo.
- Deploy to Vercel and Supabase.
- Verify demo with multiple simultaneous users.

## 14. Testing Plan

### 14.1 Unit Tests

- Taxonomy-constrained extraction rejects invented canonical IDs.
- Skill alias mapping resolves aliases.
- Child/parent/adjacent skill scoring works.
- Syllabus-derived claims receive lower evidence quality.
- Duplicate weak claims do not inflate role score.
- Self-claimed claims score low.
- Match score is reproducible.
- Re-engagement requires active consent.
- Re-engagement outcomes do not change scoring weights in MVP.

### 14.2 Integration Tests

- Upload seeded artifact -> job completes -> claims appear.
- Upload unreadable file -> needs_input -> paste fallback works.
- Candidate approves claim -> CV updates -> opportunity readiness updates.
- Role requirement parsing uses canonical skill IDs.
- Candidate with `zk_proofs` receives appropriate cryptography relation credit.
- Employer matrix and candidate readiness matrix use same rows.
- Candidate revokes visibility -> employer cannot re-engage.
- Job status updates do not require 2-second DB polling.

### 14.3 Load and Demo Tests

- Five simultaneous users can navigate the demo without DB connection errors.
- Extraction status UI works with realtime enabled.
- Fallback polling stops after bounded attempts.
- Demo reset restores known scores:
  - Aisha before A/B project: 61%
  - Aisha after A/B project: 79%
- Live demo works even if native PDF parser fails.

## 15. Deliverables

### 15.1 Product Deliverables

- Candidate dashboard
- Resilient artifact ingestion
- Evidence Inbox
- Living CV
- Career Path Navigator
- Marketplace opportunity workspace
- Employer match audit page
- Talent Re-Engagement page
- University readiness dashboard
- Admin/demo controls

### 15.2 Technical Deliverables

- Prisma schema
- Seed scripts
- Canonical taxonomy seed
- Deterministic scoring service
- Evidence quality scoring service
- Extraction job service
- Realtime or SSE job status channel
- Bounded fallback polling
- Test suite
- README

### 15.3 Submission Deliverables

- Live demo URL
- GitHub repository
- Pitch deck or PDF
- Demo video
- Architecture diagram
- Feasibility and limitations statement
- AI tooling disclosure

## 16. Must Have, Should Have, Will Not Have

### Must Have

- Async extraction with demo-safe manifest fallback
- Event-first job status updates, no DB polling storm
- Candidate claim review before CV publishing
- Evidence Coverage and Evidence Quality, not Trust Ratio
- Canonical skill taxonomy
- Deterministic scoring
- Shared opportunity card
- Candidate readiness matrix
- Employer evidence matrix
- AI memo grounded in matrix
- Career Path Navigator
- Opt-in Talent Re-Engagement
- University aggregate dashboard
- Demo seed reset
- Live demo URL

### Should Have

- Job description parser
- CV export
- Re-engagement message drafting
- Outcome logging for later analysis
- Fair Pay Engine with clearly labelled data
- Reviewer confirmation link

### Will Not Have

- LinkedIn API
- Workday, SAP, HRIS, LMS, or university database integration
- Automatic external candidate contact
- Auto-learning scoring weights
- Full ATS replacement
- Production-grade fraud detection
- Mobile native app
- Real salary benchmarking

## 17. Final Pitch

SignalPath is Career OS as an evidence graph.

Candidates use it to turn proof into a living portfolio and realistic career paths. Employers use it to inspect auditable fit instead of trusting keyword matches. Universities use it to see anonymized readiness gaps before students hit the job market.

The product does not predict the future. It makes the present legible.
