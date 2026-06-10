import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
          select: { id: true, title: true },
        },
      },
    });

    const formatted = interactions.map((i) => ({
      id: i.id,
      roleBriefId: i.roleBriefId,
      roleTitle: i.roleBrief.title,
      candidateStatus: i.candidateStatus,
      employerStatus: i.employerStatus,
      readinessScore: i.lastReadinessScore,
      readinessPercent: i.lastReadinessScore
        ? Math.round(i.lastReadinessScore * 100)
        : null,
      gapCount: i.lastGapCount,
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
