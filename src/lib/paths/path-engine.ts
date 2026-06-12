// =============================================================================
// Path Engine — Module 3 (Career Path Navigator)
// Generates career path suggestions for a candidate using DB data.
// =============================================================================

import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import {
  computeRoleCoverage,
  type ClaimInput,
  type RequirementInput,
  type SkillRelationInput,
  type RequirementCoverage,
  type RoleCoverageResult,
} from "@/lib/scoring/role-coverage";

// ── Types ───────────────────────────────────────────────────────────────────

/** A single career path card with full context. */
export interface PathCard {
  id: string;
  type: "nearby" | "stretch" | "pivot" | "growth" | "stability";
  label: string;
  roleTitle: string;
  roleFamilyName: string;
  roleFamilyId: string;
  readinessPercent: number;
  whyThisPath: string;
  supportingEvidence: Array<{
    claimText: string;
    skillNames: string[];
    qualityScore: number;
  }>;
  missingSkills: Array<{
    skillId: string;
    skillName: string;
    suggestedAction: string;
  }>;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
    source: string;
  };
  uncertaintyNote: string;
  requirementCoverage: RequirementCoverage[];
}

/** Summary of a candidate's evidence "shape". */
export interface CareerShape {
  topCategories: Array<{
    category: string;
    evidenceCount: number;
    avgQuality: number;
  }>;
  strongestSkills: Array<{
    skillId: string;
    skillName: string;
    maxQuality: number;
    claimCount: number;
  }>;
  qualityDistribution: {
    /** Claims with quality 4-5 */
    high: number;
    /** Claims with quality 2-3 */
    medium: number;
    /** Claims with quality 0-1 */
    low: number;
  };
  totalAcceptedClaims: number;
  totalEvidencedSkills: number;
}

/** Full result from the path engine. */
export interface PathEngineResult {
  careerShape: CareerShape;
  paths: PathCard[];
  candidateId: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Readiness threshold for "nearby" paths. */
const NEARBY_THRESHOLD = 60;
/** Lower bound for "stretch" paths. */
const STRETCH_LOWER = 35;
/** Upper bound for "stretch" paths (exclusive of nearby). */
const STRETCH_UPPER = 59;
/** Standard uncertainty disclaimer. */
const UNCERTAINTY_NOTE =
  "This path is based on your current evidence. Actual job requirements vary by employer.";

// ── Suggested actions ───────────────────────────────────────────────────────

/**
 * Generate a concrete suggested action for a missing skill.
 */
function generateSuggestedAction(skillName: string): string {
  const actions = [
    `Complete a project demonstrating ${skillName}`,
    `Earn a certification in ${skillName}`,
    `Add ${skillName} evidence through coursework or side projects`,
  ];
  // Deterministic pick based on skill name length
  return actions[skillName.length % actions.length];
}

// ── Career shape computation ────────────────────────────────────────────────

/**
 * Build a career-shape summary from accepted claims and skill metadata.
 */
function buildCareerShape(
  claims: ClaimInput[],
  skillMap: Map<string, { name: string; category: string }>,
): CareerShape {
  // Quality distribution
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const claim of claims) {
    if (claim.evidenceQualityScore >= 4) {
      high++;
    } else if (claim.evidenceQualityScore >= 2) {
      medium++;
    } else {
      low++;
    }
  }

  // Per-category aggregation
  const categoryStats = new Map<
    string,
    { count: number; totalQuality: number }
  >();

  // Per-skill aggregation
  const skillStats = new Map<
    string,
    { maxQuality: number; claimCount: number }
  >();

  // Collect unique evidenced skills
  const evidencedSkillIds = new Set<string>();

