import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import {
  computeMatchScore,
  type MatchClaimInput,
  type MatchRequirementInput,
  type MatchScoreResult,
} from "@/lib/scoring/match-score";

export interface DeltaSummary {
  baselineScore: number;
  liveScore: number;
  scoreDelta: number;
  closedSkillIds: string[];
  stillMissingSkillIds: string[];
  newEvidenceClaimIds: string[];
  triggerReasons: string[];
  generatedAt: string;
}

interface LiveMatchSnapshot {
  result: MatchScoreResult;
  candidateName: string;
  roleTitle: string;
  roleEmployerId: string;
  roleFamilyId: string | null;
}

function percentFromScore(score: number): number {
  return Math.round(score * 100);
}

function getMissingSkillIds(result: MatchScoreResult): string[] {
  return result.evidenceMatrix
    .filter((row) => row.status !== "met")
    .map((row) => row.skillId);
}

async function computeLiveMatch(
  roleBriefId: string,
  candidateId: string,
): Promise<LiveMatchSnapshot | null> {
  const [role, candidate, skillRelations, skills] = await Promise.all([
    prisma.roleBrief.findUnique({
      where: { id: roleBriefId },
      include: {
        roleFamily: true,
        roleRequirements: { include: { skill: true } },
      },
    }),
    prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        user: true,
        evidenceClaims: {
          where: { candidateStatus: { in: ["accepted", "edited"] } },
          include: { artifact: true },
        },
      },
    }),
    prisma.skillRelation.findMany(),
    prisma.skill.findMany({ where: { active: true } }),
  ]);

  if (!role || !candidate) return null;

  const requirements: MatchRequirementInput[] = role.roleRequirements.map((rr) => ({
    skillId: rr.skillId,
    skillName: rr.skill.name,
    skillCategory: rr.skill.category,
    importance: rr.importance,
    minimumEvidenceStrength: rr.minimumEvidenceStrength,
    displayLabel: rr.displayLabel ?? rr.skill.name,
  }));

  const claims: MatchClaimInput[] = candidate.evidenceClaims.map((claim) => ({
    id: claim.id,
    artifactId: claim.artifactId,
    claimText: claim.claimText,
    normalizedSkillIds: parseJsonArray<string>(claim.normalizedSkillIds),
    provenanceStatus: claim.provenanceStatus,
    evidenceQualityScore: claim.evidenceQualityScore,
    confidence: claim.confidence,
    createdAt: claim.createdAt,
    artifactTitle: claim.artifact.title,
    sourceUrl: claim.artifact.sourceUrl,
    sourceSpan: claim.sourceSpan,
  }));

  const result = computeMatchScore({
    candidate: {
      id: candidate.id,
      location: candidate.location,
      targetLocations: candidate.targetLocations,
      preferredRoles: candidate.preferredRoles,
      salaryExpectationMin: candidate.salaryExpectationMin,
      salaryExpectationMax: candidate.salaryExpectationMax,
    },
    role: {
      id: role.id,
      title: role.title,
      location: role.location,
      workMode: role.workMode,
      salaryMin: role.salaryMin,
      salaryMax: role.salaryMax,
      roleFamilyName: role.roleFamily?.name ?? null,
      roleFamilyCommonSkills: parseJsonArray<string>(role.roleFamily?.commonSkills),
    },
    claims,
    requirements,
    skillRelations: skillRelations.map((relation) => ({
      sourceSkillId: relation.sourceSkillId,
      targetSkillId: relation.targetSkillId,
      relationType: relation.relationType,
      scoringWeight: relation.scoringWeight,
    })),
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
    })),
  });

  return {
    result,
    candidateName: candidate.user.name,
    roleTitle: role.title,
    roleEmployerId: role.employerId,
    roleFamilyId: role.roleFamilyId,
  };
}

export async function snapshotRejectedCandidate(input: {
  candidateId: string;
  roleBriefId: string;
  rejectionReason?: string | null;
}) {
  const live = await computeLiveMatch(input.roleBriefId, input.candidateId);
  if (!live) {
    throw new Error("Unable to compute baseline snapshot");
  }

  const baselineScore = percentFromScore(live.result.totalScore);
  const baselineMissingSkillIds = getMissingSkillIds(live.result);
  const rejectionReason =
    input.rejectionReason?.trim() ||
    "Marked not ready after employer review.";

  return prisma.$transaction(async (tx) => {
    const context = await tx.rejectedCandidateContext.upsert({
      where: {
        candidateId_roleBriefId: {
          candidateId: input.candidateId,
          roleBriefId: input.roleBriefId,
        },
      },
      create: {
        candidateId: input.candidateId,
        roleBriefId: input.roleBriefId,
        rejectionReason,
        missingSkills: JSON.stringify(baselineMissingSkillIds),
        scoreAtRejection: live.result.totalScore,
        baselineScore,
        baselineMissingSkillIds: JSON.stringify(baselineMissingSkillIds),
        baselineMatrixJson: live.result.matrixJson,
      },
      update: {
        rejectionReason,
        missingSkills: JSON.stringify(baselineMissingSkillIds),
        scoreAtRejection: live.result.totalScore,
        baselineScore,
        baselineMissingSkillIds: JSON.stringify(baselineMissingSkillIds),
        baselineMatrixJson: live.result.matrixJson,
        rejectedAt: new Date(),
      },
    });

    await tx.opportunityInteraction.upsert({
      where: {
        roleBriefId_candidateId: {
          roleBriefId: input.roleBriefId,
          candidateId: input.candidateId,
        },
      },
      create: {
        roleBriefId: input.roleBriefId,
        candidateId: input.candidateId,
        candidateStatus: "interested",
        employerStatus: "rejected",
        lastReadinessScore: live.result.coverage.readinessScore,
        lastGapCount: live.result.coverage.gapCount,
      },
      update: {
        employerStatus: "rejected",
        lastReadinessScore: live.result.coverage.readinessScore,
        lastGapCount: live.result.coverage.gapCount,
      },
    });

    return {
      context,
      baselineScore,
      baselineMissingSkillIds,
      candidateName: live.candidateName,
      roleTitle: live.roleTitle,
    };
  });
}

