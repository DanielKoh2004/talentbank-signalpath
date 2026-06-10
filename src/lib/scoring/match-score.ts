import { parseJsonArray } from "@/lib/utils";
import {
  computeRoleCoverage,
  type ClaimInput,
  type RequirementInput,
  type RequirementCoverage,
  type SkillRelationInput,
} from "./role-coverage";
import {
  deduplicateClaims,
  capClaimsPerRequirement,
  type ClaimForScoring,
} from "./anti-gaming";

export interface MatchClaimInput extends ClaimForScoring {
  provenanceStatus: string;
  artifactTitle?: string | null;
  sourceUrl?: string | null;
  sourceSpan?: string | null;
}

export interface MatchRequirementInput extends RequirementInput {
  skillName: string;
  skillCategory?: string | null;
}

export interface MatchCandidateProfileInput {
  id: string;
  location?: string | null;
  targetLocations?: string | null;
  preferredRoles?: string | null;
  salaryExpectationMin?: number | null;
  salaryExpectationMax?: number | null;
}

export interface MatchRoleInput {
  id: string;
  title: string;
  location?: string | null;
  workMode?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  roleFamilyName?: string | null;
  roleFamilyCommonSkills?: string[];
}

export interface SkillMetaInput {
  id: string;
  name: string;
  category: string;
}

export interface MatchScoreInput {
  candidate: MatchCandidateProfileInput;
  role: MatchRoleInput;
  claims: MatchClaimInput[];
  requirements: MatchRequirementInput[];
  skillRelations: SkillRelationInput[];
  skills: SkillMetaInput[];
}

export interface EvidenceMatrixClaim {
  id: string;
  claimText: string;
  provenanceStatus: string;
  evidenceQualityScore: number;
  artifactTitle?: string | null;
  sourceUrl?: string | null;
  sourceSpan?: string | null;
}

export interface EvidenceMatrixRow {
  skillId: string;
  skillName: string;
  displayLabel: string;
  importance: "required" | "nice_to_have";
  status: "met" | "partial" | "gap";
  evidenceStrength: number;
  minimumRequired: number;
  matchingClaims: EvidenceMatrixClaim[];
  relationNote?: string;
}

export interface MatchScoreBreakdown {
  roleEvidenceCoverage: number;
  trajectoryFit: number;
  adjacentExperience: number;
  logisticsFit: number;
  growthSignal: number;
  preferenceAlignment: number;
  evidenceQuality: number;
}

export interface MatchScoreResult {
  totalScore: number;
  breakdown: MatchScoreBreakdown;
  evidenceMatrix: EvidenceMatrixRow[];
  coverage: ReturnType<typeof computeRoleCoverage>;
  removedClaimCount: number;
  matrixJson: string;
}

const SCORE_WEIGHTS = {
  roleEvidenceCoverage: 0.35,
  trajectoryFit: 0.25,
  adjacentExperience: 0.15,
  logisticsFit: 0.1,
  growthSignal: 0.1,
  preferenceAlignment: 0.05,
} as const;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round(value: number, decimals = 4): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function claimToCoverageInput(claim: MatchClaimInput): ClaimInput {
  return {
    id: claim.id,
    claimText: claim.claimText,
    normalizedSkillIds: claim.normalizedSkillIds,
    provenanceStatus: claim.provenanceStatus,
    evidenceQualityScore: claim.evidenceQualityScore,
  };
}

function computeTrajectoryFit(
  claims: MatchClaimInput[],
  roleCommonSkills: string[],
): number {
  if (claims.length === 0 || roleCommonSkills.length === 0) return 0;

  const common = new Set(roleCommonSkills);
  let matchedQuality = 0;
  let totalQuality = 0;

  for (const claim of claims) {
    const quality = claim.evidenceQualityScore / 5;
    totalQuality += quality;
    if (claim.normalizedSkillIds.some((skillId) => common.has(skillId))) {
      matchedQuality += quality;
    }
  }

  return clamp01(totalQuality > 0 ? matchedQuality / totalQuality : 0);
}

