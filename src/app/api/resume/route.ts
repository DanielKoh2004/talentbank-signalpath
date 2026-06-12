import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function extractPdfText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const parsed = await parser.getText();
    return parsed.text.trim();
  } finally {
    await parser.destroy();
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const candidateId = String(formData.get("candidateId") ?? "");
    const pastedText = String(formData.get("resumeText") ?? "").trim();
    const file = formData.get("file");

    const trimmedCandidateId = candidateId.trim();

    if (!trimmedCandidateId) {
      return NextResponse.json(
        { error: "candidateId is required", field: "candidateId" },
        { status: 400 },
      );
    }

    if (!pastedText && !(file instanceof File)) {
      return NextResponse.json(
        { error: "Upload a PDF or paste resume text first", field: "resumeText" },
        { status: 400 },
      );
    }

    let extractedText = pastedText;
    let parseFailed = false;
    let sourceUrl: string | null = null;
    const fileName = file instanceof File ? file.name : null;

    if (!extractedText && file instanceof File) {
      sourceUrl = `uploaded://${file.name}`;
      try {
        extractedText = await extractPdfText(file);
      } catch (error) {
        console.error("Resume PDF parse failed:", error);
        parseFailed = true;
      }
    }

    const artifact = await prisma.artifact.create({
      data: {
        candidateId: trimmedCandidateId,
        title: fileName ? `Resume - ${fileName}` : "Resume",
        type: "cv",
        sourceUrl,
        extractedText: extractedText || null,
        extractionSource: extractedText ? "native_text" : "failed",
      },
    });

    const job = await prisma.extractionJob.create({
      data: {
        artifactId: artifact.id,
        candidateId: trimmedCandidateId,
        status: extractedText ? "queued" : "needs_input",
        extractionSource: extractedText ? "native_text" : "failed",
        progressLabel: extractedText
          ? "Resume text ready for skill extraction"
          : "PDF text could not be read. Paste resume text to continue.",
        errorMessage: parseFailed ? "PDF text extraction failed" : null,
      },
    });

    return NextResponse.json(
      {
        artifact: { id: artifact.id, title: artifact.title, type: artifact.type },
        extractionJob: { id: job.id, status: job.status },
        needsInput: job.status === "needs_input",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Resume upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 },
    );
  }
}
