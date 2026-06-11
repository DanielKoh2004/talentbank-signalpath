# SignalPath — Pitch Deck

---

## Slide 1 — Problem Hook

**Headline:** Hiring tools break at two points — and both are structural. SignalPath is built to fix exactly these two.

Every résumé-based hiring tool fails the same way: it can't verify what goes *in*, and it can't explain what comes *out*.

| | The gap | The cost | What SignalPath does instead |
|---|---|---|---|
| **GAP 1 — INPUT** | **Can't verify the résumé.** Tools match keywords against claims they can never check. | **56% of applicants admit lying on their résumé** *(StandOut-CV, 2024)* — while **27M+ qualified "hidden workers"** are filtered out for keyword mismatch *(HBS / Accenture)*. Inflation is rewarded; real skill is missed. | Builds an **evidence graph from the candidate's own artifacts**. Every claim is provenance-labelled — artifact-backed or self-claimed. Wording can't fake it. |
| **GAP 2 — OUTPUT** | **Can't explain the score.** AI ranks in a black box — no reasoning, no recourse. | **88% of employers** know their ATS screens out good people and can't see why *(HBS / Accenture)*; opacity is where bias hides — see active discrimination lawsuits *(Workday, 2024)*. | **Deterministic, auditable score** — every point traces to a visible evidence row the candidate can inspect and appeal. The AI explains; it never invents the number. |

> **The problem isn't too little AI. It's that the AI can't verify what goes in, and hides how it decides.** SignalPath organizes evidence instead of guessing fit — verified on the way in, auditable on the way out.

---

## Slide 2 — Real World Scenario

**Headline:** Meet Aisha.

Aisha is a University of Malaya graduate targeting a Junior Product Analyst role at DataCo.

- Her CV says she has "data analysis experience" and "stakeholder communication skills."
- DataCo's ATS gives her a 43% match score. No reason given.
- Aisha doesn't know which skill is missing. DataCo doesn't know if the 43% is meaningful.
- Both move on. The match that could have worked never happens.

**This plays out millions of times a year across Asia.**

Aisha actually built a SQL customer segmentation dashboard. She just never had a way to prove it credibly — and no system was designed to surface that proof to an employer.

---

## Slide 3 — What the ATS Is Missing

**Headline:** The ATS can't check if the résumé is true — and can't explain the score it gives.

Every ATS runs the same pipeline. It breaks at **both ends**: it trusts claims it never verifies, then ranks them in a box no one can see into.

```
   Résumé  ──▶  Keyword filter  ──▶  Ranking & score  ──▶  Recruiter decision
   (claims)          │                      │
                     ▼                      ▼
   ┌────────────────────────────┐   ┌────────────────────────────┐
   │  GAP 1 — INPUT             │   │  GAP 2 — OUTPUT            │
   │  Is any of this true?      │   │  Why this score?           │
   │  Where's the proof?        │   │  Which evidence moved it?  │
   │                            │   │  Can the candidate appeal? │
   │   ⟶ [ NEVER VERIFIED ] ⟵   │   │   ⟶ [ BLACK BOX ] ⟵        │
   └────────────────────────────┘   └────────────────────────────┘
```

**Gap 1 — it can't verify the input.** The ATS matches keywords against claims it cannot check. A polished, inflated résumé scores *higher* than an honest one with real work behind it. It rewards wording, not proof.

**Gap 2 — it can't explain the output.** Even when it ranks, the score is a black box: no reasoning, no trace to evidence, no recourse. The candidate never learns *why*; the employer can't *defend* the decision.

**Why both gaps are urgent, not cosmetic:**

- **56% of applicants admit lying on their résumé** — and the ATS has no mechanism to catch it (Gap 1). *(StandOut-CV, 2024)*
- **27M+ qualified "hidden workers"** are rejected for keyword mismatch, never told why (Gap 1 + Gap 2). *(HBS / Accenture)*
- The black box is where **bias hides**: no reasoning means no recourse — and active discrimination lawsuits *(Workday, 2024)* (Gap 2).

