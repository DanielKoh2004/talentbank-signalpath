# Career OS: SignalPath Execution Plan

## 1. Executive Summary

**Project name:** Career OS: SignalPath

**One-line pitch:** SignalPath turns messy career evidence into a living, auditable career graph that candidates own, employers can trust, and universities can use to understand readiness gaps.

**Core thesis:** Career OS should be a navigation tool, not a prediction tool. SignalPath does not claim to predict a person's exact future. It shows realistic next paths, the evidence behind those paths, the trade-offs involved, and the proof behind candidate-role matches.

**Primary product bet:** The most defensible version of Career OS is not "AI predicts your career." It is "AI helps structure, compare, and explain career evidence."

**Chosen modules:**

- Compulsory: Career Marketplace
- Candidate: Career Path Navigator
- Candidate: Living Portfolio
- Employer: Smart Talent Matching
- University: Adaptive Readiness Profile
- Optional extension: Fair Pay Engine

**MVP shape:** A clickable, end-to-end web app where:

1. A candidate uploads career artifacts.
2. SignalPath extracts evidence-backed claims.
3. The candidate approves claims into a living CV.
4. The system shows realistic career paths and skill gaps.
5. An employer creates a role and sees an auditable match matrix.
6. A university dashboard shows anonymized cohort readiness gaps.

## 2. Product Positioning

### 2.1 Problem

Across Asia, students and workers make high-stakes career decisions with poor signal. Job boards show inventory, not direction. ATS products filter applicants, but they do not explain fit. Generic career advice ignores personal evidence, geography, education, and constraints.

Candidates need a map. Employers need signal. Universities need accountability.

### 2.2 Solution

SignalPath creates a shared evidence layer across career navigation and hiring.

For candidates, it becomes a living CV and career navigator. For employers, it becomes an explainable talent marketplace. For universities, it becomes an aggregate readiness dashboard.

### 2.3 Honest Framing

SignalPath does not:

- Predict a single person's exact career outcome.
- Claim certainty where the data is weak.
- Depend on inaccessible integrations for the MVP.
- Ask past employers to adopt a new platform before value exists.
- Hide matches behind black-box AI scores.

SignalPath does:

- Show realistic career paths based on visible evidence.
- Explain trade-offs and uncertainty.
- Label claim provenance clearly.
- Let users inspect why a candidate matched a role.
- Use AI to extract, summarize, and explain, not to invent proof.

## 3. Target Audiences

### 3.1 Candidates

**Primary users:** Students, fresh graduates, early-career workers, and mid-career switchers in Asia.

**Pain points:**

- Do not know what roles are realistic.
- Struggle to translate projects into credible CV bullets.
- Apply blindly to roles with unclear fit.
- Lack proof for skills they claim.
- Do not know which missing skills matter most.

**Value proposition:** Build a CV from evidence, see realistic paths, and understand what proof is needed to move forward.

### 3.2 Employers

**Primary users:** Recruiters, HR teams, hiring managers, and talent acquisition teams.

**Pain points:**

- Keyword matching is noisy.
- CVs are often inflated or vague.
- Junior and emerging talent is hard to evaluate.
- HR will reject unexplainable AI rankings.

**Value proposition:** Find candidates through auditable evidence, not just polished CV language.

### 3.3 Universities

**Primary users:** Career services, employability teams, faculty leaders, and curriculum planners.

**Pain points:**

- Graduate outcomes are delayed and shallow.
- Curriculum-market mismatch is hard to detect.
- Internship readiness is unclear before students apply.

**Value proposition:** See anonymized cohort readiness, common skill gaps, and which evidence types improve employability.

## 4. MVP Modules

### 4.1 Living Portfolio

**Prompt being solved:** "What if your CV updated itself, and was actually true?"

**MVP interpretation:** The CV updates from artifacts the candidate controls, and every claim has visible provenance.

**Evidence sources for MVP:**

- Uploaded PDF CVs
- Project PDFs
- Slide decks
- Certificates
- Screenshots
- Case study documents
- GitHub repository links
- Public portfolio links
- Manual entries marked as self-claimed

**Out of scope for MVP:**

- LinkedIn API integration
- University database integration
- Employer HRIS integration
- Automatic background checks
- Mandatory past-employer verification

**Claim provenance statuses:**

- `artifact_backed`: extracted from an uploaded artifact
- `repo_backed`: supported by a public code repository link
- `document_backed`: supported by a certificate, award letter, internship letter, or similar document
- `reviewer_confirmed`: confirmed through an optional lightweight reviewer link
- `self_claimed`: entered by candidate without evidence

**Core behavior:**

1. Candidate uploads artifacts.
2. AI extracts candidate claims.
3. Candidate accepts, edits, or rejects extracted claims.
4. Accepted claims enter the evidence graph.
5. Living CV bullets are generated only from accepted claims.
6. Each generated bullet links back to source evidence.
7. Claims with weaker provenance remain labelled.

### 4.2 Career Path Navigator

**Purpose:** Show realistic career directions, not one deterministic answer.

**Path types:**

- Nearby path: lowest-friction next role
- Stretch path: plausible role with skill gaps
- Pivot path: adjacent field using transferable skills
- Higher-pay path: route optimized for compensation growth
- Stability path: route optimized for lower transition risk

**Each path displays:**

- Why it fits
- Evidence supporting the fit
- Missing skills
- Suggested proof to build
- Estimated readiness level
- Salary range if available
- Confidence level
- Uncertainty notes

**Important boundary:** The readiness estimate is not a prediction of employment. It is a transparent assessment of current evidence against known role requirements.

### 4.3 Career Marketplace

**Purpose:** Connect candidate evidence to employer demand through one shared opportunity workspace, not two disconnected dashboards.

**Marketplace concept:** Every role creates a visible "opportunity card" with requirements, evidence expectations, salary range, and readiness signals. Candidates see the same role logic as employers, but from the opposite side:

- Candidates see "what evidence would make me credible for this role?"
- Employers see "what evidence does this candidate already have for this role?"

This makes the marketplace cohesive. The candidate does not just build a CV in one place while the employer sees a separate matrix somewhere else. The same requirements, skills, gaps, and evidence rows power both views.

**Candidate side:**

- Discover role opportunities aligned with current evidence.
- Open a role and see a candidate-facing readiness matrix.
- See which claims already support the role.
- See which missing evidence blocks stronger matching.
- Add or approve evidence directly from a role gap.
- Choose whether to make profile visible to employers.
- Send an "interested" signal to the employer.

**Employer side:**

- Create role briefs with requirements.
- View candidate shortlist.
- Inspect requirement-by-requirement evidence.
- See which candidates have expressed interest.
- See which candidates are "near-ready" and what evidence is missing.
- Send interest requests without spam.

