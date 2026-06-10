import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import { getRetrievalService } from "@/lib/retrieval";
import {
  computeMatchScore,
  type MatchClaimInput,
  type MatchRequirementInput,
} from "@/lib/scoring/match-score";
import { generateMatchMemo } from "@/lib/scoring/match-memo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const roleBriefId = body.roleBriefId as string | undefined;
    const requestedCandidateIds = Array.isArray(body.candidateIds)
      ? (body.candidateIds as string[])
      : [];

    if (!roleBriefId) {
      return NextResponse.json(
        { error: "roleBriefId is required" },
        { status: 400 },
      );
    }

    const role = await prisma.roleBrief.findUnique({
      where: { id: roleBriefId },
      include: {
        roleFamily: true,
        roleRequirements: {
          include: { skill: true },
        },
        opportunityInteractions: true,
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const retrievalCandidates =
      requestedCandidateIds.length > 0
        ? []
        : await getRetrievalService().retrieveCandidatePool(roleBriefId, 50);

    const candidateIds = Array.from(
      new Set([
        ...requestedCandidateIds,
        ...retrievalCandidates.map((candidate) => candidate.candidateId),
        ...role.opportunityInteractions.map((interaction) => interaction.candidateId),
      ]),
    );

    if (candidateIds.length === 0) {
      return NextResponse.json({ scores: [] });
    }

    const [candidates, skillRelations, skills] = await Promise.all([
      prisma.candidateProfile.findMany({
        where: { id: { in: candidateIds } },
        include: {
          user: true,
          evidenceClaims: {
            where: {
              candidateStatus: { in: ["accepted", "edited"] },
              visibility: { not: "private" },
              artifact: { shareable: true },
            },
            include: { artifact: true },
          },
        },
      }),
      prisma.skillRelation.findMany(),
      prisma.skill.findMany({ where: { active: true } }),
    ]);

    const requirements: MatchRequirementInput[] = role.roleRequirements.map((rr) => ({
      skillId: rr.skillId,
      skillName: rr.skill.name,
      skillCategory: rr.skill.category,
      importance: rr.importance,
      minimumEvidenceStrength: rr.minimumEvidenceStrength,
      displayLabel: rr.displayLabel ?? rr.skill.name,
    }));

    const relationInputs = skillRelations.map((relation) => ({
      sourceSkillId: relation.sourceSkillId,
      targetSkillId: relation.targetSkillId,
      relationType: relation.relationType,
      scoringWeight: relation.scoringWeight,
    }));

    const skillInputs = skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
    }));

    const scores = [];

    for (const candidate of candidates) {
      const claims: MatchClaimInput[] = candidate.evidenceClaims.map((claim) => ({
        id: claim.id,
        artifactId: claim.artifactId,
        claimText: claim.claimText,
        normalizedSkillIds: parseJsonArray<string>(claim.normalizedSkillIds),
        provenanceStatus: claim.provenanceStatus,
        evidenceQualityScore: claim.evidenceQualityScore,
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
        skillRelations: relationInputs,
        skills: skillInputs,
      });

      const memo = await generateMatchMemo({
        candidateName: candidate.user.name,
        roleTitle: role.title,
        totalScore: result.totalScore,
        breakdown: result.breakdown,
        evidenceMatrix: result.evidenceMatrix,
      });
      const matrixJson = JSON.stringify({
        ...JSON.parse(result.matrixJson),
        memoSource: memo.source,
      });

      const stored = await prisma.matchScore.upsert({
        where: {
          roleBriefId_candidateId: {
            roleBriefId,
            candidateId: candidate.id,
          },
        },
        create: {
          roleBriefId,
          candidateId: candidate.id,
          totalScore: result.totalScore,
          roleEvidenceCoverage: result.breakdown.roleEvidenceCoverage,
          trajectoryFit: result.breakdown.trajectoryFit,
          adjacentExperience: result.breakdown.adjacentExperience,
          logisticsFit: result.breakdown.logisticsFit,
          growthSignal: result.breakdown.growthSignal,
          preferenceAlignment: result.breakdown.preferenceAlignment,
          evidenceQuality: result.breakdown.evidenceQuality,
          matrixJson,
          aiMemo: memo.memo,
        },
        update: {
          totalScore: result.totalScore,
          roleEvidenceCoverage: result.breakdown.roleEvidenceCoverage,
          trajectoryFit: result.breakdown.trajectoryFit,
          adjacentExperience: result.breakdown.adjacentExperience,
          logisticsFit: result.breakdown.logisticsFit,
          growthSignal: result.breakdown.growthSignal,
          preferenceAlignment: result.breakdown.preferenceAlignment,
          evidenceQuality: result.breakdown.evidenceQuality,
          matrixJson,
          aiMemo: memo.memo,
          computedAt: new Date(),
        },
      });

      await prisma.opportunityInteraction.upsert({
        where: {
          roleBriefId_candidateId: {
            roleBriefId,
            candidateId: candidate.id,
          },
        },
        create: {
          roleBriefId,
          candidateId: candidate.id,
          candidateStatus: "viewed",
          employerStatus: "not_reviewed",
          lastReadinessScore: result.coverage.readinessScore,
          lastGapCount: result.coverage.gapCount,
        },
        update: {
          lastReadinessScore: result.coverage.readinessScore,
          lastGapCount: result.coverage.gapCount,
        },
      });

      scores.push({
        id: stored.id,
        candidateId: candidate.id,
        candidateName: candidate.user.name,
        totalScore: result.totalScore,
        breakdown: result.breakdown,
        evidenceMatrix: result.evidenceMatrix,
        aiMemo: memo.memo,
        memoSource: memo.source,
        matrixJson,
        computedAt: stored.computedAt,
      });
    }

    scores.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({ scores });
  } catch (error) {
    console.error("Failed to compute matching:", error);
    return NextResponse.json(
      { error: "Failed to compute matching" },
      { status: 500 },
    );
  }
}