  for (const claim of claims) {
    for (const skillId of claim.normalizedSkillIds) {
      evidencedSkillIds.add(skillId);

      const skillMeta = skillMap.get(skillId);
      const category = skillMeta?.category ?? "Unknown";

      // Category stats
      const catEntry = categoryStats.get(category) ?? {
        count: 0,
        totalQuality: 0,
      };
      catEntry.count++;
      catEntry.totalQuality += claim.evidenceQualityScore;
      categoryStats.set(category, catEntry);

      // Skill stats
      const skillEntry = skillStats.get(skillId) ?? {
        maxQuality: 0,
        claimCount: 0,
      };
      skillEntry.claimCount++;
      skillEntry.maxQuality = Math.max(
        skillEntry.maxQuality,
        claim.evidenceQualityScore,
      );
      skillStats.set(skillId, skillEntry);
    }
  }

  // Sort categories by evidence count desc
  const topCategories = Array.from(categoryStats.entries())
    .map(([category, stats]) => ({
      category,
      evidenceCount: stats.count,
      avgQuality:
        Math.round((stats.totalQuality / stats.count) * 100) / 100,
    }))
    .sort((a, b) => b.evidenceCount - a.evidenceCount);

  // Sort skills by max quality desc, then claim count desc
  const strongestSkills = Array.from(skillStats.entries())
    .map(([skillId, stats]) => ({
      skillId,
      skillName: skillMap.get(skillId)?.name ?? skillId,
      maxQuality: stats.maxQuality,
      claimCount: stats.claimCount,
    }))
    .sort((a, b) => {
      if (b.maxQuality !== a.maxQuality) return b.maxQuality - a.maxQuality;
      return b.claimCount - a.claimCount;
    });

  return {
    topCategories,
    strongestSkills,
    qualityDistribution: { high, medium, low },
    totalAcceptedClaims: claims.length,
    totalEvidencedSkills: evidencedSkillIds.size,
  };
}

// ── Supporting evidence selection ───────────────────────────────────────────

/**
 * Pick the top N claims that best support a given path, sorted by quality.
 */
function selectSupportingEvidence(
  claims: ClaimInput[],
  coverage: RoleCoverageResult,
  skillMap: Map<string, { name: string; category: string }>,
  limit: number = 3,
): PathCard["supportingEvidence"] {
  // Claims that cover met requirements, sorted by quality desc
  const metSkills = new Set(coverage.strengths);
  const relevant = claims
    .filter((c) =>
      c.normalizedSkillIds.some((sid) => metSkills.has(sid)),
    )
    .sort((a, b) => b.evidenceQualityScore - a.evidenceQualityScore)
    .slice(0, limit);

  return relevant.map((c) => ({
    claimText: c.claimText,
    skillNames: c.normalizedSkillIds.map(
      (sid) => skillMap.get(sid)?.name ?? sid,
    ),
    qualityScore: c.evidenceQualityScore,
  }));
}

// ── Path card generation ────────────────────────────────────────────────────

interface RoleBriefWithContext {
  id: string;
  title: string;
  roleFamilyId: string;
  roleFamilyName: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salarySource: string | null;
  requirements: RequirementInput[];
  coverage: RoleCoverageResult;
}

/**
 * Determine the strongest role family based on claim skill overlap.
 */
function findStrongestRoleFamily(
  claims: ClaimInput[],
  roleFamilies: Array<{
    id: string;
    name: string;
    commonSkills: string[];
  }>,
): string | null {
  const candidateSkills = new Set<string>();
  for (const c of claims) {
    for (const sid of c.normalizedSkillIds) {
      candidateSkills.add(sid);
    }
  }

  let bestId: string | null = null;
  let bestOverlap = 0;

  for (const rf of roleFamilies) {
    const overlap = rf.commonSkills.filter((s) =>
      candidateSkills.has(s),
    ).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestId = rf.id;
    }
  }

  return bestId;
}

/**
 * Build a path card from a role brief and its coverage result.
 */