function computeAdjacentExperience(
  claims: MatchClaimInput[],
  requirements: MatchRequirementInput[],
  relations: SkillRelationInput[],
): number {
  if (claims.length === 0 || requirements.length === 0) return 0;

  const candidateSkills = new Map<string, number>();
  for (const claim of claims) {
    for (const skillId of claim.normalizedSkillIds) {
      candidateSkills.set(
        skillId,
        Math.max(candidateSkills.get(skillId) ?? 0, claim.evidenceQualityScore / 5),
      );
    }
  }

  let scoreSum = 0;
  for (const req of requirements) {
    let best = 0;
    for (const rel of relations) {
      const touchesRequirement =
        rel.sourceSkillId === req.skillId || rel.targetSkillId === req.skillId;
      if (!touchesRequirement) continue;

      const relatedSkillId =
        rel.sourceSkillId === req.skillId ? rel.targetSkillId : rel.sourceSkillId;
      const relatedQuality = candidateSkills.get(relatedSkillId) ?? 0;
      if (relatedQuality === 0) continue;

      const relationMultiplier =
        rel.relationType === "adjacent"
          ? 0.75
          : rel.relationType === "parent"
            ? 0.65
            : 0.35;
      best = Math.max(best, relatedQuality * rel.scoringWeight * relationMultiplier);
    }
    scoreSum += best;
  }

  return clamp01(scoreSum / requirements.length);
}

function computeLogisticsFit(
  candidate: MatchCandidateProfileInput,
  role: MatchRoleInput,
): number {
  const targetLocations = parseJsonArray<string>(candidate.targetLocations).map((v) =>
    v.toLowerCase(),
  );
  const candidateLocation = candidate.location?.toLowerCase();
  const roleLocation = role.location?.toLowerCase();

  if (!roleLocation) return 0.75;
  if (targetLocations.some((loc) => roleLocation.includes(loc.toLowerCase()))) {
    return 1;
  }
  if (candidateLocation && roleLocation.includes(candidateLocation)) {
    return 0.9;
  }
  return 0.55;
}

function computeGrowthSignal(claims: MatchClaimInput[], skills: SkillMetaInput[]): number {
  if (claims.length === 0) return 0;

  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const categories = new Set<string>();
  let highQualityCount = 0;

  for (const claim of claims) {
    if (claim.evidenceQualityScore >= 4) highQualityCount++;
    for (const skillId of claim.normalizedSkillIds) {
      const category = skillMap.get(skillId)?.category;
      if (category) categories.add(category);
    }
  }

  const volume = Math.min(1, claims.length / 8);
  const quality = Math.min(1, highQualityCount / 4);
  const diversity = Math.min(1, categories.size / 4);
  return clamp01(volume * 0.35 + quality * 0.4 + diversity * 0.25);
}

function computePreferenceAlignment(
  candidate: MatchCandidateProfileInput,
  role: MatchRoleInput,
): number {
  let score = 0.4;
  const preferredRoles = parseJsonArray<string>(candidate.preferredRoles).map((roleName) =>
    roleName.toLowerCase(),
  );
  const roleTitle = role.title.toLowerCase();
  const roleFamily = role.roleFamilyName?.toLowerCase() ?? "";

  if (
    preferredRoles.some(
      (preferred) => roleTitle.includes(preferred) || roleFamily.includes(preferred),
    )
  ) {
    score += 0.35;
  }

  const salaryMin = role.salaryMin;
  const salaryMax = role.salaryMax;
  if (salaryMin != null && salaryMax != null) {
    const expectationMin = candidate.salaryExpectationMin ?? salaryMin;
    const expectationMax = candidate.salaryExpectationMax ?? salaryMax;
    const overlaps = salaryMax >= expectationMin && salaryMin <= expectationMax;
    score += overlaps ? 0.25 : 0.05;
  } else {
    score += 0.15;
  }

  return clamp01(score);
}

function computeEvidenceQuality(claims: MatchClaimInput[]): number {
  if (claims.length === 0) return 0;
  const average =
    claims.reduce((sum, claim) => sum + claim.evidenceQualityScore, 0) /
    claims.length;
  return clamp01(average / 5);
}

