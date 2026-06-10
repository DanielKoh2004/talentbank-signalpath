// =============================================================================
// Local Fallback Extractor
// Simple rule-based extraction for when no AI provider is configured.
// Extracts claims by analyzing text for skill-related keywords and patterns.
// =============================================================================

import type { ManifestClaim } from "./manifest";

// --- Action verb patterns that indicate demonstrated skills ---
const ACTION_PATTERNS = [
  /(?:built|created|developed|designed|implemented|deployed|configured|automated|integrated|managed|led|architected|optimized|refactored|migrated|established|maintained|launched|delivered|shipped|wrote|authored|analyzed|tested|debugged|monitored|scaled|orchestrated|provisioned|secured|containerized|trained|evaluated|engineered|executed|constructed|assembled|crafted)\s+(.{10,120})/gi,
];

// --- Technology/skill keyword map ---
// Maps keywords found in text to canonical skill IDs
const KEYWORD_TO_SKILLS: Record<string, { skillIds: string[]; category: string }> = {
  // Languages & Frameworks
  "python": { skillIds: ["python_data"], category: "Data" },
  "javascript": { skillIds: ["javascript"], category: "Technical" },
  "typescript": { skillIds: ["typescript"], category: "Technical" },
  "react": { skillIds: ["react"], category: "Technical" },
  "next.js": { skillIds: ["nextjs"], category: "Technical" },
  "nextjs": { skillIds: ["nextjs"], category: "Technical" },
  "node.js": { skillIds: ["nodejs"], category: "Technical" },
  "nodejs": { skillIds: ["nodejs"], category: "Technical" },
  "sql": { skillIds: ["sql"], category: "Data" },
  "postgresql": { skillIds: ["sql"], category: "Data" },
  "mysql": { skillIds: ["sql"], category: "Data" },
  "mongodb": { skillIds: ["mongodb"], category: "Technical" },
  "java": { skillIds: ["java"], category: "Technical" },
  "c++": { skillIds: ["cpp"], category: "Technical" },
  "rust": { skillIds: ["rust"], category: "Technical" },
  "go": { skillIds: ["golang"], category: "Technical" },
  "golang": { skillIds: ["golang"], category: "Technical" },
  "swift": { skillIds: ["swift"], category: "Technical" },
  "kotlin": { skillIds: ["kotlin"], category: "Technical" },
  "ruby": { skillIds: ["ruby"], category: "Technical" },
  "php": { skillIds: ["php"], category: "Technical" },

  // Data & Analytics
  "data analysis": { skillIds: ["data_analysis"], category: "Data" },
  "data visualization": { skillIds: ["data_visualization"], category: "Data" },
  "machine learning": { skillIds: ["machine_learning"], category: "Data" },
  "deep learning": { skillIds: ["deep_learning"], category: "Data" },
  "pandas": { skillIds: ["python_data", "data_analysis"], category: "Data" },
  "numpy": { skillIds: ["python_data"], category: "Data" },
  "tableau": { skillIds: ["data_visualization"], category: "Data" },
  "power bi": { skillIds: ["data_visualization"], category: "Data" },
  "a/b test": { skillIds: ["ab_testing"], category: "Data" },
  "ab testing": { skillIds: ["ab_testing"], category: "Data" },
  "statistics": { skillIds: ["statistical_analysis"], category: "Data" },
  "analytics": { skillIds: ["product_analytics"], category: "Data" },

  // DevOps & Cloud
  "docker": { skillIds: ["docker"], category: "Operations" },
  "kubernetes": { skillIds: ["kubernetes"], category: "Operations" },
  "aws": { skillIds: ["aws"], category: "Operations" },
  "gcp": { skillIds: ["gcp"], category: "Operations" },
  "azure": { skillIds: ["azure"], category: "Operations" },
  "ci/cd": { skillIds: ["ci_cd"], category: "Operations" },
  "terraform": { skillIds: ["terraform"], category: "Operations" },
  "nginx": { skillIds: ["devops"], category: "Operations" },
  "linux": { skillIds: ["linux"], category: "Operations" },
  "git": { skillIds: ["git"], category: "Technical" },
  "github actions": { skillIds: ["ci_cd"], category: "Operations" },

  // Product & Communication
  "stakeholder": { skillIds: ["stakeholder_communication"], category: "Communication" },
  "presentation": { skillIds: ["presentation_skills"], category: "Communication" },
  "documentation": { skillIds: ["technical_writing"], category: "Communication" },
  "technical writing": { skillIds: ["technical_writing"], category: "Communication" },
  "product management": { skillIds: ["product_management"], category: "Product" },
  "user research": { skillIds: ["user_research"], category: "Product" },
  "agile": { skillIds: ["agile"], category: "Product" },
  "scrum": { skillIds: ["agile"], category: "Product" },
  "api": { skillIds: ["api_design"], category: "Technical" },
  "rest api": { skillIds: ["api_design"], category: "Technical" },
  "graphql": { skillIds: ["api_design"], category: "Technical" },

  // Security
  "security": { skillIds: ["security"], category: "Security" },
  "authentication": { skillIds: ["security"], category: "Security" },
  "encryption": { skillIds: ["security"], category: "Security" },
  "oauth": { skillIds: ["security"], category: "Security" },

  // Databases
  "redis": { skillIds: ["redis"], category: "Technical" },
  "elasticsearch": { skillIds: ["elasticsearch"], category: "Technical" },
  "firebase": { skillIds: ["firebase"], category: "Technical" },
  "supabase": { skillIds: ["supabase"], category: "Technical" },
  "prisma": { skillIds: ["orm"], category: "Technical" },
};

