import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// =============================================================================
// PATCH /api/artifacts/[artifactId] — Update artifact text + re-trigger extraction
// Used when extraction returned "needs_input" and user pastes content.
// =============================================================================

function artifactUrlFromRecord(artifact: {
  sourceUrl: string | null;
  storagePath: string | null;
}) {
  if (artifact.sourceUrl) return artifact.sourceUrl;
  if (artifact.storagePath) {
    return artifact.storagePath.startsWith("/")
      ? artifact.storagePath
      : `/${artifact.storagePath}`;
  }
  return "about:blank";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ artifactId: string }> }
) {
  const { artifactId } = await params;

  try {
    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
      select: {
        id: true,
        candidateId: true,
        title: true,
        type: true,
        sourceUrl: true,
        storagePath: true,
        extractionSource: true,
        demoManifestId: true,
        uploadedAt: true,
        shareable: true,
      },
    });

    if (!artifact) {
      return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
    }

    if (!artifact.shareable) {
      return NextResponse.json(
        { error: "Private Artifact", access: "denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      artifact: {
        id: artifact.id,
        title: artifact.title,
        type: artifact.type,
        url: artifactUrlFromRecord(artifact),
        sourceUrl: artifact.sourceUrl,
        storagePath: artifact.storagePath,
        extractionSource: artifact.extractionSource,
        demoManifestId: artifact.demoManifestId,
        uploadedAt: artifact.uploadedAt,
        isShareable: artifact.shareable,
      },
    });
  } catch (error) {
    console.error("Artifact fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch artifact" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ artifactId: string }> }
) {
  const { artifactId } = await params;

  try {
    const body = await request.json();
    const { extractedText } = body;

    if (!extractedText || typeof extractedText !== "string" || !extractedText.trim()) {
      return NextResponse.json(
        { error: "extractedText is required and must be non-empty" },
        { status: 400 }
      );
    }

    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
    });

    if (!artifact) {
      return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
    }

    // Update artifact with the provided text
    await prisma.artifact.update({
      where: { id: artifactId },
      data: {
        extractedText: extractedText.trim(),
        extractionSource: "pasted_summary",
      },
    });

    // Create a new extraction job for this artifact
    const job = await prisma.extractionJob.create({
      data: {
        artifactId,
        candidateId: artifact.candidateId,
        status: "queued",
        extractionSource: "pasted_summary",
        progressLabel: "Ready to extract from pasted content",
      },
    });

    return NextResponse.json({
      artifact: { id: artifactId },
      extractionJob: { id: job.id, status: job.status },
    });
  } catch (error) {
    console.error("Artifact update failed:", error);
    return NextResponse.json(
      { error: "Failed to update artifact" },
      { status: 500 }
    );
  }
}