**Shared marketplace loop:**

1. Employer publishes role opportunity.
2. Candidate sees role readiness and missing proof.
3. Candidate accepts or adds evidence to close gaps.
4. Candidate opts into visibility or sends interest.
5. Employer sees updated evidence matrix and candidate readiness.
6. Outreach happens only after either candidate interest or employer fit review.

**Marketplace rule:** Employers do not see private artifacts unless the candidate has marked them shareable. Employers can still see that a requirement is supported by private evidence, but the artifact preview remains locked until the candidate shares it.

### 4.4 Smart Talent Matching

**Purpose:** Match candidates to roles through explainable scoring.

**Pipeline:**

1. Retrieve candidate pool using filters and semantic search.
2. Score candidate evidence against role requirements deterministically.
3. Generate an AI memo from the visible scoring matrix.
4. Show the underlying evidence table beside the memo.

**Key principle:** AI explains the score; it does not create the score.

### 4.5 Adaptive Readiness Profile

**Purpose:** Give universities aggregate employability insight without exposing individual private data.

**Dashboard metrics:**

- Cohort readiness by target role family
- Most common missing skills
- Evidence coverage by cohort
- Internship readiness distribution
- Curriculum-to-market gap signals
- Top artifacts associated with stronger employer matches

**Privacy boundary:** University dashboard uses anonymized aggregate data only.

### 4.6 Fair Pay Engine

**MVP status:** Optional lightweight extension.

**Purpose:** Show salary ranges and pay gaps where public or seeded data exists.

**Boundary:** Salary data must be labelled as estimated or prototype data unless sourced from a reliable dataset.

## 4A. Module UX and Behavior Specifications

### 4A.1 Global UX Principles

SignalPath should feel like a career navigation workspace, not a job board, ATS, or chatbot wrapper.

**Look and feel:**

- Calm, structured, professional, and data-forward.
- Use dense but readable layouts for dashboards.
- Avoid marketing-page hero sections inside the product.
- Prefer tables, matrices, timelines, badges, and side panels over decorative cards.
- Use restrained color to communicate status: evidence strength, readiness, missing gaps, and privacy.

**Interaction principles:**

- Every recommendation must have a visible "why."
- Every score must have a visible breakdown.
- Every AI-generated item must be editable or reviewable.
- Every claim must show provenance.
- Users should be able to continue working while AI jobs run.
- The product should never trap users behind one loading spinner.

**Shared UI language:**

- Provenance badges: `artifact-backed`, `repo-backed`, `document-backed`, `reviewer-confirmed`, `self-claimed`.
- Readiness states: `not ready`, `building`, `near-ready`, `ready to discuss`.
- Confidence labels: `low`, `medium`, `high`, always paired with explanation.
- Privacy labels: `private`, `shareable summary`, `shareable artifact`.

### 4A.2 Resilient Evidence Ingestion Module

**Description:** Converts uploaded or entered artifacts into pending evidence claims without making the demo dependent on brittle document parsing.

**Key points to look out for:**

- Upload must return immediately with an extraction job.
- Parsing failure must be a recoverable state, not an error dead end.
- Seeded demo artifacts must have manifest-backed extraction for live reliability.
- Manual entries must be clearly labelled as self-claimed.
- Pasted summaries should not be treated as stronger proof than the artifact supports.

**UI should have:**

- Upload zone with supported file types and examples.
- Artifact list with status chips: queued, processing, needs input, claims ready, failed.
- Progress text for background extraction.
- Fallback actions: retry, paste summary, add claim manually, use demo artifact.
- Source preview or metadata panel.

**Behavior:**

- User uploads artifact.
- UI shows artifact card immediately.
- React Query polls extraction job status.
- Completed jobs reveal pending claim cards.
- Failed jobs keep the artifact visible and offer fallback actions.
- Candidate can navigate away and return without losing job state.

### 4A.3 Living Portfolio Module

**Description:** Builds a living CV from accepted evidence-backed claims. This is the core answer to "What if your CV updated itself, and was actually true?"

**Key points to look out for:**

- The product should not imply all claims are fully verified.
- The credibility comes from provenance, traceability, and candidate review.
- CV bullets should never include unsupported numbers or inflated language.
- AI drafts claims; the candidate owns approval.

**UI should have:**

- Evidence Inbox for pending claims.
- Claim review cards with source, taxonomy skills, quote/span, confidence, and provenance.
- Accept, edit, reject actions.
- Living CV preview with proof links on each bullet.
- Skill inventory grouped by category and evidence strength.
- Privacy controls for each artifact and claim.

**Behavior:**

- Pending claims do not appear in the living CV until accepted.
- Edited claims preserve original source evidence.
- Rejected claims remain hidden from CV and matching.
- Self-claimed entries can appear, but must be visually separated.
- Clicking "view proof" opens artifact metadata, quote/span, or preview.

### 4A.4 Career Path Navigator Module

**Description:** Shows realistic possible next directions from current evidence, with trade-offs and uncertainty.

**Key points to look out for:**

- Do not present one path as the answer.
- Do not imply the system predicts the user's future.
- Use evidence and gaps to explain each path.
- Make uncertainty visible and normal.

**UI should have:**

- Current career shape summary.
- Path comparison table with 3 to 5 routes.
- Path cards for nearby, stretch, pivot, higher-pay, and stability routes.
- Gap checklist connected to evidence claims.
- Suggested proof-building actions.
- "Why this path?" drawer with evidence and uncertainty.

**Behavior:**

- Paths update when accepted evidence changes.
- Missing skills link back to suggested artifacts or claims the candidate can add.
- Readiness levels are based on role requirements and evidence, not vague AI judgment.
- Salary ranges are shown only when data exists and are labelled as estimated or sourced.

### 4A.5 Career Marketplace Module

**Description:** The compulsory marketplace module. It connects candidate evidence and employer demand through shared opportunity cards.

**Key points to look out for:**

- Candidate and employer views must be two sides of the same object.
- The marketplace should not feel like a separate job board bolted onto a CV builder.
- The same role requirements power candidate readiness and employer matching.
- Candidate agency and consent must be obvious.

**UI should have:**

- Opportunity board for candidates.
- Opportunity detail page with role requirements, salary range, work mode, and readiness matrix.
- Candidate "interested" action.
- Employer opportunity workspace with role brief, interested candidates, matched candidates, and near-ready candidates.
- Shared status timeline: viewed, interested, shortlisted, contacted.

**Behavior:**

- Employer publishes a role as an opportunity card.
- Candidate opens it and sees which requirements are already supported.
- Candidate can add evidence directly from a missing requirement.
- Candidate can signal interest without exposing private artifacts.
- Employer sees updated readiness after candidate accepts new evidence.
- Outreach should happen through consent-aware interest or invite flows.

