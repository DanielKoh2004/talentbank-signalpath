import { prisma } from "@/lib/db";
import { CandidatePoolResult, RetrievalService } from "./types";

// =============================================================================
// Mock retrieval — Dev implementation
// Returns seeded candidates with simulated similarity scores.
// Swap to pgvector-retrieval.ts when connecting to Supabase/Postgres.
// =============================================================================

export class MockRetrievalService implements RetrievalService {
  async retrieveCandidatePool(
    roleBriefId: string,
    limit: number = 50
  ): Promise<CandidatePoolResult[]> {
    // Get the role requirements
    const requirements = await prisma.roleRequirement.findMany({
      where: { roleBriefId },
      select: { skillId: true, importance: true },
    });

    const requiredSkillIds = requirements.map((r) => r.skillId);

    // Get all candidates with accepted claims
    const candidates = await prisma.candidateProfile.findMany({
      include: {
        evidenceClaims: {
          where: { candidateStatus: "accepted" },
          select: { normalizedSkillIds: true },
        },
      },
      take: limit,
    });

    // Compute a simple similarity score based on skill overlap
    const results: CandidatePoolResult[] = candidates.map((candidate) => {
      const candidateSkillIds = new Set<string>();
      for (const claim of candidate.evidenceClaims) {
        try {
          const skillIds = JSON.parse(claim.normalizedSkillIds) as string[];
          skillIds.forEach((id) => candidateSkillIds.add(id));
        } catch {
          // Skip malformed JSON
        }
      }

      const matchedSkillIds = requiredSkillIds.filter((id) =>
        candidateSkillIds.has(id)
      );
      const similarityScore =
        requiredSkillIds.length > 0
          ? matchedSkillIds.length / requiredSkillIds.length
          : 0;

      return {
        candidateId: candidate.id,
        similarityScore,
        matchedSkillIds,
      };
    });

    // Sort by similarity (highest first) and return
    return results
      .filter((r) => r.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }
}
