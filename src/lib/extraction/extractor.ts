// =============================================================================
// Extraction Job Runner
// Orchestrates the extraction process: manifest → local (rule-based) → AI → needs_input.
// =============================================================================

import { prisma } from "@/lib/db";
import { getAI } from "@/lib/ai";
import { parseJsonArray, stringifyArray } from "@/lib/utils";
import { computeEvidenceQuality } from "@/lib/scoring/evidence-quality";
import { getManifestClaims, type ManifestClaim } from "./manifest";
import { extractClaimsLocally } from "./local-extractor";
import {
  buildExtractionPrompt,
  ExtractionResultSchema,
} from "./prompts";

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Run an extraction job end-to-end.
 *
 * 1. Load the ExtractionJob and its Artifact from the database.
 * 2. Update job status to "processing".
 * 3. Try manifest extraction first (if demoManifestId exists).
 * 4. If no manifest, try AI extraction (if extractedText exists).
 * 5. If neither, set status to "needs_input".
 * 6. For each extracted claim, compute evidence quality score.
 * 7. Create EvidenceClaim records with candidateStatus = "pending".
 * 8. Update job status to "completed" with claim count.
 * 9. On error, update job status to "failed" with error message.
 */
export async function runExtraction(
  jobId: string,
  options: { allowAI?: boolean } = {},
): Promise<{ success: boolean; claimCount: number; error?: string }> {
  try {
    // ── 1. Load job + artifact ──────────────────────────────────────────
    const job = await prisma.extractionJob.findUnique({
      where: { id: jobId },
      include: {
        artifact: true,
      },
    });

    if (!job) {
      return { success: false, claimCount: 0, error: `Job ${jobId} not found` };
    }

    const { artifact } = job;

    // ── 2. Mark as processing ───────────────────────────────────────────
    await prisma.extractionJob.update({
      where: { id: jobId },
      data: {
        status: "processing",
        startedAt: new Date(),
        progressLabel: "Starting extraction…",
      },
    });

    // ── 3. Try manifest extraction first ────────────────────────────────
    if (artifact.demoManifestId) {
      const manifestClaims = getManifestClaims(artifact.demoManifestId);

      if (manifestClaims && manifestClaims.length > 0) {
        const claimCount = await createClaimsFromManifest(
          job.candidateId,
          artifact.id,
          artifact.type,
          manifestClaims,
        );

        await prisma.extractionJob.update({
          where: { id: jobId },
          data: {
            status: "completed",
            extractionSource: "manifest",
            progressLabel: `Extracted ${claimCount} claims from manifest`,
            createdClaimCount: claimCount,
            completedAt: new Date(),
          },
        });

        // Also update the artifact's extraction source
        await prisma.artifact.update({
          where: { id: artifact.id },
          data: { extractionSource: "manifest" },
        });

        return { success: true, claimCount };
      }
    }

    // ── 4. Try local + AI extraction if extractedText exists ─────────────
    if (artifact.extractedText && artifact.extractedText.trim().length > 0) {
      const hasAIKey =
        options.allowAI === true &&
        !!(process.env.AI_API_KEY && process.env.AI_BASE_URL);

      let claimCount: number;
      let source: string;

      if (hasAIKey) {
        // Use AI extraction if provider is configured
        claimCount = await createClaimsFromAI(
          job.candidateId,
          artifact.id,
          artifact.type,
          artifact.extractedText,
          jobId,
        );
        source = "ai_extraction";
      } else {
        // Use local rule-based extraction as fallback
        await prisma.extractionJob.update({
          where: { id: jobId },
          data: { progressLabel: "Extracting claims (local analysis)…" },
        });

        claimCount = await createClaimsFromLocal(
          job.candidateId,
          artifact.id,
          artifact.type,
          artifact.extractedText,
        );
        source = "local_extraction";
      }

      await prisma.extractionJob.update({
        where: { id: jobId },
        data: {
          status: "completed",
          extractionSource: source,
          progressLabel: `Extracted ${claimCount} claims`,
          createdClaimCount: claimCount,
          completedAt: new Date(),
        },
      });

      await prisma.artifact.update({
        where: { id: artifact.id },
        data: { extractionSource: source },
      });

      return { success: true, claimCount };
    }

    // ── 5. Neither manifest nor text — needs input ──────────────────────
    await prisma.extractionJob.update({
      where: { id: jobId },
      data: {
        status: "needs_input",
        progressLabel:
          "No extractable text found. Please paste or upload artifact content.",
      },
    });

    return { success: false, claimCount: 0 };
  } catch (err) {
    // ── 9. Error handling ─────────────────────────────────────────────
    const errorMessage =
      err instanceof Error ? err.message : "Unknown extraction error";

    try {
      await prisma.extractionJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          errorMessage,
          progressLabel: "Extraction failed",
        },
      });
    } catch {
      // If we can't even update the job, log but don't throw again
      console.error(
        `[extractor] Failed to update job ${jobId} status to failed:`,
        err,
      );
    }

    return { success: false, claimCount: 0, error: errorMessage };
  }
}