> **Unverified going in, unexplained coming out.** SignalPath closes both: proof on the input, an auditable score on the output.

---

## Slide 4 — SignalPath Fills the Empty Box

**Headline:** We don't replace the ATS. We replace how it decides who's qualified — by verifying the evidence first.

Same pipeline. Same two boxes. **But now they're filled** — SignalPath drops the evidence layer into exactly the slots the ATS left empty:

```
   Résumé + artifacts  ──▶  Keyword filter  ──▶  Ranking & score  ──▶  Recruiter decision
   (now proof-backed)            │                      │
                                 ▼                      ▼
   ┌────────────────────────────────┐   ┌────────────────────────────────┐
   │  GAP 1 — INPUT      ✓ ADDRESSED │   │  GAP 2 — OUTPUT     ✓ ADDRESSED │
   │                                │   │                                │
   │  ✓ AI extracts claims, never    │   │  ✓ Deterministic score —        │
   │    invents them                │   │    same inputs, same result    │
   │  ✓ Candidate reviews & accepts  │   │  ✓ Every point traces to a      │
   │  ✓ Each bullet labelled         │   │    visible proof row           │
   │    artifact-backed / self-claim │   │  ✓ Candidate can see & appeal   │
   │                                │   │                                │
   │   ⟶ [ VERIFIED PROOF ] ⟵        │   │   ⟶ [ AUDITABLE SCORE ] ⟵       │
   └────────────────────────────────┘   └────────────────────────────────┘
        Living Portfolio                     Evidence matrix + AI memo
```

**The candidate builds the proof; the employer matches on it — same evidence graph.** That single shared graph fixes both ends: an inflated claim has nowhere to hide when every bullet is labelled *(Gap 1)*, and the score is no longer a black box because every point points back to a visible proof row the candidate can see and appeal *(Gap 2)*.

**What we replace:** the matching-and-scoring brain — the broken, black-box part.
**What we leave alone:** the rest of the pipeline. We integrate with it, not rip it out.

This rests on one position, and it's the opposite of every hiring AI on the market:

> **AI should not predict a person's future. It should organize their evidence.**
> Proof over prediction. Auditable over opaque. Candidate-owned over platform-locked.

- AI extracts claims from artifacts — it does not invent them.
- Candidates review every claim before it enters their profile.
- Employers see requirement-by-requirement evidence, not a ranking.
- The score is explainable because the evidence is visible. **Always.**

---

## Slide 5 — The Solution

**Headline:** One evidence graph, three audiences — here's how the whole system flows.

Everything starts when a candidate turns their work into proof. **That same evidence graph then powers all three sides** — nothing is re-entered, re-scored, or hidden. Read down each lane; read across at "same evidence" to see how one graph serves everyone.

```
      CANDIDATE                    EMPLOYER                   UNIVERSITY
         │                            │                          │
   Upload artifacts            Publish role brief         (receives signal only)
         │                            │                          │
   AI extracts claims                 │                          │
   (never invents)                    │                          │
         │                            │                          │
   Review & accept ──┐                │                          │
         │           │                │                          │
   Living CV +       └──▶  SAME EVIDENCE GRAPH  ◀──┐              │
   provenance labels        (no re-entry)         │              │
         │                            │            │             │
   Career Path Navigator       Deterministic       │             │
   (gap checklist)             match score +        │             │
         │                     evidence matrix      │             │
         │                            │             │             │
   Marketplace:                AI memo (cites       │      Aggregate readiness
   see readiness vs role       proof rows)          │      by role family
         │                            │             │             │
   Close a gap →               Reject? → snapshot    │      Top missing
   score moves                 stored                │      evidence-backed skills
         │                            │             │             │
         └──▶  add evidence ──▶ Re-engagement: ──────┘      Curriculum gap cards
               (A/B project)   delta recomputed,           (no individual data)
                               candidate resurfaces              │
                                      │                          │
                                      ▼                          ▼
                            Auditable hire decision    Cohort insight, privacy-safe
```

