// =============================================================================
// Manifest-Backed Extraction
// Pre-defined claims for seeded demo artifacts — no AI/LLM needed.
// Each manifest maps a demoManifestId to an array of claim objects that
// match the seed data exactly.
// =============================================================================

export interface ManifestClaim {
  claimText: string;
  provenanceStatus: string;
  normalizedSkillIds: string[];
  suggestedSkillNames: string[];
  evidenceQualityScore: number;
  sourceSpan?: string;
  confidence: number;
}

// ── Manifest registry ───────────────────────────────────────────────────────

const MANIFESTS: Record<string, ManifestClaim[]> = {
  // ── Google Data Analytics Professional Certificate ─────────────────────
  cert_google_analytics: [
    {
      claimText:
        "Completed Google Data Analytics Professional Certificate",
      provenanceStatus: "document_backed",
      normalizedSkillIds: ["data_analysis"],
      suggestedSkillNames: ["Google Data Analytics"],
      evidenceQualityScore: 3,
      sourceSpan: "Google Data Analytics Professional Certificate",
      confidence: 0.9,
    },
    {
      claimText:
        "Applied SQL for data extraction and analysis across multiple datasets",
      provenanceStatus: "document_backed",
      normalizedSkillIds: ["sql", "data_analysis"],
      suggestedSkillNames: [],
      evidenceQualityScore: 3,
      sourceSpan:
        "Applied SQL for data extraction and analysis across multiple datasets",
      confidence: 0.85,
    },
    {
      claimText:
        "Created data visualizations using spreadsheets and Tableau",
      provenanceStatus: "document_backed",
      normalizedSkillIds: ["data_visualization"],
      suggestedSkillNames: ["Tableau", "spreadsheets"],
      evidenceQualityScore: 2,
      sourceSpan:
        "Created data visualizations using spreadsheets and Tableau",
      confidence: 0.8,
    },
  ],

  // ── Retail Analytics Dashboard Project ────────────────────────────────
  project_retail_dashboard: [
    {
      claimText:
        "Built an interactive retail analytics dashboard tracking sales, inventory, and customer segments",
      provenanceStatus: "artifact_backed",
      normalizedSkillIds: ["data_visualization", "data_analysis", "sql"],
      suggestedSkillNames: [],
      evidenceQualityScore: 4,
      sourceSpan:
        "Built an interactive retail analytics dashboard tracking sales, inventory, and customer segments",
      confidence: 0.95,
    },
    {
      claimText:
        "Wrote SQL queries to analyze customer purchase patterns and segment high-value customers",
      provenanceStatus: "artifact_backed",
      normalizedSkillIds: ["sql", "data_analysis"],
      suggestedSkillNames: [],
      evidenceQualityScore: 4,
      sourceSpan:
        "Wrote SQL queries to analyze customer purchase patterns and segment high-value customers",
      confidence: 0.95,
    },
    {
      claimText:
        "Presented dashboard findings and recommendations to retail stakeholders",
      provenanceStatus: "artifact_backed",
      normalizedSkillIds: ["stakeholder_communication", "presentation_skills"],
      suggestedSkillNames: [],
      evidenceQualityScore: 3,
      sourceSpan:
        "Presented dashboard findings and recommendations to retail stakeholders",
      confidence: 0.85,
    },
    {
      claimText:
        "Used Python pandas to clean and transform raw sales data",
      provenanceStatus: "artifact_backed",
      normalizedSkillIds: ["python_data", "data_analysis"],
      suggestedSkillNames: ["pandas"],
      evidenceQualityScore: 3,
      sourceSpan:
        "Used Python pandas to clean and transform raw sales data",
      confidence: 0.85,
    },
  ],

  // ── A/B Testing Project (gap closer for Demo 2) ──────────────────────
  project_ab_testing: [
    {
      claimText:
        "Designed and executed an A/B test for a retail checkout flow, measuring conversion rate impact",
      provenanceStatus: "artifact_backed",
      normalizedSkillIds: ["ab_testing", "product_analytics"],
      suggestedSkillNames: [],
      evidenceQualityScore: 4,
      sourceSpan:
        "Designed and executed an A/B test for a retail checkout flow, measuring conversion rate impact",
      confidence: 0.95,
    },
    {
      claimText:
        "Applied statistical significance testing to validate experiment results",
      provenanceStatus: "artifact_backed",
      normalizedSkillIds: ["ab_testing", "statistical_analysis"],
      suggestedSkillNames: [],
      evidenceQualityScore: 4,
      sourceSpan:
        "Applied statistical significance testing to validate experiment results",
      confidence: 0.9,
    },
    {
      claimText:
        "Documented experiment methodology, sample size calculations, and business recommendations",
      provenanceStatus: "artifact_backed",
      normalizedSkillIds: ["technical_writing", "ab_testing"],
      suggestedSkillNames: [],
      evidenceQualityScore: 3,
      sourceSpan:
        "Documented experiment methodology, sample size calculations, and business recommendations",
      confidence: 0.85,
    },
  ],
};

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Retrieve pre-defined claims for a demo artifact by its manifest ID.
 * Returns null if no manifest exists for the given ID.
 */
export function getManifestClaims(
  demoManifestId: string,
): ManifestClaim[] | null {
  return MANIFESTS[demoManifestId] ?? null;
}

/**
 * Check whether a manifest exists for the given demo manifest ID.
 */
export function hasManifest(demoManifestId: string): boolean {
  return demoManifestId in MANIFESTS;
}
