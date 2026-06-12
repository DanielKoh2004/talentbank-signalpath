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
// GET /api/interactions — Get all interactions for a candidate
// Used by the candidate marketplace to show interest status + readiness.
// =============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "candidateId is required" },
      { status: 400 }
    );
  }

  try {
    const interactions = await prisma.opportunityInteraction.findMany({
      where: { candidateId },
      include: {
        roleBrief: {
          select: {
            id: true,
            title: true,
            location: true,
            workMode: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            roleFamily: { select: { name: true } },
          },
        },
      },
    });

    const formatted = interactions.map((i) => ({
      id: i.id,
      roleBriefId: i.roleBriefId,
      roleTitle: i.roleBrief.title,
      roleLocation: i.roleBrief.location,
      workMode: i.roleBrief.workMode,
      salaryMin: i.roleBrief.salaryMin,
      salaryMax: i.roleBrief.salaryMax,
      salaryCurrency: i.roleBrief.salaryCurrency,
      roleFamilyName: i.roleBrief.roleFamily?.name ?? null,
      candidateStatus: i.candidateStatus,
      employerStatus: i.employerStatus,
      readinessScore: i.lastReadinessScore,
      readinessPercent: i.lastReadinessScore
        ? Math.round(i.lastReadinessScore * 100)
        : null,
      gapCount: i.lastGapCount,
      applicationNote: i.applicationNote,
      applicationAnswers: parseApplicationAnswers(i.applicationAnswers),
      appliedAt: i.appliedAt,
      updatedAt: i.updatedAt,
    }));

    return NextResponse.json({ interactions: formatted });
  } catch (error) {
    console.error("Failed to fetch interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}
