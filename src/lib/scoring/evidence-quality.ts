// =============================================================================
// Evidence Quality Scoring — Section 5.3
// Deterministic scoring: pure functions, no LLM calls.
// =============================================================================

export interface EvidenceQualityInput {
  provenanceStatus: string;
  claimText: string;
  sourceSpan?: string | null;
  artifactType?: string;
}

export interface EvidenceQualityResult {
  score: number;
  modifiers: string[];
}

// ── Base scores by provenance type ──────────────────────────────────────────

const BASE_SCORES: Record<string, number> = {
  repo_backed: 5,
  reviewer_confirmed: 5,
  artifact_backed: 4, // project with source span; downgraded below for generic
  document_backed: 3,
  self_claimed: 1,
  unmapped: 0,
};

// ── Pattern matchers ────────────────────────────────────────────────────────

/** Action verbs indicating the candidate directly produced output. */
const ACTION_VERB_PATTERN =
  /\b(built|created|designed|implemented|developed|executed)\b/i;

/** Generic / passive phrasing indicating weak evidence. */
const GENERIC_CLAIM_PATTERN =
  /\b(familiar with|knowledge of|understanding of|exposure to|learned about)\b/i;

/** Syllabus / course-outline indicators in artifactType. */
const SYLLABUS_PATTERN = /syllabus|course.?outline|attendance/i;

/** Exposure-only indicators: attended, enrolled, completed a course. */
const EXPOSURE_ONLY_PATTERN =
  /\b(attended|enrolled|completed course|completed a course)\b/i;

/**
 * Minimum source-span length to count as "specific and inspectable".
 * Short spans like "pg. 3" don't prove much.
 */
const MIN_SPECIFIC_SPAN_LENGTH = 20;

// ── Scoring function ────────────────────────────────────────────────────────

/**
 * Compute a deterministic evidence-quality score (0-5) for a single claim.
 *
 * The score starts from a base determined by `provenanceStatus`, then
 * modifiers are applied for claim specificity, source span quality,
 * generic phrasing, syllabus derivation, and exposure-only evidence.
 *
 * All scores are clamped to the [0, 5] range.
 */
export function computeEvidenceQuality(
  input: EvidenceQualityInput,
): EvidenceQualityResult {
  const { provenanceStatus, claimText, sourceSpan, artifactType } = input;
  const modifiers: string[] = [];

  // 1. Base score
  let score = BASE_SCORES[provenanceStatus] ?? 0;

  // For artifact_backed but generic document (not a project with source span),
  // downgrade to 2.
  if (
    provenanceStatus === "artifact_backed" &&
    (!sourceSpan || sourceSpan.trim().length === 0)
  ) {
    score = 2;
    modifiers.push("artifact_backed without source span → base 2");
  }

  // 2. +1 if claim text contains action verbs (demonstrates direct output)
  if (ACTION_VERB_PATTERN.test(claimText)) {
    score += 1;
    modifiers.push("+1 action verb (demonstrates output)");
  }

  // 3. +1 if source span is specific and inspectable
  if (sourceSpan && sourceSpan.trim().length > MIN_SPECIFIC_SPAN_LENGTH) {
    score += 1;
    modifiers.push("+1 specific source span");
  }

  // 4. -1 if claim is generic / passive
  if (GENERIC_CLAIM_PATTERN.test(claimText)) {
    score -= 1;
    modifiers.push("-1 generic/passive phrasing");
  }

  // 5. -1 if artifact type is syllabus / course outline / attendance
  if (artifactType && SYLLABUS_PATTERN.test(artifactType)) {
    score -= 1;
    modifiers.push("-1 syllabus/course-outline source");
  }

  // 6. -2 if claim proves exposure but not execution
  if (EXPOSURE_ONLY_PATTERN.test(claimText)) {
    score -= 2;
    modifiers.push("-2 exposure only (no execution evidence)");
  }

  // Clamp to [0, 5]
  score = Math.max(0, Math.min(5, score));

  return { score, modifiers };
}