### 4A.6 Smart Talent Matching Module

**Description:** Produces explainable candidate-role matches using retrieval plus deterministic scoring.

**Key points to look out for:**

- pgvector retrieval is only candidate discovery, not final ranking.
- Final scores must be reproducible from stored evidence rows.
- Skill comparison must use canonical taxonomy IDs and configured relations.
- The AI memo must summarize visible inputs only.

**UI should have:**

- Candidate shortlist with score breakdown.
- Evidence matrix by role requirement.
- Provenance mix summary.
- Missing requirements section.
- "Why this score?" drawer.
- AI memo panel with cited evidence row IDs.

**Behavior:**

- Exact canonical skill matches score highest.
- Parent/child/adjacent skill matches use `SkillRelation` weights.
- Free-text or suggested skills do not score until mapped.
- Private artifacts can support candidate-side readiness, but employers see locked proof until shared.
- The AI memo updates only after score rows are generated.

### 4A.7 Adaptive Readiness Profile Module

**Description:** Gives universities aggregate insight into whether cohorts are building market-relevant evidence.

**Key points to look out for:**

- This is not a surveillance dashboard.
- Keep the dashboard aggregate and privacy-preserving.
- Focus on curriculum and readiness gaps, not individual ranking.
- Use simple charts judges can understand quickly.

**UI should have:**

- Cohort selector.
- Readiness distribution by role family.
- Top missing skills.
- Evidence coverage chart.
- Internship readiness summary.
- Curriculum-market gap insights.

**Behavior:**

- Aggregates update from accepted candidate evidence and seeded role demand.
- No individual artifacts are visible.
- Insights should include denominator/context, not isolated percentages.
- Each insight should be phrased as a decision support signal, not a verdict.

### 4A.8 Fair Pay Engine Module

**Description:** Optional extension that adds salary context to career paths and opportunities.

**Key points to look out for:**

- Salary data is sensitive and easy to overclaim.
- Prototype salary ranges must be labelled clearly.
- Pay guidance should support negotiation and awareness, not guarantee outcomes.

**UI should have:**

- Salary range band on path cards and opportunity cards.
- Pay comparison panel by role family, location, and seniority.
- Label for data source: seeded, public estimate, or user-provided.
- Warning when data confidence is low.

**Behavior:**

- If reliable data is missing, hide the number or show "insufficient data."
- Never produce false precision.
- Salary should not dominate readiness or match scoring.
- Candidate salary expectations remain private unless explicitly shared.

### 4A.9 Admin and Demo Control Module

**Description:** A lightweight internal module to keep the live demo stable and repeatable.

**Key points to look out for:**

- Judges should see a polished product, not manual database recovery.
- Demo reset should restore known candidate, employer, university, artifact, and taxonomy data.
- Demo fixtures should be realistic but clearly non-sensitive.

**UI should have:**

- Demo mode switcher for candidate, employer, and university views.
- Reset demo data action for local or staging environments.
- Seeded artifact picker.
- Optional debug panel showing extraction source and job status, hidden from normal users.

**Behavior:**

- Reset restores the canonical scenario.
- Seeded artifacts use manifest-backed extraction.
- Debug metadata helps presenters recover without exposing implementation noise to end users.

## 5. Deliverables

### 5.1 Product Deliverables

- Working web application deployed to a live demo URL
- Candidate onboarding flow
- Artifact upload and resilient ingestion flow
- Seeded artifact manifest fallback for live demo reliability
- Evidence claim review interface
- Living CV page with proof links
- Shared marketplace opportunity workspace
- Candidate-facing role readiness matrix
- Career path comparison page
- Employer role creation page
- Employer candidate match audit page
- Candidate interest and employer shortlist workflow
- University readiness dashboard
- Demo seed data for candidates, roles, artifacts, and university cohorts
- Judge-facing walkthrough script
- Project README
- Architecture diagram
- Data model documentation
- AI prompt documentation
- Test coverage for parser fallback, core scoring, claim provenance, and shared readiness matrix logic

### 5.2 Submission Deliverables

- Live demo link
- GitHub repository
- Short pitch deck or PDF
- 2 to 3 minute demo video
- 5 to 7 minute judging demo script
- Technical architecture summary
- Feasibility and limitations statement
- AI tooling disclosure

### 5.3 Demo Deliverables

The demo must show one complete loop:

1. Employer publishes "Junior Product Analyst" opportunity with structured requirements.
2. Candidate opens the shared opportunity card and sees current readiness.
3. Candidate uploads `retail_analytics_project.pdf` or selects the seeded backup artifact if live parsing fails.
4. System extracts claims:
   - Built SQL dashboard
   - Analyzed customer segments
   - Presented findings to stakeholders
5. Candidate accepts two claims and marks one as self-claimed.
6. Living CV updates with provenance labels.
7. The same opportunity card updates its candidate-facing readiness matrix.
8. Candidate sends an "interested" signal for the role.
9. Candidate opens Career Path Navigator.
10. System recommends:
   - Junior Data Analyst
   - Product Analyst
   - CRM Marketing Analyst
11. Employer opens the same Junior Product Analyst role.
12. Candidate appears in the interested and matched shortlist.
13. Employer opens evidence matrix and sees:
   - SQL: strong evidence
   - Dashboarding: artifact-backed evidence
   - Stakeholder communication: self-claimed only
   - Experimentation: missing
14. AI memo summarizes match using only matrix inputs.
15. University dashboard shows aggregate product analytics readiness gap.

## 6. Recommended Tech Stack

### 6.1 Frontend

**Framework:** Next.js with TypeScript

**Styling:** Tailwind CSS

**UI components:** shadcn/ui or custom Tailwind components

**Icons:** lucide-react

**Charts:** Recharts

**State management:** React Query for server state, local component state for UI state

**Async UI rule:** AI extraction must run as a background job. The frontend never waits on a single blocking request for structured claims. React Query polls the extraction job status every 2 seconds while the job is `queued` or `processing`, then invalidates artifact, claim, CV, and opportunity-readiness queries when the job completes.

**Reasoning:** Fast to build, easy to deploy, strong TypeScript support, good for dashboards and demo-quality UX.

### 6.2 Backend

**Option A recommended:** Next.js API routes for MVP

**Option B if team prefers separation:** FastAPI with Python

**Recommendation:** Use Next.js API routes unless the team already has stronger Python backend experience. Simpler deployment matters in a 4-week build.

### 6.3 Database

**Primary DB:** PostgreSQL

**ORM:** Prisma

**Vector search:** pgvector

**Reasoning:** One database can support relational data, deterministic scoring inputs, and semantic retrieval.

### 6.4 File Storage

**MVP:** Supabase Storage, S3-compatible storage, or local storage for development

**Stored files:**