function buildDraftMessage(input: {
  candidateName: string;
  roleTitle: string;
  summary: DeltaSummary;
}) {
  const closed =
    input.summary.closedSkillIds.length > 0
      ? ` Closed gaps: ${input.summary.closedSkillIds.join(", ")}.`
      : "";

  return [
    `Hi ${input.candidateName},`,
    `We reviewed your profile again for ${input.roleTitle}. Your evidence-backed match has improved from ${input.summary.baselineScore}% to ${input.summary.liveScore}%.${closed}`,
    "Would you be open to reconnecting about this role?",
  ].join("\n\n");
}

async function hasActiveConsent(input: {
  candidateId: string;
  employerId: string;
  roleFamilyId: string | null;
}) {
  const now = new Date();
  const consent = await prisma.candidateRetentionConsent.findFirst({
    where: {
      candidateId: input.candidateId,
      consentStatus: "active",
      expiresAt: { gt: now },
      OR: [{ employerId: input.employerId }, { employerId: null }],
      AND: [
        {
          OR: [
            { roleFamilyId: input.roleFamilyId },
            { roleFamilyId: null },
          ],
        },
      ],
    },
  });

  return consent;
}

export async function scanReEngagement(input: {
  employerId?: string | null;
  roleBriefId?: string | null;
}) {
  const contexts = await prisma.rejectedCandidateContext.findMany({
    where: {
      ...(input.roleBriefId ? { roleBriefId: input.roleBriefId } : {}),
      ...(input.employerId
        ? { roleBrief: { employerId: input.employerId } }
        : {}),
    },
    include: {
      candidate: { include: { user: true } },
      roleBrief: true,
    },
  });

  const events = [];

  for (const context of contexts) {
    const baselineScore =
      context.baselineScore ?? Math.round((context.scoreAtRejection ?? 0) * 100);
    const baselineMissingSkillIds = parseJsonArray<string>(
      context.baselineMissingSkillIds ?? context.missingSkills,
    );

    const live = await computeLiveMatch(context.roleBriefId, context.candidateId);
    if (!live) continue;

    const consent = await hasActiveConsent({
      candidateId: context.candidateId,
      employerId: live.roleEmployerId,
      roleFamilyId: live.roleFamilyId,
    });
    if (!consent) continue;

    const liveScore = percentFromScore(live.result.totalScore);
    if (liveScore < baselineScore + 10) continue;

    const stillMissingSkillIds = getMissingSkillIds(live.result);
    const stillMissing = new Set(stillMissingSkillIds);
    const closedSkillIds = baselineMissingSkillIds.filter(
      (skillId) => !stillMissing.has(skillId),
    );
    const newEvidenceClaimIds = live.result.evidenceMatrix
      .filter((row) => closedSkillIds.includes(row.skillId))
      .flatMap((row) => row.matchingClaims.map((claim) => claim.id));

    const summary: DeltaSummary = {
      baselineScore,
      liveScore,
      scoreDelta: liveScore - baselineScore,
      closedSkillIds,
      stillMissingSkillIds,
      newEvidenceClaimIds: Array.from(new Set(newEvidenceClaimIds)),
      triggerReasons: ["score_delta_threshold"],
      generatedAt: new Date().toISOString(),
    };

    const deltaExplanation = `${live.candidateName} improved from ${baselineScore}% to ${liveScore}% for ${live.roleTitle}.`;
    const draftMessage = buildDraftMessage({
      candidateName: live.candidateName,
      roleTitle: live.roleTitle,
      summary,
    });

    const existingPending = await prisma.reEngagementEvent.findFirst({
      where: {
        candidateId: context.candidateId,
        roleBriefId: context.roleBriefId,
        status: "pending",
      },
    });

    const payload = {
      previousScore: baselineScore / 100,
      currentScore: liveScore / 100,
      deltaExplanation,
      deltaSummaryJson: JSON.stringify(summary),
      triggerType: "new_evidence",
      draftMessage,
    };

    const event = existingPending
      ? await prisma.reEngagementEvent.update({
          where: { id: existingPending.id },
          data: payload,
        })
      : await prisma.reEngagementEvent.create({
          data: {
            candidateId: context.candidateId,
            roleBriefId: context.roleBriefId,
            status: "pending",
            ...payload,
          },
        });

    events.push(event);
  }

  return events;
}