/**
 * Extract claims from raw text using rule-based NLP.
 * Used as fallback when no AI API key is configured.
 */
export function extractClaimsLocally(
  text: string,
  validSkillIds: Set<string>
): ManifestClaim[] {
  const claims: ManifestClaim[] = [];
  const seenClaims = new Set<string>();

  // 1. Extract action-verb sentences
  for (const pattern of ACTION_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const fullMatch = match[0].trim();
      // Clean up: take the sentence up to the first period or newline
      const sentence = fullMatch.split(/[.\n]/)[0].trim();

      if (sentence.length < 15 || sentence.length > 200) continue;

      const normalized = sentence.toLowerCase();
      if (seenClaims.has(normalized)) continue;
      seenClaims.add(normalized);

      const { skillIds, suggestedNames } = matchSkills(sentence, validSkillIds);
      if (skillIds.length === 0 && suggestedNames.length === 0) continue;

      claims.push({
        claimText: sentence,
        provenanceStatus: "artifact_backed",
        normalizedSkillIds: skillIds,
        suggestedSkillNames: suggestedNames,
        evidenceQualityScore: skillIds.length > 0 ? 3 : 2,
        sourceSpan: sentence,
        confidence: 0.6,
      });
    }
  }

  // 2. Scan for technology mentions in bullet points or short lines
  const lines = text.split(/\n/);
  for (const line of lines) {
    const trimmed = line.replace(/^[\s\-*•>]+/, "").trim();
    if (trimmed.length < 10 || trimmed.length > 200) continue;

    // Skip if it looks like a header/title or code
    if (/^[#={]/.test(trimmed)) continue;
    if (/^(import|from|const|let|var|function|class|export|return)\s/.test(trimmed)) continue;

    const normalized = trimmed.toLowerCase();
    if (seenClaims.has(normalized)) continue;

    const { skillIds, suggestedNames } = matchSkills(trimmed, validSkillIds);
    if (skillIds.length === 0) continue;

    // Only include lines that have some substance (contain a verb or descriptive word)
    if (!/\b(use[ds]?|built|made|implement|create|manage|deploy|handle|support|enable|provide|include|feature|allow|perform|run|serve|process|generate|display|render|fetch|store|connect|integrate|automat)\w*/i.test(trimmed)) {
      continue;
    }

    seenClaims.add(normalized);

    claims.push({
      claimText: trimmed,
      provenanceStatus: "artifact_backed",
      normalizedSkillIds: skillIds,
      suggestedSkillNames: suggestedNames,
      evidenceQualityScore: 2,
      sourceSpan: trimmed,
      confidence: 0.5,
    });
  }

  // 3. If we still have few claims, generate summary claims from detected technologies
  if (claims.length < 3) {
    const allDetectedSkills = detectAllSkills(text, validSkillIds);
    for (const { keyword, skillIds } of allDetectedSkills) {
      const claimText = `Demonstrates experience with ${keyword}`;
      const normalized = claimText.toLowerCase();
      if (seenClaims.has(normalized)) continue;
      seenClaims.add(normalized);

      claims.push({
        claimText,
        provenanceStatus: "self_claimed",
        normalizedSkillIds: skillIds,
        suggestedSkillNames: [],
        evidenceQualityScore: 1,
        confidence: 0.4,
      });

      if (claims.length >= 10) break;
    }
  }

  // Cap at 15 claims max
  return claims.slice(0, 15);
}

// --- Helpers ---

function matchSkills(
  text: string,
  validSkillIds: Set<string>
): { skillIds: string[]; suggestedNames: string[] } {
  const lower = text.toLowerCase();
  const skillIds = new Set<string>();
  const suggestedNames: string[] = [];

  for (const [keyword, mapping] of Object.entries(KEYWORD_TO_SKILLS)) {
    // Word boundary check (avoid matching "go" in "google")
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");

    if (regex.test(lower)) {
      for (const id of mapping.skillIds) {
        if (validSkillIds.has(id)) {
          skillIds.add(id);
        } else {
          suggestedNames.push(id);
        }
      }
    }
  }

  return {
    skillIds: Array.from(skillIds),
    suggestedNames: [...new Set(suggestedNames)],
  };
}

function detectAllSkills(
  text: string,
  validSkillIds: Set<string>
): Array<{ keyword: string; skillIds: string[] }> {
  const lower = text.toLowerCase();
  const results: Array<{ keyword: string; skillIds: string[] }> = [];
  const seenSkills = new Set<string>();

  for (const [keyword, mapping] of Object.entries(KEYWORD_TO_SKILLS)) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");

    if (regex.test(lower)) {
      const ids = mapping.skillIds.filter((id) => validSkillIds.has(id) && !seenSkills.has(id));
      if (ids.length > 0) {
        for (const id of ids) seenSkills.add(id);
        results.push({ keyword, skillIds: ids });
      }
    }
  }

  return results;
}