**One graph in. Three audiences out. Every arrow is the *same* evidence — that's why a candidate's accepted claim, an employer's score, and a university's cohort signal can never disagree.**

### Module Summary

| Module | Who it serves | Core value |
|---|---|---|
| Living Portfolio | Candidate | CV that updates from proof, not memory |
| Career Path Navigator | Candidate | Realistic next paths with gap checklist |
| Career Marketplace | Both | Shared opportunity workspace |
| Smart Talent Matching | Employer | Auditable evidence matrix + AI memo |
| Talent Re-Engagement | Employer | Surfaces improved candidates automatically |
| Adaptive Readiness Profile | University | Cohort gaps without individual exposure |

---

## Slide 6 — See It Working (Live Demo)

**Headline:** This isn't a mockup. Here's the real product doing exactly what we just described.

> **▶ [Recorded walkthrough — 90 sec]** *(embed video here)*
> Aisha uploads a project → AI extracts claims → she accepts them → the employer opens the evidence matrix → the AI memo cites the proof rows. One unbroken take, real app, live data.

**If video can't play — the three screens that prove it (fallback):**

**6a · Evidence Matrix (employer view)** — *matching is not a black box:*

| Role Requirement | Candidate Evidence | Evidence Type | Score |
|---|---|---|---|
| SQL | Customer segmentation dashboard | artifact_backed | 4 / 5 |
| Dashboarding | Power BI retail case study | artifact_backed | 4 / 5 |
| Stakeholder communication | Presentation claim | self_claimed | 2 / 5 |
| Experimentation / A-B testing | No evidence found | missing | 0 / 5 |

*Every row is inspectable — click "View proof" to open the source artifact.*

**6b · Living CV with proof links (candidate view):**

> "Built a customer segmentation dashboard using SQL and Power BI."
> `[artifact-backed]` → retail_analytics_project.pdf, page 2

*Self-claimed bullets are visually separated and labelled — no inflated language without evidence.*

**6c · AI Match Memo:**

> "Aisha shows strong artifact-backed evidence for SQL and dashboarding (rows 1–2). Stakeholder communication is self-claimed only (row 3). Experimentation is missing entirely (row 4). Recommended next step: request A/B testing evidence before advancing."
>
> *Generated from the visible evidence matrix — it does not use hidden factors.*

**Try it yourself:** `https://talentbank-signalpath.vercel.app/marketplace`

---

## Slide 7 — Why This Matters to TalentBank

**Headline:** TalentBank's pipeline problem is an evidence problem — and it's the empty box from Slide 3.

TalentBank connects emerging talent to employers. The bottleneck isn't candidate volume — it's signal quality. Every gap below is a symptom of the same missing answer: *can this person do the job, and where's the proof?*

| The current state | What TalentBank needs | Where SignalPath answers it |
|---|---|---|
| CVs with unverifiable claims | Evidence-backed skill proof | Living Portfolio + provenance labels |
| Black-box ATS rankings | Auditable match reasoning | Deterministic score + evidence matrix |
| Rejected candidates lost forever | Re-engagement when candidates improve | Re-engagement delta engine |
| No view into graduate readiness gaps | University-level cohort insight | Adaptive Readiness dashboard |

SignalPath closes exactly these gaps — **not as a replacement for TalentBank, but as the evidence layer underneath the pipeline it already runs.**

**The re-engagement engine alone recovers candidates that would otherwise disappear from the pipeline** — you just saw it run live. The rest of this deck shows where it sits in the market, the scale of the problem in Malaysia, and where it grows next.

---

## Slide 8 — Where We Stand vs. The Market

**Headline:** Well-funded players already attack this. None can reach our corner — and the reason is structural.

We're not first to the problem. But every category solves *half* of it and is architecturally blocked from the other half:

