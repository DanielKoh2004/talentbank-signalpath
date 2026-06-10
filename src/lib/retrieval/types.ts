// =============================================================================
// Candidate pool retrieval interface
// Dev: seeded/mock candidates. Prod: pgvector in Supabase/Postgres.
// The deterministic scorer always runs on whatever pool this returns.
// =============================================================================

export interface CandidatePoolResult {
  /** Candidate profile ID */
  candidateId: string;

  /** Similarity score from retrieval (0-1). NOT the final match score. */
  similarityScore: number;

  /** Skill IDs that contributed to retrieval match */
  matchedSkillIds: string[];
}

export interface RetrievalService {
  /**
   * Retrieve a pool of candidate profiles that may be relevant for the given role.
   * This is a first-pass filter only — the deterministic scorer produces the final ranking.
   *
   * @param roleBriefId - The role brief to match against
   * @param limit - Maximum number of candidates to return (default 50)
   * @returns Candidate pool with similarity scores
   */
  retrieveCandidatePool(
    roleBriefId: string,
    limit?: number
  ): Promise<CandidatePoolResult[]>;
}