- Uploaded artifacts
- Extracted text
- Generated previews if available

**Boundary:** Do not store sensitive documents unencrypted in production. For demo, use seeded non-sensitive artifacts.

### 6.5 AI Layer

**Primary AI tasks:**

- Artifact text extraction assistance
- Claim extraction
- Claim normalization against a fixed skill taxonomy
- Career path explanation
- Match memo generation

**Recommended model interface:** OpenAI API or equivalent LLM API

**Rule:** AI outputs must be stored with source references and shown as suggestions until accepted. The AI may select skills only from the seeded taxonomy dictionary; unknown skills are stored as candidate suggestions for review, not as canonical skills used in scoring.

### 6.6 Document Parsing

**PDF text extraction:** pdf-parse or similar Node package

**DOCX extraction:** mammoth

**PPTX extraction:** optional for MVP, can be deferred or handled through text export

**Images/screenshots:** OCR can be optional. If included, use a vision-capable model or OCR library.

### 6.7 Deployment

**Frontend/API:** Vercel

**Database/storage:** Supabase

**Alternative:** Render/Fly.io plus managed Postgres

**Demo requirement:** Stable live URL with seeded data reset capability.

## 7. Core Data Model

### 7.1 Entities

**User**

- id
- name
- email
- role: candidate, employer, university_admin
- created_at

**CandidateProfile**

- id
- user_id
- location
- education_level
- institution
- target_locations
- preferred_roles
- salary_expectation_min
- salary_expectation_max
- visibility_status

**Artifact**

- id
- candidate_id
- title
- type: cv, project, certificate, repo_link, portfolio_link, case_study, screenshot, other
- source_url
- storage_path
- extracted_text
- extraction_source: manifest, native_text, pasted_summary, manual_entry, failed
- extraction_status: pending, extracted, needs_review, failed
- demo_manifest_id
- uploaded_at
- shareable

**ExtractionJob**

- id
- artifact_id
- candidate_id
- status: queued, processing, needs_input, completed, failed
- extraction_source: manifest, native_text, pasted_summary, manual_entry, failed
- progress_label
- error_message
- started_at
- completed_at
- created_claim_count

**EvidenceClaim**

- id
- candidate_id
- artifact_id
- claim_text
- normalized_skill_ids
- suggested_skill_names
- role_family_tags
- provenance_status
- confidence
- candidate_status: pending, accepted, edited, rejected
- created_at
- last_verified_at

**Skill**

- id
- slug
- name
- category
- aliases
- parent_skill_id
- level: category, family, specific
- active

**SkillRelation**

- id
- source_skill_id
- target_skill_id
- relation_type: parent, child, adjacent, prerequisite
- scoring_weight

**RoleRequirement**

- id
- role_brief_id
- skill_id
- importance: required, nice_to_have
- minimum_evidence_strength
- display_label

**RoleFamily**

- id
- name
- description
- common_skills

**CareerPath**

- id
- candidate_id
- target_role_family_id
- path_type
- fit_score
- readiness_level
- evidence_summary
- missing_skills
- uncertainty_note

**Employer**

- id
- company_name
- industry
- size
- location

**RoleBrief**

- id
- employer_id
- title
- role_family_id
- location
- salary_min
- salary_max
- requirements
- nice_to_have
- created_at

**OpportunityInteraction**

- id
- role_brief_id
- candidate_id
- candidate_status: viewed, interested, hidden, applied
- employer_status: not_reviewed, shortlisted, contacted, rejected
- last_readiness_score
- last_gap_count
- updated_at

**MatchScore**

- id
- role_brief_id
- candidate_id
- total_score
- skill_evidence_score
- trajectory_score
- adjacent_experience_score
- logistics_score
- growth_signal_score
- preference_score
- explanation_inputs_json
- ai_memo

**UniversityCohort**

- id
- university_name
- cohort_name
- graduation_year
- program_name

**CohortAggregate**

- id
- cohort_id
- role_family_id
- readiness_distribution
- top_missing_skills
- evidence_coverage

### 7.2 Minimum Seed Data

Seed at least:

- 12 candidate profiles
- 6 role briefs
- 20 artifacts
- 60 evidence claims
- 30 skills
- 8 role families
- 3 university cohorts
- 6 cohort aggregate records

## 8. Matching System

### 8.1 Retrieval Step

Use pgvector to retrieve candidates whose evidence claims and profile summaries are semantically close to the role brief.

Inputs:

- Role title
- Role family
- Required skills
- Nice-to-have skills
- Role description

Filters:

- Candidate visibility enabled
- Location compatibility
- Salary compatibility if candidate provided salary preference
- Candidate target role families if provided

Output:

- Candidate candidate pool, not final ranking

### 8.2 Deterministic Scoring

Final ranking uses deterministic feature scoring.

Recommended weights:

- Skill evidence match: 35%
- Trajectory fit: 25%
- Adjacent experience: 15%
- Logistics fit: 10%
- Growth signal: 10%
- Preference alignment: 5%

### 8.3 Skill Evidence Match

Score role requirements against accepted evidence claims using canonical taxonomy skill IDs, not raw LLM-generated skill strings.

**Taxonomy rule:** The LLM is never allowed to create canonical skills during extraction or role parsing. It receives a compact dictionary of allowed skill IDs, names, aliases, parent skills, and adjacent skills. If a concept is not in the dictionary, it is saved as `suggested_skill_names` for human review and excluded from deterministic scoring until mapped.

**Example:** If an artifact mentions "Zero-Knowledge proof system," the extraction prompt should map it to canonical skill `zk_proofs`. If a role asks for "Cryptographic Infrastructure," the role parser should map it to canonical skill `cryptographic_infrastructure` or parent skill `cryptography`. The scoring engine then uses `SkillRelation` rows to recognize that `zk_proofs` is a child or adjacent skill under cryptography instead of comparing strings.

Evidence strength:

- repo_backed: high
- artifact_backed: medium-high
- document_backed: medium
- reviewer_confirmed: high
- self_claimed: low
- missing: zero

Example scoring:

- Required skill with strong evidence: 5
- Required skill with medium evidence: 4
- Required parent skill satisfied by strong child-skill evidence: 4
- Required skill satisfied by configured adjacent skill: 2 to 3 depending on `SkillRelation.scoring_weight`
- Required skill with self-claimed evidence: 2
- Required skill missing but adjacent skill exists: 1
- Required skill missing: 0

Implementation rule:

- Exact canonical skill match scores highest.
- Child-to-parent matches are valid when the role requirement is broad.
- Parent-to-child matches are partial only; broad "cryptography" evidence does not automatically prove "ZK-Proofs."
- Adjacent matches must be explicitly configured in `SkillRelation`.
- Suggested or free-text skills never contribute to deterministic score until mapped to a canonical skill.