```
              AUDITABLE  ▲
                         │                          ★ SIGNALPATH
                         │                      candidate-owned proof,
        (open quadrant — │                      every score row inspectable
         nobody here)    │
                         │   Jobscan · Teal            TestGorilla · Vervoe
                         │   ($, résumé optimizers)    ($142+/mo, assessments)
   ──────────────────────┼──────────────────────────────────────────────▶
   UNVERIFIED CLAIMS     │                              VERIFIED CAPABILITY
                         │   Legacy ATS · LinkedIn     HireVue · Eightfold
                         │   (incumbents)              ($35k+/yr enterprise)
                         │
              BLACK BOX  ▼
```

| Competitor | What they do well | Why they *can't* reach our corner |
|---|---|---|
| **Legacy ATS · LinkedIn** | Scale, distribution, incumbency | Match keywords, hide the ranking — broken on *both* axes |
| **HireVue · Eightfold** *($35k+/yr)* | Real skill signal, enterprise reach | Score stays a **black box**; Eightfold's data is *scraped* about the candidate — hence its **2026 consent lawsuit** |
| **TestGorilla · Vervoe** *($142+/mo)* | Genuine skill verification | Verify via *their own proprietary test* — candidate **doesn't own it**, can't reuse it, pass/fail still opaque |
| **Jobscan · Teal** | Transparent, candidate-friendly | Only help you *beat* the keyword filter — they **verify nothing** |

**The structural lock-out:** every competitor's verification (where they have it) lives in *their* system, not the candidate's — and their scoring stays opaque. **SignalPath is the only model where the proof comes from the candidate's *own artifacts*, the candidate *owns and reviews* it, and *every point of the score is inspectable.*** That combination — verified **and** auditable **and** candidate-owned — is the corner no incumbent can pivot into without rebuilding their core.

---

## Slide 9 — The Impact in Malaysia

**Headline:** This isn't a niche problem. It's 1.6 million Malaysian graduates — and the official data names exactly the gap we close.

The Malaysian labour market doesn't have a *jobs* problem. Unemployment is only **3.2%**. It has a **matching** problem — skilled people landing in the wrong roles because their capability was never credibly surfaced. That's the verification gap, at national scale:

```
   5.98 million          ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●  graduates in Malaysia (2024)
                         │
                         ▼
   32.2% underemployed   ●●●●●●●●●  →  1.60 MILLION graduates working
                                        BELOW their qualifications
                         │
                         ▼
   Aged 24 & under:      ●●●●●●●●●●●●●●●●●●  66% underemployed
   (fresh grads —                          two in three fresh grads
    SignalPath's core user)                are mis-matched, not jobless
```

**Why these specific numbers are *our* numbers, not generic gloom:**

| Malaysian stat (DOSM, 2024) | What it means | What SignalPath does about it |
|---|---|---|
| **1.60M graduates underemployed (32.2%)** | Skilled people in the wrong roles — capability never surfaced | Evidence graph surfaces *provable* skill, so the right match becomes findable |
| **66% of under-24 graduates underemployed** | The fresh-grad cohort — exactly who TalentBank serves — is worst hit | Living Portfolio lets a fresh grad *prove* readiness without a track record |
| **Skill-related underemployment *rising* even as unemployment falls** | The market is getting *more* mismatched, not less | Verified + auditable matching attacks mismatch directly |

> **3.2% can't find a job. 32.2% are in the wrong one.** SignalPath is built for the second number — the one Malaysia's own statistics call the real problem, and the one no ATS, résumé tool, or black-box AI is solving.

**Conservative reach for TalentBank:** even capturing **1%** of that underemployed cohort is **16,000 graduates** given a credible, evidence-backed path to the right role — every one of them a candidate who currently disappears into the mismatch.

---

## Slide 10 — The Storyline (End-to-End Demo Loop)

**Headline:** One loop. Three audiences. No hand-waving.

### The Aisha → DataCo → UM Loop

**Step 1 — Candidate**
- Aisha uploads her retail analytics project PDF
- SignalPath extracts 3 claims: SQL dashboard, customer segmentation, stakeholder presentation
- Aisha accepts 2 claims, marks 1 as self-claimed
- Living CV updates with proof links and provenance badges

