import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import { computeRoleCoverage } from "@/lib/scoring/role-coverage";

// =============================================================================
// POST /api/roles/[roleId]/interest — Express interest in a role (candidate)
// GET  /api/roles/[roleId]/interest — Get interactions for a role (employer)
// =============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;

  try {
    const body = await request.json();
    const { candidateId, action } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId is required" },
        { status: 400 }
      );
    }

    // Load role brief with requirements
    const roleBrief = await prisma.roleBrief.findUnique({
      where: { id: roleId },
      include: { roleRequirements: true },
    });

    if (!roleBrief) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Compute current readiness
    const claims = await prisma.evidenceClaim.findMany({
      where: { candidateId, candidateStatus: "accepted" },
    });

    const parsedClaims = claims.map((c) => ({
      id: c.id,
      claimText: c.claimText,
      normalizedSkillIds: parseJsonArray<string>(c.normalizedSkillIds),
      provenanceStatus: c.provenanceStatus,
      evidenceQualityScore: c.evidenceQualityScore,
    }));

    const requirements = roleBrief.roleRequirements.map((rr) => ({
      skillId: rr.skillId,
      importance: rr.importance,
      minimumEvidenceStrength: rr.minimumEvidenceStrength,
      displayLabel: rr.displayLabel ?? rr.skillId,
    }));

    const skillRelations = await prisma.skillRelation.findMany();
    const coverage = computeRoleCoverage(
      parsedClaims,
      requirements,
      skillRelations.map((r) => ({
        sourceSkillId: r.sourceSkillId,
        targetSkillId: r.targetSkillId,
        relationType: r.relationType,
        scoringWeight: r.scoringWeight,
      }))
    );

    // Determine candidate status
    const candidateStatus = action === "hide" ? "hidden" : "interested";

    // Upsert interaction
    const interaction = await prisma.opportunityInteraction.upsert({
      where: {
        roleBriefId_candidateId: {
          roleBriefId: roleId,
          candidateId,
        },
      },
      create: {
        roleBriefId: roleId,
        candidateId,
        candidateStatus,
        employerStatus: "not_reviewed",
        lastReadinessScore: coverage.readinessScore,
        lastGapCount: coverage.gapCount,
      },
      update: {
        candidateStatus,
        lastReadinessScore: coverage.readinessScore,
        lastGapCount: coverage.gapCount,
      },
    });

    return NextResponse.json({
      interaction: {
        id: interaction.id,
        candidateStatus: interaction.candidateStatus,
        readinessScore: coverage.readinessScore,
        readinessPercent: coverage.readinessPercent,
        gapCount: coverage.gapCount,
      },
    });
  } catch (error) {
    console.error("Failed to express interest:", error);
    return NextResponse.json(
      { error: "Failed to express interest" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;

  try {
    const interactions = await prisma.opportunityInteraction.findMany({
      where: { roleBriefId: roleId },
      include: {
        candidate: {
          include: { user: true },
        },
      },
      orderBy: { lastReadinessScore: "desc" },
    });

    const formatted = interactions.map((i) => ({
      id: i.id,
      candidateId: i.candidateId,
      candidateName: i.candidate.user.name,
      candidateStatus: i.candidateStatus,
      employerStatus: i.employerStatus,
      readinessScore: i.lastReadinessScore,
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