### 8.4 Trajectory Fit

Compare current candidate profile and claim history to known role family patterns.

Signals:

- Prior role family overlap
- Education relevance
- Project relevance
- Skill adjacency
- Recent evidence recency

Boundary: Trajectory fit must be explainable as "evidence suggests this direction is plausible," not "this person will succeed."

### 8.5 Adjacent Experience

Reward transferable evidence.

Examples:

- Retail operations plus SQL project can support CRM analyst fit.
- Design portfolio plus user research can support product role fit.
- Finance coursework plus Python notebook can support data analyst fit.

### 8.6 Logistics Fit

Inputs:

- Location
- Work mode preference
- Salary expectation
- Availability

Boundary: Logistics should not dominate skill evidence.

### 8.7 Growth Signal

Inputs:

- Recent artifacts
- Completed learning evidence
- Increasing complexity of projects
- Cross-functional work

Boundary: Avoid personality inference. Do not infer motivation from sensitive or speculative signals.

### 8.8 Preference Alignment

Inputs:

- Candidate target roles
- Candidate industries of interest
- Candidate preferred locations

Boundary: Do not expose candidate preferences to employers unless candidate profile visibility allows it.

## 8A. Skill Taxonomy Management

### 8A.1 Canonical Dictionary

SignalPath must ship with a hardcoded, seeded skill taxonomy. Both candidate claim extraction and employer role parsing use this dictionary.

Minimum taxonomy fields:

- Canonical skill ID
- Display name
- Aliases
- Category
- Parent skill ID
- Short description
- Adjacent skill IDs with scoring weights

Example:

| Canonical ID | Display Name | Parent | Aliases |
| --- | --- | --- | --- |
| `cryptography` | Cryptography | `security_engineering` | crypto, applied cryptography |
| `cryptographic_infrastructure` | Cryptographic Infrastructure | `cryptography` | cryptographic systems, crypto infra |
| `zk_proofs` | Zero-Knowledge Proofs | `cryptography` | ZK proofs, zero knowledge, zk-SNARKs |

### 8A.2 AI Constraint

The LLM receives only a relevant subset of the taxonomy for the artifact or role being parsed. It must return canonical IDs from that subset. Free-form skill names go into `suggested_skill_names` and cannot affect deterministic scoring.

### 8A.3 Taxonomy Review

For the hackathon MVP, taxonomy updates are code/seed-data changes, not live admin actions. This avoids judges seeing inconsistent AI-invented skills and keeps scoring reproducible.

## 9. Auditable Employer Match UI

### 9.1 Candidate Shortlist

Each candidate card shows:

- Name
- Current career shape
- Target role direction
- Total score
- Top 3 evidence-backed reasons
- Top 2 gaps
- Provenance mix

Example:

- 7 accepted evidence claims
- 4 artifact-backed
- 1 repo-backed
- 2 self-claimed

### 9.2 Evidence Matrix

The evidence matrix is the key judge-facing proof that matching is not a black box.

Columns:

- Role requirement
- Evidence found
- Evidence type
- Source artifact
- Requirement score
- Notes

Rows example:

| Role Requirement | Candidate Evidence | Evidence Type | Score |
| --- | --- | --- | --- |
| SQL | Customer dashboard project | artifact_backed | 4/5 |
| Dashboarding | Power BI case study | artifact_backed | 4/5 |
| Stakeholder communication | Presentation claim | self_claimed | 2/5 |
| Experimentation | No evidence | missing | 0/5 |

### 9.3 AI Match Memo

The memo must be generated only from the evidence matrix and score breakdown.

Memo structure:

- Strongest evidence
- Main gaps
- Why the candidate is plausible
- Why confidence is limited
- Recommended next action

Required UI label:

> This summary was generated from the visible evidence matrix and score breakdown. It does not use hidden factors.

### 9.4 Audit Interaction

Employer can click:

- "View proof" to open artifact metadata or preview
- "Why this score?" to view scoring components
- "Missing evidence" to see role gaps

## 10. Candidate UX

### 10.1 Candidate Onboarding

Steps:

1. Create profile
2. Add education and location
3. Select target role interests
4. Upload artifacts
5. Review extracted claims
6. Publish living CV

### 10.2 Evidence Inbox

Purpose: Let candidates control what enters their career graph.

States:

- Queued extraction
- Processing extraction
- Needs input after parser failure
- Claims ready for review
- Accepted
- Edited
- Rejected

State sync behavior:

- Upload returns immediately with an artifact card and extraction job ID.
- The user can keep navigating while extraction runs.
- React Query polls the job until completion or failure.
- Completed extraction inserts pending claim cards without a page refresh.
- If extraction fails, the artifact card remains and shows paste-summary, manual-entry, retry, and demo-artifact actions.

Claim card fields:

- Suggested claim
- Source artifact
- Canonical taxonomy skills
- Suggested unmapped skills, if any
- Provenance status
- Confidence
- Accept button
- Edit button
- Reject button

### 10.3 Living CV

Sections:

- Summary
- Evidence-backed experience
- Projects
- Skills
- Education
- Certifications
- Self-claimed additions

Rules:

- Evidence-backed bullets show proof links.
- Self-claimed bullets are labelled.
- Candidate can hide artifacts from employers.
- Candidate can export or copy CV.

### 10.4 Career Path Navigator

Layout:

- Current career shape panel
- Path comparison table
- Path cards
- Skill gap checklist
- Evidence recommendations

Path card fields:

- Target role
- Path type
- Readiness level
- Fit score
- Supporting evidence
- Missing skills
- Salary range if available
- Uncertainty note

## 11. Employer UX

### 11.1 Employer Onboarding

Steps:

1. Create employer profile
2. Add company details
3. Create role brief
4. Review matched candidates

### 11.2 Role Brief Builder

Fields:

- Role title
- Role family
- Location
- Work mode
- Salary range
- Required skills
- Nice-to-have skills
- Responsibilities
- Seniority level

AI assistance:

- Convert pasted job description into structured role requirements.
- Map role requirements to canonical taxonomy skill IDs.
- Store unmapped requirements as suggestions for employer review, not scoring inputs.
- Let employer edit all extracted requirements.

### 11.3 Match Audit Page

Sections:

- Candidate overview
- Score breakdown
- Evidence matrix
- AI memo
- Gaps
- Outreach action

Outreach boundary:

- Candidate should receive interest request.
- Employer should not receive private contact details unless candidate consents.

## 12. University UX

### 12.1 University Dashboard

Sections:

- Cohort overview
- Readiness by role family
- Top missing skills
- Evidence coverage
- Internship readiness
- Curriculum-market gap insights

### 12.2 Cohort Readiness

Example cards:

