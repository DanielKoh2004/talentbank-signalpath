// =============================================================================
// Role Coverage Scoring — Module 3 (Career Path Navigator)
// Deterministic scoring: pure functions, no LLM calls, no DB access.
// =============================================================================

// ── Types ───────────────────────────────────────────────────────────────────

/** A single claim passed in by the caller (already parsed from DB). */
export interface ClaimInput {
  id: string;
  claimText: string;
  normalizedSkillIds: string[];
  provenanceStatus: string;
  evidenceQualityScore: number;
}

/** A single role requirement passed in by the caller. */
export interface RequirementInput {
  skillId: string;
  importance: string; // 'required' | 'nice_to_have'
  minimumEvidenceStrength: number;
  displayLabel: string;
}

/** A skill relation passed in by the caller. */
export interface SkillRelationInput {
  sourceSkillId: string;
  targetSkillId: string;
  relationType: string; // 'parent' | 'adjacent' | 'prerequisite'
  scoringWeight: number;
}

/** Coverage detail for a single requirement. */
export interface RequirementCoverage {
  skillId: string;
  displayLabel: string;
  importance: "required" | "nice_to_have";
  status: "met" | "partial" | "gap";
  evidenceStrength: number; // 0-5
  minimumRequired: number;
  matchingClaims: Array<{
    id: string;
    claimText: string;
    provenanceStatus: string;
    evidenceQualityScore: number;
  }>;
  adjacencyBonus?: { fromSkillId: string; weight: number };
}

