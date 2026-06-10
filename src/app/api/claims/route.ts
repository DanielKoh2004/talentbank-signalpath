import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stringifyArray, parseJsonArray } from "@/lib/utils";

// =============================================================================
// GET  /api/claims — List evidence claims for a candidate
// PATCH /api/claims — Accept/edit/reject a claim
// =============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");
  const status = searchParams.get("status"); // pending | accepted | edited | rejected
  const artifactId = searchParams.get("artifactId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "candidateId is required" },
      { status: 400 }
    );
  }

  const where: Record<string, unknown> = { candidateId };
  if (status) where.candidateStatus = status;
  if (artifactId) where.artifactId = artifactId;

  const claims = await prisma.evidenceClaim.findMany({
    where,
    include: {
      artifact: {
        select: { id: true, title: true, type: true },
      },
    },
    orderBy: [
      { candidateStatus: "asc" }, // pending first
      { evidenceQualityScore: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Parse JSON string fields for client consumption
  const parsed = claims.map((claim) => ({
    ...claim,
    normalizedSkillIds: parseJsonArray(claim.normalizedSkillIds),
    suggestedSkillNames: parseJsonArray(claim.suggestedSkillNames),
    roleFamilyTags: parseJsonArray(claim.roleFamilyTags),
  }));

  return NextResponse.json({ claims: parsed });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId, action, editedText, editedSkillIds, visibility } = body;

    if (!claimId || !action) {
      return NextResponse.json(
        { error: "claimId and action are required" },
        { status: 400 }
      );
    }

    const validActions = ["accept", "edit", "reject"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await prisma.evidenceClaim.findUnique({
      where: { id: claimId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Claim not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    switch (action) {
      case "accept":
        updateData.candidateStatus = "accepted";
        updateData.lastVerifiedAt = new Date();
        if (visibility) updateData.visibility = visibility;
        break;

      case "edit":
        updateData.candidateStatus = "edited";
        updateData.lastVerifiedAt = new Date();
        if (editedText) updateData.claimText = editedText;
        if (editedSkillIds) {
          updateData.normalizedSkillIds = stringifyArray(editedSkillIds);
        }
        if (visibility) updateData.visibility = visibility;
        break;

      case "reject":
        updateData.candidateStatus = "rejected";
        break;
    }

    const updated = await prisma.evidenceClaim.update({
      where: { id: claimId },
      data: updateData,
    });

    return NextResponse.json({
      claim: {
        ...updated,
        normalizedSkillIds: parseJsonArray(updated.normalizedSkillIds),
        suggestedSkillNames: parseJsonArray(updated.suggestedSkillNames),
      },
    });
  } catch (error) {
    console.error("Claim update failed:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