- Product Analyst readiness: 42% medium, 18% high
- Software Engineering readiness: 35% medium, 12% high
- Digital Marketing readiness: 51% medium, 20% high

### 12.3 Curriculum Gap Signal

Example insight:

> Students targeting data roles commonly show Python coursework, but only 22% have artifact-backed SQL evidence. Employer roles in the dataset request SQL in 68% of analyst briefs.

Boundary: University dashboard must not expose individual student artifacts unless explicitly authorized in a future version.

## 13. AI Design

### 13.1 AI Responsibilities

AI may:

- Extract candidate claims from artifacts.
- Suggest normalized skills.
- Summarize evidence.
- Draft living CV bullets from accepted claims.
- Explain career path trade-offs.
- Generate employer match memo from visible scoring inputs.

AI may not:

- Invent claims.
- Treat self-claimed data as verified.
- Hide uncertainty.
- Generate final scores independently.
- Use protected attributes for matching.

### 13.2 Prompt Pattern: Claim Extraction

**Live demo requirement:** Claim extraction must not depend on one brittle PDF parser succeeding. The ingestion system uses an extractor ladder and always provides a demo-safe fallback.

**Extractor ladder:**

1. Structured demo artifact manifest, if the artifact is one of the seeded demo files.
2. Native text extraction from PDF, DOCX, or plain text.
3. User-pasted artifact summary if native parsing fails.
4. Manual claim entry with `self_claimed` provenance if no evidence text is available.

**Seeded artifact manifest:** Each demo artifact has a companion JSON record with expected extracted text, expected claims, source title, and provenance status. During the live demo, selecting the seeded artifact uses this manifest as the ground truth. Uploading a new file still attempts parsing, but failure routes to paste/manual fallback instead of blocking the flow.

**Parser failure UI:**

- Show "We could not confidently read this file."
- Offer "Paste project summary" and "Use demo artifact" actions.
- Preserve the uploaded file metadata.
- Do not generate evidence-backed claims unless text or manifest evidence exists.

**Async job lifecycle:**

1. `POST /api/artifacts` uploads the artifact and returns `{ artifactId, extractionJobId }` immediately.
2. The UI shows the artifact card in `queued` state.
3. `POST /api/extraction-jobs/{id}/start` or a server-side worker starts parsing and claim extraction.
4. The UI polls `GET /api/extraction-jobs/{id}` every 2 seconds with React Query while status is `queued` or `processing`.
5. If status becomes `needs_input`, the UI shows paste-summary and manual-entry fallback actions.
6. If status becomes `completed`, the UI invalidates `claims`, `livingCv`, and `opportunityReadiness` queries.
7. If status becomes `failed`, the UI keeps the artifact visible and offers retry, paste summary, manual entry, and seeded demo artifact actions.

**Frontend states:**

- `queued`: "Preparing artifact"
- `processing`: "Reading evidence and drafting claims"
- `needs_input`: "We need a little help reading this file"
- `completed`: "Claims ready for review"
- `failed`: "Extraction failed, but you can continue manually"

Input:

- Artifact title
- Artifact type
- Extracted text, seeded manifest text, or pasted artifact summary
- Extraction source: `manifest`, `native_text`, `pasted_summary`, or `manual_entry`
- Allowed skill taxonomy subset:
  - skill id
  - name
  - aliases
  - parent id
  - category
  - short description

Output JSON:

```json
{
  "extraction_source": "native_text",
  "claims": [
    {
      "claim_text": "Built a customer segmentation dashboard using SQL and Power BI.",
      "skill_ids": ["sql", "power_bi", "customer_segmentation"],
      "suggested_skill_names": [],
      "evidence_quote": "Dashboard segmented customers by purchase frequency and region.",
      "source_span": "page 2, project outcomes section",
      "confidence": 0.82
    },
    {
      "claim_text": "Implemented a Zero-Knowledge proof prototype for identity verification.",
      "skill_ids": ["zk_proofs", "identity_verification"],
      "suggested_skill_names": [],
      "evidence_quote": "Prototype used zero-knowledge proof flow for private identity verification.",
      "source_span": "page 4, technical architecture",
      "confidence": 0.78
    }
  ]
}
```

Rules:

- Store extracted claims as pending until candidate accepts them.
- `skill_ids` must come from the supplied taxonomy dictionary.
- If the model sees a skill-like phrase that is not in the dictionary, place it in `suggested_skill_names`; do not invent a new ID.
- Claims from `manual_entry` default to `self_claimed`.
- Claims from `pasted_summary` default to `artifact_backed` only when attached to an uploaded artifact and clearly supported by the pasted text; otherwise mark as `self_claimed`.
- Claims from `manifest` are acceptable for demo seed data, but the UI should label them as demo artifact extraction.
- If no reliable text exists, do not call the LLM for evidence-backed claims.

### 13.3 Prompt Pattern: Living CV Bullet

Input:

- Accepted claim
- Artifact metadata
- Skills
- Provenance status

Output:

- One concise CV bullet
- No unsupported metrics unless present in evidence

Example:

> Built a customer segmentation dashboard using SQL and Power BI, supported by an uploaded retail analytics project.

### 13.4 Prompt Pattern: Career Path Explanation

Input:

- Candidate accepted claims
- Target role requirements
- Skill gaps
- Scoring breakdown

Output:

- Why this path fits
- What is missing
- What is uncertain
- Suggested next evidence to build

### 13.5 Prompt Pattern: Employer Match Memo

Input:

- Evidence matrix
- Score breakdown
- Candidate profile summary
- Role brief

Output:

- Strongest fit reasons
- Weakest areas
- Confidence statement
- Recommended next action

Rule: The memo must cite evidence row IDs from the matrix.

## 14. Security, Privacy, and Fairness Boundaries

### 14.1 Candidate Consent

- Candidate controls profile visibility.
- Candidate controls artifact shareability.
- Candidate can remove artifacts.
- Candidate can mark claims private.

### 14.2 Employer Access

Employers can see:

- Candidate public profile
- Shareable evidence summaries
- Match score breakdown
- Gaps

Employers cannot see:

- Private artifacts
- Hidden candidate preferences
- Raw uploaded files unless shared

### 14.3 University Access

Universities can see:

- Aggregate cohort readiness
- Aggregate skill gaps
- Aggregate evidence coverage

Universities cannot see:

- Individual student evidence
- Private candidate artifacts
- Employer-specific outreach events unless aggregated

### 14.4 Fairness

Do not use:

- Gender
- Race or ethnicity
- Religion
- Health status
- Family status
- Nationality unless legally required for work eligibility

Use cautiously:

- School name
- Age proxy data
- Graduation year
- Location

Required UI behavior:

- Show why a match was made.
- Allow candidates to correct claims.
- Label uncertainty.

