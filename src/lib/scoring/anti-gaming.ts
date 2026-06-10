// =============================================================================
// Anti-Gaming Rules — Section 5.4
// Deterministic de-duplication and capping. No LLM calls.
// =============================================================================

export interface ClaimForScoring {
  id: string;
  artifactId: string;
  claimText: string;
  normalizedSkillIds: string[]; // already parsed from JSON string
  provenanceStatus: string;
  evidenceQualityScore: number;
  createdAt: Date;
}

export interface DeduplicationResult {
  kept: ClaimForScoring[];
  removed: { claim: ClaimForScoring; reason: string }[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Tokenise a claim into lowercase words for comparison. */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean),
  );
}

/**
 * Jaccard similarity between two word sets.
 * Returns a value in [0, 1] where 1 means identical word sets.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  Array.from(a).forEach((word) => {
    if (b.has(word)) intersection++;
  });
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Threshold above which two claims are considered near-identical. */
const JACCARD_DUPLICATE_THRESHOLD = 0.7;

// ── Exposure-only detection ─────────────────────────────────────────────────

const EXPOSURE_PATTERN =
  /\b(familiar with|knowledge of|understanding of|exposure to|learned about|attended|enrolled|completed course|completed a course)\b/i;

/**
 * Returns true if the claim text indicates exposure-only evidence
 * (e.g. "familiar with …", "attended …") rather than hands-on execution.
 */
export function isExposureOnly(claimText: string): boolean {
  return EXPOSURE_PATTERN.test(claimText);
}

// ── Deduplication ───────────────────────────────────────────────────────────

/**
 * Remove near-identical claims from the same artifact.
 *
 * Two claims are considered duplicates when:
 * 1. They come from the same artifact, AND
 * 2. Their Jaccard word-similarity exceeds 0.7
 *
 * When duplicates are found, the claim with the higher evidence quality
 * score is kept. Ties are broken by recency (newer wins).
 *
 * Claims from different artifacts are never deduplicated against each other
 * — the per-requirement cap handles cross-artifact limits instead.
 */
export function deduplicateClaims(
  claims: ClaimForScoring[],
): DeduplicationResult {
  const kept: ClaimForScoring[] = [];
  const removed: { claim: ClaimForScoring; reason: string }[] = [];

  // Group by artifact to compare within each artifact
  const byArtifact = new Map<string, ClaimForScoring[]>();
  for (const claim of claims) {
    const group = byArtifact.get(claim.artifactId) ?? [];
    group.push(claim);
    byArtifact.set(claim.artifactId, group);
  }

  for (const [, group] of Array.from(byArtifact)) {
    // Sort by quality desc, then recency desc so the best claim is first
    const sorted = [...group].sort((a, b) => {
      if (b.evidenceQualityScore !== a.evidenceQualityScore) {
        return b.evidenceQualityScore - a.evidenceQualityScore;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const accepted: ClaimForScoring[] = [];
    const acceptedTokens: Set<string>[] = [];

    for (const claim of sorted) {
      const tokens = tokenize(claim.claimText);
      const isDuplicate = acceptedTokens.some(
        (existing) => jaccardSimilarity(tokens, existing) > JACCARD_DUPLICATE_THRESHOLD,
      );

      if (isDuplicate) {
        removed.push({
          claim,
          reason: `Near-identical to another claim from same artifact (Jaccard > ${JACCARD_DUPLICATE_THRESHOLD})`,
        });
      } else {
        accepted.push(claim);
        acceptedTokens.push(tokens);
      }
    }

    kept.push(...accepted);
  }

  return { kept, removed };
}

// ── Per-requirement capping ─────────────────────────────────────────────────

/**
 * Cap the number of claims that can satisfy a single role requirement (skill).
 *
 * Rules:
 * - At most `maxPerRequirement` claims per skill (default 2).
 * - Don't let more than one claim from the same artifact satisfy the same
 *   requirement (prevents a single document from dominating a skill).
 * - Prefer claims with higher quality scores, then recency.
 * - Exposure-only claims are deprioritised (sorted after execution claims).
 */
export function capClaimsPerRequirement(
  claims: ClaimForScoring[],
  skillId: string,
  maxPerRequirement: number = 2,
): ClaimForScoring[] {
  // Filter to claims that cover this skill
  const relevant = claims.filter((c) =>
    c.normalizedSkillIds.includes(skillId),
  );

  if (relevant.length === 0) return [];

  // Sort: execution > exposure, then quality desc, then recency desc
  const sorted = [...relevant].sort((a, b) => {
    const aExposure = isExposureOnly(a.claimText) ? 1 : 0;
    const bExposure = isExposureOnly(b.claimText) ? 1 : 0;
    if (aExposure !== bExposure) return aExposure - bExposure;
    if (b.evidenceQualityScore !== a.evidenceQualityScore) {
      return b.evidenceQualityScore - a.evidenceQualityScore;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const result: ClaimForScoring[] = [];
  const seenArtifacts = new Set<string>();

  for (const claim of sorted) {
    if (result.length >= maxPerRequirement) break;

    // At most one claim per artifact per requirement
    if (seenArtifacts.has(claim.artifactId)) continue;

    result.push(claim);
    seenArtifacts.add(claim.artifactId);
  }

  return result;
}