function buildEvidenceMatrix(
  coverageRows: RequirementCoverage[],
  claims: MatchClaimInput[],
  requirements: MatchRequirementInput[],
  skills: SkillMetaInput[],
): EvidenceMatrixRow[] {
  const claimMap = new Map(claims.map((claim) => [claim.id, claim]));
  const requirementMap = new Map(requirements.map((req) => [req.skillId, req]));
  const skillNameMap = new Map(skills.map((s) => [s.id, s.name]));

  return coverageRows.map((row) => {
    const requirement = requirementMap.get(row.skillId);
    const matchingClaims = row.matchingClaims
      .map((claim) => {
        const fullClaim = claimMap.get(claim.id);
        return {
          id: claim.id,
          claimText: claim.claimText,
          provenanceStatus: claim.provenanceStatus,
          evidenceQualityScore: claim.evidenceQualityScore,
          artifactTitle: fullClaim?.artifactTitle ?? null,
          sourceUrl: fullClaim?.sourceUrl ?? null,
          sourceSpan: fullClaim?.sourceSpan ?? null,
        };
      })
      .sort((a, b) => b.evidenceQualityScore - a.evidenceQualityScore);

    const relatedSkillName = row.adjacencyBonus
      ? skillNameMap.get(row.adjacencyBonus.fromSkillId) ?? row.adjacencyBonus.fromSkillId
      : undefined;

    return {
      skillId: row.skillId,
      skillName: requirement?.skillName ?? row.displayLabel,
      displayLabel: row.displayLabel,
      importance: row.importance,
      status: row.status,
      evidenceStrength: row.evidenceStrength,
      minimumRequired: row.minimumRequired,
      matchingClaims,
      relationNote: relatedSkillName
        ? `Partial credit from related skill: ${relatedSkillName}`
        : undefined,
    };
  });
}

export function computeMatchScore(input: MatchScoreInput): MatchScoreResult {
  const deduped = deduplicateClaims(input.claims);
  const claims = deduped.kept;

  // Apply per-requirement capping: collect only the best claims per skill,
  // max 2 per skill, max 1 per artifact per skill (anti-gaming §5.4).
  const cappedClaimIds = new Set<string>();
  for (const req of input.requirements) {
    const capped = capClaimsPerRequirement(claims, req.skillId, 2);
    for (const c of capped) cappedClaimIds.add(c.id);
  }
  // Keep claims that survived capping OR don't target any requirement skill
  // (so they still contribute to trajectory/growth dimensions).
  const requirementSkillIds = new Set(input.requirements.map((r) => r.skillId));
  const cappedClaims = claims.filter(
    (c) =>
      cappedClaimIds.has(c.id) ||
      !c.normalizedSkillIds.some((sid) => requirementSkillIds.has(sid)),
  );

  const coverageClaims = cappedClaims.map(claimToCoverageInput);
  const coverage = computeRoleCoverage(
    coverageClaims,
    input.requirements,
    input.skillRelations,
  );

  const breakdown: MatchScoreBreakdown = {
    roleEvidenceCoverage: round(coverage.readinessScore),
    trajectoryFit: round(
      computeTrajectoryFit(claims, input.role.roleFamilyCommonSkills ?? []),
    ),
    adjacentExperience: round(
      computeAdjacentExperience(claims, input.requirements, input.skillRelations),
    ),
    logisticsFit: round(computeLogisticsFit(input.candidate, input.role)),
    growthSignal: round(computeGrowthSignal(claims, input.skills)),
    preferenceAlignment: round(computePreferenceAlignment(input.candidate, input.role)),
    evidenceQuality: round(computeEvidenceQuality(claims)),
  };

  const weightedTotal =
    breakdown.roleEvidenceCoverage * SCORE_WEIGHTS.roleEvidenceCoverage +
    breakdown.trajectoryFit * SCORE_WEIGHTS.trajectoryFit +
    breakdown.adjacentExperience * SCORE_WEIGHTS.adjacentExperience +
    breakdown.logisticsFit * SCORE_WEIGHTS.logisticsFit +
    breakdown.growthSignal * SCORE_WEIGHTS.growthSignal +
    breakdown.preferenceAlignment * SCORE_WEIGHTS.preferenceAlignment;

  const evidenceMatrix = buildEvidenceMatrix(
    coverage.requirementCoverage,
    claims,
    input.requirements,
    input.skills,
  );

  const matrixPayload = {
    version: 1,
    roleId: input.role.id,
    candidateId: input.candidate.id,
    totalScore: round(weightedTotal),
    breakdown,
    evidenceMatrix,
    coverageSummary: {
      metCount: coverage.metCount,
      partialCount: coverage.partialCount,
      gapCount: coverage.gapCount,
      totalRequired: coverage.totalRequired,
      totalNiceToHave: coverage.totalNiceToHave,
    },
    audit: {
      removedDuplicateClaims: deduped.removed.length,
      generatedAt: new Date().toISOString(),
    },
  };

  return {
    totalScore: round(weightedTotal),
    breakdown,
    evidenceMatrix,
    coverage,
    removedClaimCount: deduped.removed.length,
    matrixJson: JSON.stringify(matrixPayload),
  };
}
