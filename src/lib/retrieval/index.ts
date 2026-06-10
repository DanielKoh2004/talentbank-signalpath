import { RetrievalService } from "./types";
import { MockRetrievalService } from "./mock-retrieval";

// =============================================================================
// Retrieval service factory
// Reads env to determine which implementation to use.
// Dev: MockRetrievalService (seeded/SQL-based)
// Prod: pgvector implementation (when Supabase is configured)
// =============================================================================

export function getRetrievalService(): RetrievalService {
  const provider = process.env.RETRIEVAL_PROVIDER ?? "mock";

  switch (provider) {
    case "pgvector":
      // TODO: Import and return PgVectorRetrievalService when Supabase is set up
      console.warn(
        "pgvector retrieval not yet implemented, falling back to mock"
      );
      return new MockRetrievalService();

    case "mock":
    default:
      return new MockRetrievalService();
  }
}

export type { RetrievalService, CandidatePoolResult } from "./types";
