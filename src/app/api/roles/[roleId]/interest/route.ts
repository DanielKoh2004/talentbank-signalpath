import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import { computeRoleCoverage } from "@/lib/scoring/role-coverage";

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
    const { candidateId, action, applicationNote, applicationAnswers } = body;
    const trimmedCandidateId =
      typeof candidateId === "string" ? candidateId.trim() : "";
    const normalizedAction =
      typeof action === "string" && action.trim() ? action.trim() : "interest";

    if (!trimmedCandidateId) {
      return NextResponse.json(
        { error: "candidateId is required", field: "candidateId" },
        { status: 400 }
      );
    }

    if (!["interest", "apply", "hide"].includes(normalizedAction)) {
      return NextResponse.json(
        { error: "Invalid interaction action", field: "action" },
        { status: 400 }
      );
    }

    const trimmedApplicationNote =
      typeof applicationNote === "string" ? applicationNote.trim() : "";
    const whyThisRole =
      applicationAnswers &&
      typeof applicationAnswers === "object" &&
      !Array.isArray(applicationAnswers)
        ? String((applicationAnswers as Record<string, unknown>).whyThisRole ?? "").trim()
        : "";

    if (normalizedAction === "apply") {
      if (!trimmedApplicationNote) {
        return NextResponse.json(
          { error: "Application note is required", field: "applicationNote" },
          { status: 400 }
        );
      }

      if (!whyThisRole) {
        return NextResponse.json(
          { error: "Why this role is required", field: "applicationAnswers.whyThisRole" },
          { status: 400 }
        );
      }
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
      where: { candidateId: trimmedCandidateId, candidateStatus: { in: ["accepted", "edited"] } },
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
    const candidateStatus =
      normalizedAction === "hide"
        ? "hidden"
        : normalizedAction === "apply"
          ? "applied"
          : "interested";
    const appliedAt = normalizedAction === "apply" ? new Date() : undefined;

    // Upsert interaction
    const interaction = await prisma.opportunityInteraction.upsert({
      where: {
        roleBriefId_candidateId: {
          roleBriefId: roleId,
          candidateId: trimmedCandidateId,
        },
      },
      create: {
        roleBriefId: roleId,
        candidateId: trimmedCandidateId,
        candidateStatus,
        employerStatus: "not_reviewed",
        lastReadinessScore: coverage.readinessScore,
        lastGapCount: coverage.gapCount,
        applicationNote:
          normalizedAction === "apply"
            ? trimmedApplicationNote
            : null,
        applicationAnswers:
          normalizedAction === "apply"
            ? JSON.stringify({ whyThisRole })
            : null,
        appliedAt,
      },
      update: {
        candidateStatus,
        lastReadinessScore: coverage.readinessScore,
        lastGapCount: coverage.gapCount,
        ...(normalizedAction === "apply"
          ? {
              applicationNote: trimmedApplicationNote,
              applicationAnswers: JSON.stringify({ whyThisRole }),
              appliedAt,
            }
          : {}),
      },
    });

    return NextResponse.json({
      interaction: {
        id: interaction.id,
        candidateStatus: interaction.candidateStatus,
        readinessScore: coverage.readinessScore,
        readinessPercent: coverage.readinessPercent,
        gapCount: coverage.gapCount,
        applicationNote: interaction.applicationNote,
        applicationAnswers: parseApplicationAnswers(interaction.applicationAnswers),
        appliedAt: interaction.appliedAt,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;

  try {
    const body = await request.json();
    const candidateId =
      typeof body.candidateId === "string" ? body.candidateId.trim() : "";
    const employerStatus =
      typeof body.employerStatus === "string" ? body.employerStatus.trim() : "";
    const allowedStatuses = new Set([
      "not_reviewed",
      "shortlisted",
      "contacted",
      "rejected",
    ]);

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId is required", field: "candidateId" },
        { status: 400 }
      );
    }

    if (!allowedStatuses.has(employerStatus)) {
      return NextResponse.json(
        {
          error: "employerStatus must be not_reviewed, shortlisted, contacted, or rejected",
          field: "employerStatus",
        },
        { status: 400 }
      );
    }

    const existingInteraction = await prisma.opportunityInteraction.findUnique({
      where: {
        roleBriefId_candidateId: {
          roleBriefId: roleId,
          candidateId,
        },
      },
    });

    if (!existingInteraction) {
      return NextResponse.json(
        { error: "Interaction not found" },
        { status: 404 }
      );
    }

    const interaction = await prisma.opportunityInteraction.update({
      where: { id: existingInteraction.id },
      data: { employerStatus },
    });

    return NextResponse.json({
      interaction: {
        id: interaction.id,
        candidateId: interaction.candidateId,
        candidateStatus: interaction.candidateStatus,
        employerStatus: interaction.employerStatus,
        readinessScore: interaction.lastReadinessScore,
        gapCount: interaction.lastGapCount,
        applicationNote: interaction.applicationNote,
        applicationAnswers: parseApplicationAnswers(interaction.applicationAnswers),
        appliedAt: interaction.appliedAt,
        updatedAt: interaction.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update employer interaction status:", error);
    return NextResponse.json(
      { error: "Failed to update employer interaction status" },
      { status: 500 }
    );
  }
}