**Step 2 — Marketplace (the candidate's moment of agency)**
- Aisha opens the DataCo "Junior Product Analyst" opportunity
- She sees her readiness matrix against *this exact role*: SQL strong, experimentation missing
- **The system tells her what would get her hired, in her own words:** "You're one artifact away. Add evidence of A/B testing and you cross DataCo's threshold for this role."
- This is the difference between SignalPath and an ATS: a rejection elsewhere is a dead end; here it's a *checklist she owns*. She decides what to build next — the system just made the path legible.
- She signals interest — DataCo is notified

**Step 3 — Employer**
- DataCo opens the role workspace
- Aisha appears in the shortlist with a score breakdown
- Employer opens evidence matrix → sees exactly why she matched and where she fell short
- AI memo is generated from the matrix — no hidden inputs

**Step 4 — Rejection & Re-Engagement**
- DataCo rejects Aisha; a baseline snapshot is stored
- Aisha later adds an A/B testing project
- Re-engagement engine computes the delta: experimentation gap is now closed
- HR receives a flagged re-engagement draft — Aisha is worth a second look

**Step 5 — University**
- University of Malaya dashboard shows: 0% of the 2025 Product Analytics cohort have artifact-backed experimentation evidence
- 61% of Product Analyst role briefs in the marketplace require it
- Curriculum gap is visible at cohort scale — no individual student data exposed

> **Same evidence graph. Candidate gets agency. Employer gets signal. University gets accountability.**

---

## Slide 11 — AI Craft

**Headline:** AI does the hard parts. Humans stay in control.

### What the AI does

| Task | How |
|---|---|
| Artifact extraction | Reads uploaded PDFs, project docs, certificates → outputs structured evidence claims |
| Skill normalization | Maps extracted phrases to a canonical skill taxonomy — never invents new skill IDs |
| Living CV bullets | Drafts one-line bullets from accepted claims — no unsupported metrics |
| Career path explanation | Explains why a path fits, what is missing, what is uncertain |
| Match memo | Summarizes the evidence matrix in plain language — cites row IDs |

### What the AI does not do

- It does not generate the match score — the score is deterministic, not LLM-produced
- It does not invent claims — extraction outputs are pending until the candidate accepts
- It does not hide uncertainty — every memo includes a confidence statement
- It does not use protected attributes — no gender, race, religion, or health signals

### The two-stage matching architecture

```
Semantic retrieval → candidate pool (broad)        [pgvector-ready; mock retrieval in this POC]
        ↓
Deterministic scoring against canonical skill taxonomy → ranked shortlist (auditable)   [live]
        ↓
AI memo generated from score rows → explanation (grounded, not invented)                [live]
```

The retrieval stage is built against a swappable interface — the POC ships a mock retriever; the pgvector implementation drops in without touching the scoring or memo stages. **The auditable parts — scoring and the grounded memo — are real and running in the demo.**

**Skill taxonomy rule:** The LLM receives only a relevant subset of canonical skill IDs. If it sees a skill-like phrase not in the dictionary, it goes into `suggested_skill_names` for human review — it never affects the score.

---

## Slide 12 — The Ecosystem We're Building (Roadmap)

**Headline:** What you saw today is the foundation. Here's the ecosystem it grows into.

Everything in the demo is the **trust layer**. Once it exists, it compounds across all three audiences — this isn't a feature list, it's a foundation that keeps extending.

```
   ┌─────────────── NOW · the POC you can click today ───────────────┐
   │                                                                 │
   │   Living Portfolio · Evidence Matching · Re-Engagement ·         │
   │   Adaptive Readiness                                             │
   │   → one evidence graph, three audiences                         │
   │                                                                 │
   └─────────────────────────────┬───────────────────────────────────┘
                                 │  builds on
                                 ▼
   ┌──────────── NEXT 12 MONTHS · depth on every side ───────────────┐
   │                                                                 │
   │   CANDIDATE          EMPLOYER              UNIVERSITY            │
   │   ─────────          ────────              ──────────           │
   │   Fair-pay signals   Retention signals     Curriculum feedback  │
   │                      Onboarding predictor   Internship market    │
   │                      HRIS / ATS sync        Lifelong-learn wallet│
   │                                                                 │
   └─────────────────────────────┬───────────────────────────────────┘
                                 │  unlocks the premium layer
                                 ▼
   ┌──────────── THE TRUST LAYER · cryptographic (the moat) ─────────┐
   │                                                                 │
   │   Verifiable credentials · blind / zero-knowledge matching ·    │
   │   PDPA consent layer                                            │
   │   → arrives on top of provenance we already built, not day one  │
   │                                                                 │
   └─────────────────────────────────────────────────────────────────┘
```

**Why this sequence is defensible:** the **cryptographic trust layer** (verifiable credentials, blind matching) is the bold bet — and it lands in Year 1 *on a working product with real users*, not as Day 1 infrastructure, so TalentBank never has to rebuild on crypto from scratch. **Employer depth** turns a hackathon win into a *paying* product. The **university loop** is the long-game moat: once graduate outcomes feed back into curriculum, the institution depends on the platform.

---

## Slide 13 — Why It Compounds (The Two Loops)

**Headline:** We didn't build a feature. We built the first turn of a loop that gets stronger every cycle.

```
   OUTER LOOP — the ecosystem flywheel
   ════════════════════════════════════

        Candidate builds evidence
                  │
                  ▼
        Employer hires & re-engages
                  │
                  ▼
        University closes curriculum gap
                  │
                  ▼
        Better-prepared next cohort
                  │
                  └──────────────▶ (back to stronger candidates)


   INNER LOOP — the employer never leaves
   ═══════════════════════════════════════

        Employer hires
                  │
                  ▼
        Company goals / strategy shift
                  │
                  ▼
        Matching + re-engagement re-run
        against the new need
                  │
                  ▼
        Candidates resurface (new fit)
                  │
                  └──────────────▶ (back to next hire)
```

**Two reinforcing loops.** The **outer loop** is the ecosystem flywheel — candidate, employer, and university each make the next turn richer. The **inner loop** keeps the employer engaged *continuously*: every hire shifts company strategy, which re-triggers matching against the same evidence graph — value without re-entering data.

> **The thesis in one sentence:** better-evidenced candidates → more credible, continuously-refreshed hiring → universities close the curriculum gap → a better-prepared next cohort → repeat. Every turn makes the evidence graph richer and the platform harder to leave — **and TalentBank is positioned at its centre.**

---

## Slide 14 — Closing

**Headline:** Career OS shouldn't be a black box. SignalPath is the evidence layer that makes it trustworthy.

### What we built (working POC, end-to-end)

- A clickable three-sided web app: candidate → employer → university
- Deterministic, auditable match scoring — the same inputs always produce the same score
- AI extraction with a hard guardrail: the model can never invent a skill or move the score
- Re-engagement engine that recovers pipeline candidates after rejection
- University readiness dashboard with zero individual data exposure
- Live demo with seeded scenario: Aisha / DataCo / University of Malaya

*POC scope, stated plainly: auth, pgvector retrieval, and HRIS sync are designed-for but not wired in this build. Everything in the demo loop is real.*

### Live demo

```
Live demo:  https://talentbank-signalpath.vercel.app/marketplace
Demo control: https://talentbank-signalpath.vercel.app/demo-control → launch any scene
```

*Open the marketplace link to land mid-story, or use demo-control to drive the Aisha → DataCo → University of Malaya loop from any starting scene.*

### What's honest about the MVP

- Provenance-backed, not legally verified — every claim traces to an artifact, not a background check
- LinkedIn sync, HRIS integration, and fraud detection are out of scope for this build
- Salary data is labelled as estimated where not sourced from a reliable dataset

### The ask

> TalentBank's platform sits at exactly the intersection SignalPath is designed for: emerging talent, employer trust, and university readiness gaps.
>
> The evidence layer is built. The loop works. Let's put it to use.