// ── Internal: manifest-backed claim creation ────────────────────────────────

async function createClaimsFromManifest(
  candidateId: string,
  artifactId: string,
  artifactType: string,
  manifestClaims: ManifestClaim[],
): Promise<number> {
  let created = 0;

  for (const mc of manifestClaims) {
    // Re-compute quality score through our deterministic scorer for consistency
    const { score } = computeEvidenceQuality({
      provenanceStatus: mc.provenanceStatus,
      claimText: mc.claimText,
      sourceSpan: mc.sourceSpan,
      artifactType,
    });

    // Use the manifest's pre-defined score if it's higher than the computed
    // score — the manifest is authoritative for demo data
    const finalScore = Math.max(score, mc.evidenceQualityScore);

    await prisma.evidenceClaim.create({
      data: {
        candidateId,
        artifactId,
        claimText: mc.claimText,
        normalizedSkillIds: stringifyArray(mc.normalizedSkillIds),
        suggestedSkillNames: stringifyArray(mc.suggestedSkillNames),
        provenanceStatus: mc.provenanceStatus,
        evidenceQualityScore: Math.min(5, finalScore),
        sourceSpan: mc.sourceSpan ?? null,
        confidence: mc.confidence,
        candidateStatus: "pending",
        visibility: "private",
      },
    });

    created++;
  }

  return created;
}
// ── Internal: local rule-based claim creation ───────────────────────────────

async function createClaimsFromLocal(
  candidateId: string,
  artifactId: string,
  artifactType: string,
  extractedText: string,
): Promise<number> {
  // Load valid skill IDs from database
  const skills = await prisma.skill.findMany({
    where: { active: true },
    select: { id: true },
  });
  const validSkillIds = new Set(skills.map((s) => s.id));

  // Run local extraction
  const localClaims = extractClaimsLocally(extractedText, validSkillIds);

  if (localClaims.length === 0) {
    return 0;
  }

  // Create claims using the same path as manifest claims
  return createClaimsFromManifest(candidateId, artifactId, artifactType, localClaims);
}

// ── Internal: AI-backed claim creation ──────────────────────────────────────

async function createClaimsFromAI(
  candidateId: string,
  artifactId: string,
  artifactType: string,
  extractedText: string,
  jobId: string,
): Promise<number> {
  // Update progress
  await prisma.extractionJob.update({
    where: { id: jobId },
    data: { progressLabel: "Loading skill taxonomy…" },
  });

  // Load the canonical skill taxonomy from the database
  const skills = await prisma.skill.findMany({
    where: { active: true },
    select: { id: true, name: true, category: true, aliases: true },
  });

  const taxonomySkills = skills.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    aliases: parseJsonArray<string>(s.aliases),
  }));

  // Build prompt and call AI adapter
  await prisma.extractionJob.update({
    where: { id: jobId },
    data: { progressLabel: "Extracting claims via AI…" },
  });

  const prompt = buildExtractionPrompt(extractedText, taxonomySkills);
  const ai = getAI();
  const result = await ai.generateJson(prompt, ExtractionResultSchema);

  // Validate extracted skill IDs against actual taxonomy
  const validSkillIds = new Set(skills.map((s) => s.id));

  await prisma.extractionJob.update({
    where: { id: jobId },
    data: { progressLabel: "Creating evidence claims…" },
  });

  let created = 0;

  for (const claim of result.claims) {
    // Separate valid canonical IDs from invalid ones
    const validIds: string[] = [];
    const suggestedNames: string[] = [...claim.suggestedSkillNames];

    for (const id of claim.normalizedSkillIds) {
      if (validSkillIds.has(id)) {
        validIds.push(id);
      } else {
        // AI hallucinated a skill ID — move to suggested names
        suggestedNames.push(id);
      }
    }

    // Skip claims with no valid skills at all
    if (validIds.length === 0 && suggestedNames.length === 0) {
      continue;
    }

    // Compute deterministic evidence quality score
    const { score } = computeEvidenceQuality({
      provenanceStatus: claim.provenanceStatus,
      claimText: claim.claimText,
      sourceSpan: claim.sourceSpan,
      artifactType,
    });

    await prisma.evidenceClaim.create({
      data: {
        candidateId,
        artifactId,
        claimText: claim.claimText,
        normalizedSkillIds: stringifyArray(validIds),
        suggestedSkillNames: stringifyArray(suggestedNames),
        provenanceStatus: claim.provenanceStatus,
        evidenceQualityScore: Math.min(5, score),
        sourceSpan: claim.sourceSpan ?? null,
        confidence: claim.confidence,
        candidateStatus: "pending",
        visibility: "private",
      },
    });

    created++;
  }

  return created;
}
