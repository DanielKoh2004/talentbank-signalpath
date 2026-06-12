import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function parseApplicationAnswers(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

// =============================================================================
// GET /api/roles/[roleId] — Get a single role brief with full details
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;

  try {
    const role = await prisma.roleBrief.findUnique({
      where: { id: roleId },
      include: {
        roleRequirements: {
          include: { skill: true },
        },
        roleFamily: true,
        matchScores: {
          include: {
            candidate: {
              include: { user: true },
            },
          },
          orderBy: { totalScore: "desc" },
        },
        opportunityInteractions: {
          include: {
            candidate: {
              include: { user: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      role: {
        id: role.id,
        title: role.title,
        employerId: role.employerId,
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
        interactions: role.opportunityInteractions.map((i) => ({
          id: i.id,
          candidateId: i.candidateId,
          candidateName: i.candidate.user.name,
          candidateStatus: i.candidateStatus,
          employerStatus: i.employerStatus,
          readinessScore: i.lastReadinessScore,
          gapCount: i.lastGapCount,
          applicationNote: i.applicationNote,
          applicationAnswers: parseApplicationAnswers(i.applicationAnswers),
          appliedAt: i.appliedAt,
          updatedAt: i.updatedAt,
        })),
        matchScores: role.matchScores.map((ms) => ({
          id: ms.id,
          candidateId: ms.candidateId,
          candidateName: ms.candidate.user.name,
          totalScore: ms.totalScore,
          roleEvidenceCoverage: ms.roleEvidenceCoverage,
          trajectoryFit: ms.trajectoryFit,
          adjacentExperience: ms.adjacentExperience,
          logisticsFit: ms.logisticsFit,
          growthSignal: ms.growthSignal,
          preferenceAlignment: ms.preferenceAlignment,
          evidenceQuality: ms.evidenceQuality,
          matrixJson: ms.matrixJson,
          aiMemo: ms.aiMemo,
          computedAt: ms.computedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch role:", error);
    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 }
    );
  }
}