function buildPathCard(
  type: PathCard["type"],
  label: string,
  brief: RoleBriefWithContext,
  claims: ClaimInput[],
  skillMap: Map<string, { name: string; category: string }>,
  whyThisPath: string,
): PathCard {
  const missingSkills = brief.coverage.requirementCoverage
    .filter((rc) => rc.status === "gap" || rc.status === "partial")
    .map((rc) => ({
      skillId: rc.skillId,
      skillName: skillMap.get(rc.skillId)?.name ?? rc.displayLabel,
      suggestedAction: generateSuggestedAction(
        skillMap.get(rc.skillId)?.name ?? rc.displayLabel,
      ),
    }));

  const supportingEvidence = selectSupportingEvidence(
    claims,
    brief.coverage,
    skillMap,
  );

  const salaryRange =
    brief.salaryMin != null && brief.salaryMax != null
      ? {
          min: brief.salaryMin,
          max: brief.salaryMax,
          currency: brief.salaryCurrency,
          source: brief.salarySource ?? "seeded_estimate",
        }
      : undefined;

  return {
    id: `path_${type}_${brief.id}`,
    type,
    label,
    roleTitle: brief.title,
    roleFamilyName: brief.roleFamilyName,
    roleFamilyId: brief.roleFamilyId,
    readinessPercent: brief.coverage.readinessPercent,
    whyThisPath,
    supportingEvidence,
    missingSkills,
    salaryRange,
    uncertaintyNote: UNCERTAINTY_NOTE,
    requirementCoverage: brief.coverage.requirementCoverage,
  };
}

function requiredCoverageSummary(coverage: RoleCoverageResult) {
  const requiredRows = coverage.requirementCoverage.filter(
    (row) => row.importance === "required",
  );
  const metRequired = requiredRows.filter((row) => row.status === "met").length;
  const partialRequired = requiredRows.filter(
    (row) => row.status === "partial",
  ).length;
  const totalRequired = requiredRows.length;

  return { metRequired, partialRequired, totalRequired };
}

function nearbyReason(coverage: RoleCoverageResult) {
  const { metRequired, partialRequired, totalRequired } =
    requiredCoverageSummary(coverage);
  const partialText =
    partialRequired > 0
      ? `, with partial evidence for ${partialRequired} more`
      : "";
  const scoreContext =
    coverage.readinessPercent < 100
      ? " Readiness is weighted by evidence strength and nice-to-have coverage, not skill presence alone."
      : "";

  return `You fully meet ${metRequired} of ${totalRequired} required skills${partialText}.${scoreContext}`;
}

// ── Synthetic path generation ───────────────────────────────────────────────

/**
 * Generate a synthetic role brief + coverage for a role family that has no
 * real role briefs. Used in the demo to suggest paths beyond the single
 * seeded role.
 */
function buildSyntheticBrief(
  roleFamily: { id: string; name: string; commonSkills: string[] },
  claims: ClaimInput[],
  skillRelations: SkillRelationInput[],
  skillMap: Map<string, { name: string; category: string }>,
): RoleBriefWithContext {
  // Convert common skills into pseudo-requirements
  const requirements: RequirementInput[] = roleFamily.commonSkills
    .slice(0, 6)
    .map((skillId, i) => ({
      skillId,
      importance: i < 3 ? "required" : "nice_to_have",
      minimumEvidenceStrength: 2,
      displayLabel: skillMap.get(skillId)?.name ?? skillId,
    }));

  const coverage = computeRoleCoverage(claims, requirements, skillRelations);

  // Derive a plausible title
  const titleMap: Record<string, string> = {
    rf_data_analysis: "Junior Data Analyst",
    rf_product_management: "Associate Product Manager",
    rf_product_analytics: "Junior Product Analyst",
  };
  const title = titleMap[roleFamily.id] ?? `${roleFamily.name} Role`;

  return {
    id: `synthetic_${roleFamily.id}`,
    title,
    roleFamilyId: roleFamily.id,
    roleFamilyName: roleFamily.name,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: "MYR",
    salarySource: null,
    requirements,
    coverage,
  };
}

// ── Main function ───────────────────────────────────────────────────────────

/**
 * Generate career path suggestions for a candidate.
 *
 * Loads all required data from the database, computes role coverage for each
 * available role brief, and produces 3-5 categorised path cards.
 *
 * Path types:
 * - **nearby**: Readiness ≥ 60%. The most achievable next step.
 * - **stretch**: Readiness 35-59%. Requires meaningful skill-building.
 * - **pivot**: Role in a different family from the candidate's strongest area.
 * - **growth**: Role with higher salary range than current target.
 * - **stability**: Role with high skill match, emphasising job security.
 *
 * @param candidateId - The candidate profile ID to generate paths for.
 * @returns Career shape summary and path cards.
 */
