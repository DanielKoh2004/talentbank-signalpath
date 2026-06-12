import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// =============================================================================
// POST /api/artifacts — Upload artifact and create extraction job
// GET  /api/artifacts — List artifacts for a candidate
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

  const artifacts = await prisma.artifact.findMany({
    where: { candidateId },
    include: {
      extractionJobs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          createdClaimCount: true,
          progressLabel: true,
        },
      },
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ artifacts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, title, type, sourceUrl, extractedText, demoManifestId } = body;

    const trimmedCandidateId =
      typeof candidateId === "string" ? candidateId.trim() : "";
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    const trimmedType = typeof type === "string" ? type.trim() : "";

    if (!trimmedCandidateId) {
      return NextResponse.json(
        { error: "candidateId is required", field: "candidateId" },
        { status: 400 }
      );
    }

    if (!trimmedTitle) {
      return NextResponse.json(
        { error: "Artifact title is required", field: "title" },
        { status: 400 }
      );
    }

    if (!trimmedType) {
      return NextResponse.json(
        { error: "Artifact type is required", field: "type" },
        { status: 400 }
      );
    }

    // Validate artifact type
    const validTypes = [
      "cv", "project", "certificate", "repo_link",
      "portfolio_link", "case_study", "screenshot", "other",
    ];
    if (!validTypes.includes(trimmedType)) {
      return NextResponse.json(
        { error: `Invalid artifact type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Determine extraction source
    let extractionSource = "manual_entry";
    const trimmedExtractedText =
      typeof extractedText === "string" ? extractedText.trim() : "";

    if (demoManifestId) {
      extractionSource = "manifest";
    } else if (trimmedExtractedText) {
      extractionSource = "native_text";
    }

    // Create artifact
    const artifact = await prisma.artifact.create({
      data: {
        candidateId: trimmedCandidateId,
        title: trimmedTitle,
        type: trimmedType,
        sourceUrl: typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim() : null,
        extractedText: trimmedExtractedText || null,
        extractionSource,
        demoManifestId: demoManifestId ?? null,
      },
    });

    // Create extraction job
    const job = await prisma.extractionJob.create({
      data: {
        artifactId: artifact.id,
        candidateId: trimmedCandidateId,
        status: "queued",
        extractionSource,
        progressLabel: "Preparing artifact",
      },
    });

    return NextResponse.json(
      {
        artifact: { id: artifact.id, title: artifact.title, type: artifact.type },
        extractionJob: { id: job.id, status: job.status },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Artifact upload failed:", error);
    return NextResponse.json(
      { error: "Failed to create artifact" },
      { status: 500 }
    );
  }
}
