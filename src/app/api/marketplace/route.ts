import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import { computeRoleCoverage } from "@/lib/scoring/role-coverage";

const SHORTLIST_THRESHOLD_PERCENT = 75;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "candidateId is required" },
      { status: 400 },
    );
  }

  try {
    const [roles, claims, skillRelations, interactions] = await Promise.all([
      prisma.roleBrief.findMany({
        where: { status: "active" },
        include: {
          roleRequirements: {
            include: { skill: true },
          },
          roleFamily: true,
          _count: {
            select: {
              opportunityInteractions: true,
              matchScores: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.evidenceClaim.findMany({
        where: {
          candidateId,
          candidateStatus: { in: ["accepted", "edited"] },
        },
      }),
      prisma.skillRelation.findMany(),
      prisma.opportunityInteraction.findMany({
        where: { candidateId },
      }),
    ]);

    const parsedClaims = claims.map((claim) => ({
      id: claim.id,
      claimText: claim.claimText,
      normalizedSkillIds: parseJsonArray<string>(claim.normalizedSkillIds),
      provenanceStatus: claim.provenanceStatus,
      evidenceQualityScore: claim.evidenceQualityScore,
    }));

    const relationInputs = skillRelations.map((relation) => ({
      sourceSkillId: relation.sourceSkillId,
      targetSkillId: relation.targetSkillId,
      relationType: relation.relationType,
      scoringWeight: relation.scoringWeight,
    }));

    const interactionMap = new Map(
      interactions.map((interaction) => [interaction.roleBriefId, interaction]),
    );

    const marketplaceRoles = roles.map((role) => {
      const requirements = role.roleRequirements.map((rr) => ({
        skillId: rr.skillId,
        importance: rr.importance,
        minimumEvidenceStrength: rr.minimumEvidenceStrength,
        displayLabel: rr.displayLabel ?? rr.skill.name,
      }));
      const coverage = computeRoleCoverage(
        parsedClaims,
        requirements,
        relationInputs,
      );
      const missingRequiredSkills = coverage.requirementCoverage
        .filter((row) => row.importance === "required" && row.status !== "met")
        .map((row) => ({
          skillId: row.skillId,
          skillName: row.displayLabel,
          status: row.status,
          evidenceStrength: row.evidenceStrength,
          minimumRequired: row.minimumRequired,
        }));
      const interaction = interactionMap.get(role.id);

      return {
        id: role.id,
        title: role.title,
        employerId: role.employerId,
        employerName:
          role.employerId === "user_dataco_hr" ? "DataCo" : "This employer",
        roleFamilyId: role.roleFamilyId,
        roleFamilyName: role.roleFamily?.name ?? null,
        location: role.location,
        workMode: role.workMode,
        salaryMin: role.salaryMin,
        salaryMax: role.salaryMax,
        salaryCurrency: role.salaryCurrency,
        salarySource: role.salarySource,
        description: role.description,
        status: role.status,
        createdAt: role.createdAt,
        requirements: role.roleRequirements.map((rr) => ({
          id: rr.id,
          skillId: rr.skillId,
          skillName: rr.skill.name,
          skillCategory: rr.skill.category,
          importance: rr.importance,
          minimumEvidenceStrength: rr.minimumEvidenceStrength,
          displayLabel: rr.displayLabel,
        })),
        interactionCount: role._count.opportunityInteractions,
        matchCount: role._count.matchScores,
        readinessScore: coverage.readinessScore,
        readinessPercent: coverage.readinessPercent,
        gapCount: coverage.gapCount,
        thresholdPercent: SHORTLIST_THRESHOLD_PERCENT,
        pointsToThreshold: Math.max(
          0,
          SHORTLIST_THRESHOLD_PERCENT - coverage.readinessPercent,
        ),
        missingRequiredSkills,
        topGapSkill: missingRequiredSkills[0] ?? null,
        candidateStatus: interaction?.candidateStatus ?? "viewed",
        employerStatus: interaction?.employerStatus ?? "not_reviewed",
        appliedAt: interaction?.appliedAt ?? null,
      };
    }).sort((a, b) => {
      if (b.readinessPercent !== a.readinessPercent) {
        return b.readinessPercent - a.readinessPercent;
      }

      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return NextResponse.json({
      thresholdPercent: SHORTLIST_THRESHOLD_PERCENT,
      roles: marketplaceRoles,
    });
  } catch (error) {
    console.error("Failed to load marketplace:", error);
    return NextResponse.json(
      { error: "Failed to load marketplace" },
      { status: 500 },
    );
  }
}