export async function generatePaths(
  candidateId: string,
): Promise<PathEngineResult> {
  // ── 1. Load candidate's accepted claims ─────────────────────────────────
  const rawClaims = await prisma.evidenceClaim.findMany({
    where: {
      candidateId,
      candidateStatus: { in: ["accepted", "edited"] },
    },
  });

  const claims: ClaimInput[] = rawClaims.map((c) => ({
    id: c.id,
    claimText: c.claimText,
    normalizedSkillIds: parseJsonArray<string>(c.normalizedSkillIds),
    provenanceStatus: c.provenanceStatus,
    evidenceQualityScore: c.evidenceQualityScore,
  }));

  // ── 2. Load all skills for name/category lookup ─────────────────────────
  const allSkills = await prisma.skill.findMany({
    where: { active: true },
  });

  const skillMap = new Map<string, { name: string; category: string }>();
  for (const skill of allSkills) {
    skillMap.set(skill.id, { name: skill.name, category: skill.category });
  }

  // ── 3. Load skill relations ─────────────────────────────────────────────
  const rawRelations = await prisma.skillRelation.findMany();
  const skillRelations: SkillRelationInput[] = rawRelations.map((r) => ({
    sourceSkillId: r.sourceSkillId,
    targetSkillId: r.targetSkillId,
    relationType: r.relationType,
    scoringWeight: r.scoringWeight,
  }));

  // ── 4. Load role families ───────────────────────────────────────────────
  const rawFamilies = await prisma.roleFamily.findMany();
  const roleFamilies = rawFamilies.map((rf) => ({
    id: rf.id,
    name: rf.name,
    description: rf.description,
    commonSkills: parseJsonArray<string>(rf.commonSkills),
  }));

  // ── 5. Load role briefs with requirements ───────────────────────────────
  const rawBriefs = await prisma.roleBrief.findMany({
    where: { status: "active" },
    include: { roleRequirements: true },
  });

  // ── 6. Compute coverage for each real role brief ────────────────────────
  const briefsWithCoverage: RoleBriefWithContext[] = rawBriefs.map((rb) => {
    const requirements: RequirementInput[] = rb.roleRequirements.map((rr) => ({
      skillId: rr.skillId,
      importance: rr.importance,
      minimumEvidenceStrength: rr.minimumEvidenceStrength,
      displayLabel: rr.displayLabel ?? rr.skillId,
    }));

    const coverage = computeRoleCoverage(claims, requirements, skillRelations);
    const family = roleFamilies.find((rf) => rf.id === rb.roleFamilyId);

    return {
      id: rb.id,
      title: rb.title,
      roleFamilyId: rb.roleFamilyId ?? "",
      roleFamilyName: family?.name ?? "General",
      salaryMin: rb.salaryMin,
      salaryMax: rb.salaryMax,
      salaryCurrency: rb.salaryCurrency,
      salarySource: rb.salarySource,
      requirements,
      coverage,
    };
  });

  // ── 7. Determine candidate's strongest role family ──────────────────────
  const strongestFamilyId = findStrongestRoleFamily(claims, roleFamilies);

  // ── 8. Load candidate profile for salary expectations ───────────────────
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
  });
  const candidateSalaryMax = profile?.salaryExpectationMax ?? 0;

  // ── 9. Build career shape ───────────────────────────────────────────────
  const careerShape = buildCareerShape(claims, skillMap);

  // ── 10. Generate path cards ─────────────────────────────────────────────
  const paths: PathCard[] = [];
  const usedBriefIds = new Set<string>();

  // 10a. Nearby paths (readiness >= 60%)
  for (const brief of briefsWithCoverage) {
    if (brief.coverage.readinessPercent >= NEARBY_THRESHOLD) {
      const card = buildPathCard(
        "nearby",
        "Ready to Apply",
        brief,
        claims,
        skillMap,
        nearbyReason(brief.coverage),
      );
      paths.push(card);
      usedBriefIds.add(brief.id);
    }
  }

  // 10b. Stretch paths (readiness 35-59%)
  for (const brief of briefsWithCoverage) {
    if (
      !usedBriefIds.has(brief.id) &&
      brief.coverage.readinessPercent >= STRETCH_LOWER &&
      brief.coverage.readinessPercent <= STRETCH_UPPER
    ) {
      const card = buildPathCard(
        "stretch",
        "Stretch Goal",
        brief,
        claims,
        skillMap,
        `You have partial coverage (${brief.coverage.readinessPercent}%). Closing ${brief.coverage.gapCount} skill gap${brief.coverage.gapCount !== 1 ? "s" : ""} would make this achievable.`,
      );
      paths.push(card);
      usedBriefIds.add(brief.id);
    }
  }

  // 10c. Growth paths (higher salary than candidate's expectations)
  for (const brief of briefsWithCoverage) {
    if (
      !usedBriefIds.has(brief.id) &&
      brief.salaryMax != null &&
      brief.salaryMax > candidateSalaryMax &&
      candidateSalaryMax > 0
    ) {
      const card = buildPathCard(
        "growth",
        "Growth Opportunity",
        brief,
        claims,
        skillMap,
        `This role offers a salary range above your current target. Investing in missing skills could unlock higher earning potential.`,
      );
      paths.push(card);
      usedBriefIds.add(brief.id);
    }
  }

  // 10d. Generate synthetic paths for role families without real briefs
  for (const rf of roleFamilies) {
    const hasRealBrief = briefsWithCoverage.some(
      (b) => b.roleFamilyId === rf.id,
    );

    if (!hasRealBrief) {
      const syntheticBrief = buildSyntheticBrief(
        rf,
        claims,
        skillRelations,
        skillMap,
      );

      // Decide path type based on readiness and relation to strongest family
      if (rf.id !== strongestFamilyId) {
        // Pivot: different family from strongest
        const card = buildPathCard(
          "pivot",
          "Career Pivot",
          syntheticBrief,
          claims,
          skillMap,
          `Your skills in ${careerShape.strongestSkills.slice(0, 2).map((s) => s.skillName).join(" and ")} translate to ${rf.name} roles. This represents a shift from your primary area.`,
        );
        paths.push(card);
      } else {
        // Stability: same family, leverage existing strengths
        const card = buildPathCard(
          "stability",
          "Build on Strengths",
          syntheticBrief,
          claims,
          skillMap,
          `Your strongest evidence aligns with ${rf.name}. This path leverages your existing skills for a stable career foundation.`,
        );
        paths.push(card);
      }
    }
  }

  // 10e. If the strongest family has a real brief that was already used,
  //      ensure we still have a stability card
  const hasStability = paths.some((p) => p.type === "stability");
  if (!hasStability && briefsWithCoverage.length > 0) {
    // Use the highest-readiness brief as stability
    const bestBrief = [...briefsWithCoverage].sort(
      (a, b) =>
        b.coverage.readinessPercent - a.coverage.readinessPercent,
    )[0];

    if (!usedBriefIds.has(bestBrief.id) || paths.length < 3) {
      const card = buildPathCard(
        "stability",
        "Build on Strengths",
        bestBrief,
        claims,
        skillMap,
        `Your strongest evidence aligns with ${bestBrief.roleFamilyName}. This path leverages your existing skills for a stable career foundation.`,
      );
      // Avoid exact duplicate IDs
      if (!paths.some((p) => p.id === card.id)) {
        paths.push(card);
      }
    }
  }

  // Sort paths: nearby first, then stretch, stability, growth, pivot
  const typeOrder: Record<PathCard["type"], number> = {
    nearby: 0,
    stretch: 1,
    stability: 2,
    growth: 3,
    pivot: 4,
  };
  paths.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

  // Cap at 5 paths
  const finalPaths = paths.slice(0, 5);

  return {
    careerShape,
    paths: finalPaths,
    candidateId,
  };
}