/** Overall result of role-coverage computation. */
export interface RoleCoverageResult {
  /** Weighted readiness score, 0-1 */
  readinessScore: number;
  /** readinessScore as a rounded percentage, 0-100 */
  readinessPercent: number;
  /** Per-requirement coverage details */
  requirementCoverage: RequirementCoverage[];
  metCount: number;
  partialCount: number;
  gapCount: number;
  totalRequired: number;
  totalNiceToHave: number;
  /** Skill IDs where max evidence quality ≥ 3 */
  strengths: string[];
  /** Skill IDs with no evidence at all */
  gaps: string[];
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Weight multiplier for 'required' requirements in readiness average. */
const REQUIRED_WEIGHT = 1.0;
/** Weight multiplier for 'nice_to_have' requirements in readiness average. */
const NICE_TO_HAVE_WEIGHT = 0.5;
/** Max quality score (evidence quality is 0-5). */
const MAX_QUALITY = 5;
/** Partial-credit multiplier when evidence exists but is below minimum. */
const PARTIAL_CREDIT_MULTIPLIER = 0.5;
/** Credit multiplier for adjacency bonus (gap skill has adjacent evidence). */
const ADJACENCY_CREDIT_MULTIPLIER = 0.3;
/** Minimum quality score to consider a skill a "strength". */
const STRENGTH_THRESHOLD = 3;

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Find claims that directly cover a given skill ID.
 */
function findDirectMatches(
  claims: ClaimInput[],
  skillId: string,
): ClaimInput[] {
  return claims.filter((c) => c.normalizedSkillIds.includes(skillId));
}

/**
 * Find the best adjacency/parent relation for a skill that has no direct
 * evidence, returning partial credit info if the *related* skill IS evidenced.
 *
 * We look for relations where the gap skill is either source or target,
 * and check if the other side has evidence.
 */
function findAdjacencyBonus(
  skillId: string,
  claims: ClaimInput[],
  relations: SkillRelationInput[],
): { fromSkillId: string; weight: number; evidenceStrength: number } | null {
  // Collect all related skills and their weights
  const candidates: Array<{
    relatedSkillId: string;
    weight: number;
  }> = [];

  for (const rel of relations) {
    if (
      rel.relationType === "adjacent" ||
      rel.relationType === "parent"
    ) {
      if (rel.sourceSkillId === skillId) {
        candidates.push({
          relatedSkillId: rel.targetSkillId,
          weight: rel.scoringWeight,
        });
      } else if (rel.targetSkillId === skillId) {
        candidates.push({
          relatedSkillId: rel.sourceSkillId,
          weight: rel.scoringWeight,
        });
      }
    }
  }

  // Find the best adjacent skill that IS evidenced
  let best: {
    fromSkillId: string;
    weight: number;
    evidenceStrength: number;
  } | null = null;

  for (const candidate of candidates) {
    const matches = findDirectMatches(claims, candidate.relatedSkillId);
    if (matches.length > 0) {
      const maxQuality = Math.max(
        ...matches.map((m) => m.evidenceQualityScore),
      );
      const effectiveStrength =
        (maxQuality / MAX_QUALITY) *
        candidate.weight *
        ADJACENCY_CREDIT_MULTIPLIER *
        MAX_QUALITY;

      if (!best || effectiveStrength > best.evidenceStrength) {
        best = {
          fromSkillId: candidate.relatedSkillId,
          weight: candidate.weight,
          evidenceStrength: effectiveStrength,
        };
      }
    }
  }

  return best;
}

// ── Main function ───────────────────────────────────────────────────────────

/**
 * Compute how well a candidate's evidence claims cover a role's requirements.
 *
 * This is a **pure function** — it takes pre-loaded, pre-parsed data and
 * returns a deterministic result. No database calls, no side effects.
 *
 * Algorithm:
 * 1. For each requirement, find direct claim matches by skill ID.
 * 2. If no direct match, check adjacent/parent skills via SkillRelation
 *    (with scoringWeight discount).
 * 3. Calculate evidence strength as the max evidenceQualityScore of matches.
 * 4. Compare against minimumEvidenceStrength to classify as met/partial/gap.
 * 5. Compute weighted average readiness across all requirements.
 *
 * @param claims - Candidate's accepted evidence claims (already parsed)
 * @param requirements - Role's skill requirements
 * @param skillRelations - Skill-to-skill relations for adjacency bonuses
 * @returns Detailed coverage result
 */
export function computeRoleCoverage(
  claims: ClaimInput[],
  requirements: RequirementInput[],
  skillRelations: SkillRelationInput[],
): RoleCoverageResult {
  const requirementCoverage: RequirementCoverage[] = [];
  const strengths: string[] = [];
  const gaps: string[] = [];

  let metCount = 0;
  let partialCount = 0;
  let gapCount = 0;
  let totalRequired = 0;
  let totalNiceToHave = 0;

  // Weighted-score accumulators for readiness
  let weightedScoreSum = 0;
  let weightSum = 0;

  for (const req of requirements) {
    const importance = req.importance as "required" | "nice_to_have";
    const weight =
      importance === "required" ? REQUIRED_WEIGHT : NICE_TO_HAVE_WEIGHT;

    if (importance === "required") {
      totalRequired++;
    } else {
      totalNiceToHave++;
    }

    // Step 2a: Find direct claim matches
    const directMatches = findDirectMatches(claims, req.skillId);

    let evidenceStrength = 0;
    let status: "met" | "partial" | "gap" = "gap";
    let adjacencyBonus: RequirementCoverage["adjacencyBonus"] | undefined;
    const matchingClaims: RequirementCoverage["matchingClaims"] = [];

    if (directMatches.length > 0) {
      // Step 2b-c: Calculate evidence strength from direct matches
      evidenceStrength = Math.max(
        ...directMatches.map((c) => c.evidenceQualityScore),
      );

      matchingClaims.push(
        ...directMatches.map((c) => ({
          id: c.id,
          claimText: c.claimText,
          provenanceStatus: c.provenanceStatus,
          evidenceQualityScore: c.evidenceQualityScore,
        })),
      );

      // Step 2d-f: Compare against minimum
      if (evidenceStrength >= req.minimumEvidenceStrength) {
        status = "met";
        metCount++;
      } else {
        status = "partial";
        partialCount++;
      }
    } else {
      // Step 2b (no direct match): Check adjacency bonus
      const bonus = findAdjacencyBonus(req.skillId, claims, skillRelations);
      if (bonus) {
        adjacencyBonus = {
          fromSkillId: bonus.fromSkillId,
          weight: bonus.weight,
        };
        evidenceStrength = Math.min(
          MAX_QUALITY,
          Math.round(bonus.evidenceStrength * 100) / 100,
        );

        // Adjacency can at best make this partial, never fully met
        if (evidenceStrength > 0) {
          status = "partial";
          partialCount++;
        } else {
          status = "gap";
          gapCount++;
        }
      } else {
        status = "gap";
        gapCount++;
      }
    }

    // Track strengths and gaps
    if (evidenceStrength >= STRENGTH_THRESHOLD) {
      strengths.push(req.skillId);
    }
    if (status === "gap") {
      gaps.push(req.skillId);
    }

    // Step 3: Compute weighted score contribution
    let reqScore: number;
    if (status === "met") {
      reqScore = evidenceStrength / MAX_QUALITY;
    } else if (status === "partial") {
      reqScore = (evidenceStrength / MAX_QUALITY) * PARTIAL_CREDIT_MULTIPLIER;
    } else {
      reqScore = 0;
    }

    weightedScoreSum += reqScore * weight;
    weightSum += weight;

    requirementCoverage.push({
      skillId: req.skillId,
      displayLabel: req.displayLabel || req.skillId,
      importance,
      status,
      evidenceStrength,
      minimumRequired: req.minimumEvidenceStrength,
      matchingClaims,
      ...(adjacencyBonus ? { adjacencyBonus } : {}),
    });
  }

  // Step 4: Overall readiness score
  const readinessScore = weightSum > 0 ? weightedScoreSum / weightSum : 0;
  const readinessPercent = Math.round(readinessScore * 100);

  return {
    readinessScore,
    readinessPercent,
    requirementCoverage,
    metCount,
    partialCount,
    gapCount,
    totalRequired,
    totalNiceToHave,
    strengths,
    gaps,
  };
}