## 15. Feasibility Boundaries

### 15.1 Explicitly Not Building in MVP

- LinkedIn API sync
- Direct university LMS/SIS integrations
- Direct employer HRIS integrations
- Background checks
- Real salary benchmarking at production quality
- Automated legal verification of employment
- Fully automated CV truth validation
- Full ATS replacement
- Mobile native app

### 15.2 What "Actually True" Means in MVP

It means:

- Every CV claim has visible provenance.
- Claims can be traced to artifacts.
- Self-claimed items are labelled.
- AI suggestions are reviewed by the candidate.
- Employers can inspect proof level before trusting a claim.

It does not mean:

- Every claim is legally verified.
- Every artifact is fraud-proof.
- All employment history is independently confirmed.

### 15.3 What "Trajectory Fit" Means in MVP

It means:

- Candidate evidence aligns with role family requirements.
- Skill gaps are shown.
- Similar role patterns are used as guidance.
- Match reasons are visible.

It does not mean:

- Candidate success is guaranteed.
- AI knows the candidate's future.
- The highest score is always the best human choice.

## 16. Implementation Plan

### Week 1: Foundation and Data Model

Goals:

- Set up Next.js app.
- Configure database and Prisma.
- Create seed data.
- Build base navigation and layouts.
- Implement user roles as mocked session states.

Deliverables:

- App shell
- Candidate dashboard shell
- Employer dashboard shell
- University dashboard shell
- Prisma schema
- Seed script
- Basic deployed app

Engineering tasks:

- Initialize Next.js TypeScript project.
- Add Tailwind CSS.
- Add Prisma and PostgreSQL.
- Add seed data for candidates, roles, artifacts, claims, skills, cohorts.
- Seed the canonical skill taxonomy, aliases, parent relationships, and adjacent skill relations.
- Build shared components:
  - AppLayout
  - Sidebar
  - ScoreBadge
  - ProvenanceBadge
  - EvidenceCard
  - EmptyState

### Week 2: Living Portfolio

Goals:

- Build artifact upload flow.
- Implement resilient ingestion with seeded manifest, native parser, paste fallback, and manual fallback.
- Generate pending claims.
- Let candidate accept/edit/reject claims.
- Generate living CV from accepted claims.
- Show candidate-facing readiness against a published opportunity.

Deliverables:

- Evidence Inbox
- Artifact list
- Parser fallback UI
- Claim review workflow
- Living CV page
- Proof link UI
- Candidate opportunity card
- Candidate-facing readiness matrix

Engineering tasks:

- Implement artifact upload endpoint.
- Implement ExtractionJob creation and status endpoints.
- Implement text extraction service.
- Add seeded artifact manifest loader.
- Add parser failure state and paste-summary fallback.
- Implement claim extraction AI call constrained to taxonomy skill IDs.
- Add React Query polling for extraction job status.
- Store extracted claims as pending.
- Build claim review UI.
- Generate CV bullets from accepted claims.
- Add provenance labels.
- Build role opportunity card using the same requirements model employers use.
- Update readiness matrix immediately when candidate accepts new evidence.

### Week 3: Marketplace Matching and Career Paths

Goals:

- Build role brief creation.
- Connect role opportunities to candidate readiness views.
- Implement retrieval and deterministic scoring.
- Build evidence matrix.
- Generate AI match memo from scoring inputs.
- Build Career Path Navigator.
- Implement candidate interest and employer shortlist states.

Deliverables:

- Role brief builder
- Shared opportunity workspace
- Candidate shortlist
- Match audit page
- Evidence matrix
- AI memo
- Career path comparison
- Candidate interest workflow

Engineering tasks:

- Add role requirement parsing from job description.
- Constrain role requirement parsing to the same canonical skill taxonomy.
- Publish role briefs as marketplace opportunity cards.
- Implement vector retrieval for candidate pool.
- Implement deterministic scoring service.
- Persist score breakdown.
- Build evidence matrix UI.
- Add AI memo generation from matrix.
- Implement career path generation from role families and candidate evidence.
- Add OpportunityInteraction records for viewed, interested, shortlisted, and contacted states.
- Ensure candidate-facing readiness matrix and employer-facing evidence matrix use the same scoring rows.

### Week 4: University Dashboard, Polish, Testing, Demo

Goals:

- Build university readiness dashboard.
- Add final visual polish.
- Add tests for core logic.
- Prepare demo script and submission materials.
- Deploy stable demo.

Deliverables:

- University dashboard
- Cohort readiness charts
- Test suite
- README
- Architecture diagram
- Demo video
- Final live URL

Engineering tasks:

- Generate cohort aggregates from seed data.
- Build readiness charts.
- Add tests for:
  - parser fallback paths
  - claim provenance
  - scoring weights
  - evidence matrix generation
  - shared candidate/employer readiness rows
  - AI memo grounding
- Add README.
- Add demo reset seed command.
- Deploy to Vercel and Supabase.

## 17. Testing Plan

### 17.1 Unit Tests

Test:

- Claim provenance assignment
- Extraction source and parser fallback assignment
- Taxonomy-constrained skill extraction rejects invented canonical IDs
- Skill alias mapping resolves known aliases to canonical IDs
- Skill relation scoring handles child, parent, and adjacent skill matches
- Accepted vs rejected claim behavior
- CV bullet generation inputs
- Skill evidence scoring
- Weighted total score calculation
- Missing skill detection
- Evidence matrix row generation
- Candidate readiness matrix and employer evidence matrix row parity
- University aggregate calculation

### 17.2 Integration Tests

Test flows:

- Upload artifact -> extract claims -> accept claim -> living CV updates
- Upload unreadable artifact -> paste summary -> extract claims -> living CV updates
- Select seeded demo artifact -> manifest claims load -> candidate review flow works
- Upload artifact -> extraction job stays processing for 15 seconds -> UI shows progress state without blocking navigation
- Extract "Zero-Knowledge proof system" -> map to `zk_proofs` -> score against broad cryptography role through configured taxonomy relation
- Create role brief -> retrieve candidates -> score candidates -> render matrix
- Candidate opens opportunity -> accepts evidence -> readiness matrix updates -> employer shortlist updates
- Generate AI memo -> memo references matrix rows
- Candidate hides artifact -> employer cannot view artifact details

### 17.3 UI Tests

Test:

- Candidate can complete onboarding.
- Candidate can accept and reject claims.
- Candidate can recover from parser failure without leaving the flow.
- Candidate can leave and return while extraction is processing.
- Candidate sees claims appear when background extraction completes.
- Candidate can open a role opportunity and see readiness gaps.
- Employer can create role brief.
- Employer can inspect evidence matrix.
- Employer can see interested candidates and matched candidates in one role workspace.
- University dashboard renders charts.

### 17.4 Demo Acceptance Criteria

The demo is successful if:

- A judge can see a CV bullet and click through to its evidence.
- A judge can see ingestion continue even when native parsing fails.
- A judge can see the same role opportunity from candidate and employer perspectives.
- A judge can see why a candidate matched a role.
- A judge can distinguish evidence-backed claims from self-claimed claims.
- A judge can see an AI memo and the exact score inputs behind it.
- A judge can understand how university insights are derived from aggregate evidence.

## 18. Judge Criteria Alignment

### 18.1 Product and UX Thinking - 30%

SignalPath solves a real Career OS problem: career navigation lacks evidence and hiring lacks trust. The UX centers on visible proof, path comparison, and candidate agency.

Key proof points:

- Living CV with provenance
- Career path comparison
- Employer evidence matrix
- Honest uncertainty labels

### 18.2 System Design and Integration - 25%

SignalPath integrates candidate evidence, role requirements, matching, and university readiness through a shared evidence graph.

Key proof points:

- Clear data model
- Deterministic scoring layer
- pgvector retrieval as first pass only
- AI explanation grounded in stored evidence

### 18.3 Completeness - 20%

The MVP is end-to-end and demoable.

Key proof points:

- Candidate ingestion
- Living CV generation
- Employer role matching
- University dashboard
- Seed data and live demo URL

### 18.4 AI Craft - 15%

AI is used where it helps: extraction, summarization, normalization, and explanation.

Key proof points:

- AI does not invent scores
- AI suggestions require review
- AI memo is generated from visible matrix inputs
- Uncertainty is surfaced

### 18.5 Code Quality - 10%

The build should be adoption-ready enough for judges to inspect.

Key proof points:

- TypeScript
- Prisma schema
- Clear service boundaries
- Tests for scoring logic
- README and setup instructions

## 19. Demo Script

### 19.1 Opening

"Career OS should not predict someone's future. SignalPath helps users navigate careers from evidence. It turns artifacts into a living CV, then uses that same evidence to power explainable matching and university readiness insights."

### 19.2 Candidate Demo

1. Open candidate dashboard.
2. Upload or select seeded project artifact.
3. Show extracted claims.
4. Accept two claims and reject one.
5. Open Living CV.
6. Click proof link.
7. Show provenance labels.

### 19.3 Career Navigator Demo

1. Open path comparison.
2. Show nearby, stretch, and pivot paths.
3. Open Product Analyst path.
4. Show supporting evidence and missing skills.
5. Point out uncertainty statement.

### 19.4 Employer Demo

1. Open employer dashboard.
2. Create or select Junior Product Analyst role.
3. Open candidate shortlist.
4. Select matched candidate.
5. Show score breakdown.
6. Show evidence matrix.
7. Show AI memo generated from matrix.

### 19.5 University Demo

1. Open university dashboard.
2. Show cohort readiness by role family.
3. Show top missing skills.
4. Show curriculum-market gap insight.

### 19.6 Closing

"The same evidence graph supports all three audiences. Candidates get agency, employers get auditable signal, and universities get aggregate accountability."

## 20. Risks and Mitigations

### 20.1 Risk: AI Extracts Bad Claims

Mitigation:

- Claims remain pending until candidate accepts.
- Evidence quote is shown.
- Candidate can edit or reject.

### 20.2 Risk: Judges Think Verification Is Overclaimed

Mitigation:

- Use "provenance" language, not "fully verified."
- Clearly label self-claimed vs artifact-backed.
- State MVP limitations directly.

### 20.3 Risk: Matching Looks Like Black Box

Mitigation:

- Put evidence matrix beside every AI memo.
- Show score breakdown.
- Make vector retrieval an implementation detail, not final authority.

### 20.4 Risk: Data Feels Fake

Mitigation:

- Use realistic seeded profiles and artifacts.
- Label salary data as prototype if simulated.
- Make demo artifacts inspectable.

### 20.5 Risk: Scope Too Large

Mitigation:

- Prioritize end-to-end loop over deep integrations.
- Keep university dashboard aggregate and simple.
- Keep Fair Pay Engine optional.
- Use mocked auth roles for MVP if needed.

## 21. Success Metrics

### 21.1 Product Metrics

- Candidate can create living CV in under 5 minutes.
- At least 80% of generated CV bullets have evidence provenance.
- Employer can understand top match reasons in under 60 seconds.
- University dashboard can identify top 3 cohort gaps.

### 21.2 Technical Metrics

- Core demo flow completes without manual database edits.
- Score breakdown is reproducible.
- AI memo references visible evidence inputs.
- Tests cover scoring and provenance logic.

### 21.3 Judging Metrics

- Judges understand the product in the first 60 seconds.
- Judges can inspect claim proof.
- Judges can inspect match reasoning.
- Judges do not need to believe in unavailable integrations.

## 22. Repository Structure

Recommended structure:

```text
career-os/
  app/
    candidate/
    employer/
    university/
    api/
  components/
    evidence/
    matching/
    navigation/
    charts/
  lib/
    ai/
    scoring/
    extraction/
    taxonomy/
    prisma/
  prisma/
    schema.prisma
    seed.ts
  public/
    demo-artifacts/
  tests/
    scoring.test.ts
    provenance.test.ts
    matching.test.ts
  README.md
  EXECUTION_PLAN.md
```

## 23. Implementation Priorities

### Must Have

- Candidate artifact ingestion
- Parser fallback flow using seeded manifests and pasted summaries
- Background extraction job status and polling
- Canonical skill taxonomy with aliases and relations
- Claim extraction and review
- Living CV with provenance
- Employer role brief
- Shared opportunity workspace
- Candidate-facing readiness matrix
- Candidate interest workflow
- Deterministic match scoring
- Evidence matrix
- AI match memo grounded in matrix
- University aggregate dashboard
- Seed data
- Live demo

### Should Have

- Career path comparison
- Job description parsing
- CV export
- Candidate profile visibility controls
- Charts for university dashboard
- Tests for core logic

### Could Have

- Reviewer confirmation link
- GitHub repo metadata preview
- Salary range comparison
- OCR for screenshots
- More advanced vector search

### Will Not Have in MVP

- LinkedIn integration
- Direct university system integration
- Employer HRIS integration
- Full authentication and permissions system
- Production fraud detection
- Full ATS workflow

## 24. Final Recommended Build Strategy

Build the smallest complete system that proves the main idea:

1. Evidence becomes claims.
2. Claims become a living CV.
3. Claims power career path navigation.
4. Claims power auditable employer matching.
5. Aggregated claims power university readiness insight.

The strongest demo is not a large feature list. It is a clear proof that Career OS can become a trustworthy career evidence layer across candidates, employers, and universities without relying on fantasy integrations or black-box AI.
