// =============================================================================
// AI Extraction Prompt Templates
// Builds structured prompts for the AI adapter to extract evidence claims
// from artifact text. Includes Zod schemas for response validation.
// =============================================================================

import { z } from "zod";

// ── Zod schemas for extraction output ───────────────────────────────────────

export const ExtractedClaimSchema = z.object({
  claimText: z.string(),
  normalizedSkillIds: z.array(z.string()),
  suggestedSkillNames: z.array(z.string()),
  provenanceStatus: z.enum([
    "artifact_backed",
    "document_backed",
    "self_claimed",
  ]),
  sourceSpan: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export const ExtractionResultSchema = z.object({
  claims: z.array(ExtractedClaimSchema),
});

export type ExtractedClaim = z.infer<typeof ExtractedClaimSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

// ── Taxonomy skill type expected by the prompt builder ──────────────────────

interface TaxonomySkill {
  id: string;
  name: string;
  category: string;
  aliases: string[];
}

// ── Prompt builder ──────────────────────────────────────────────────────────

/**
 * Build the extraction prompt for the AI adapter.
 *
 * The prompt instructs the AI to:
 * 1. Extract specific, evidence-backed claims from the artifact text
 * 2. Map each claim to canonical skill IDs from the provided taxonomy ONLY
 * 3. Put unmapped skills into suggestedSkillNames instead
 * 4. Assess provenance status based on content strength
 * 5. Include source quotes/spans where available
 * 6. NOT invent canonical skill IDs
 * 7. NOT treat generic statements as strong evidence
 */
export function buildExtractionPrompt(
  artifactText: string,
  taxonomySkills: TaxonomySkill[],
): string {
  // Format the taxonomy as a compact reference table
  const taxonomyReference = taxonomySkills
    .map((s) => {
      const aliasStr =
        s.aliases.length > 0 ? ` (aliases: ${s.aliases.join(", ")})` : "";
      return `  - "${s.id}": ${s.name} [${s.category}]${aliasStr}`;
    })
    .join("\n");

  return `You are an evidence extraction engine for a career skills platform.

## Task
Analyse the following artifact text and extract specific, evidence-backed claims about the candidate's skills and experience.

## Canonical Skill Taxonomy
You MUST map claims to skill IDs from this taxonomy ONLY. Do NOT invent new skill IDs.

${taxonomyReference}

## Rules
1. Each claim must describe a SPECIFIC action, achievement, or demonstrated competency — not a vague statement.
2. Map each claim to one or more canonical skill IDs from the taxonomy above. Use the skill's "id" field (the slug).
3. If a skill is mentioned but does NOT match any canonical skill ID (even after considering aliases), place the skill name in "suggestedSkillNames" instead. Never put non-canonical IDs in "normalizedSkillIds".
4. Assess provenance status:
   - "artifact_backed": The text directly demonstrates the skill through described work, projects, or outputs.
   - "document_backed": The text references a formal credential, certificate, or verified document.
   - "self_claimed": The text merely states the candidate has a skill without supporting evidence.
5. Include a "sourceSpan" with the exact quote from the artifact text that supports the claim. Keep it concise (1-2 sentences max).
6. Set "confidence" between 0 and 1:
   - 0.9-1.0: Clear, specific evidence with concrete outputs described.
   - 0.7-0.89: Good evidence but some ambiguity.
   - 0.5-0.69: Moderate evidence; claim is plausible but vague.
   - Below 0.5: Weak evidence; generic or unclear statements.
7. Do NOT treat generic statements like "familiar with X" or "knowledge of X" as strong evidence. These should be self_claimed with low confidence.
8. Do NOT extract claims about soft skills unless the text describes a specific instance where the skill was demonstrated.

## Output Format
Return a JSON object with a single "claims" array. Each claim object has:
- claimText (string): A clear sentence describing what the candidate did.
- normalizedSkillIds (string[]): Canonical skill IDs from the taxonomy.
- suggestedSkillNames (string[]): Skill names NOT in the taxonomy.
- provenanceStatus ("artifact_backed" | "document_backed" | "self_claimed")
- sourceSpan (string, optional): Exact quote from the text.
- confidence (number, 0-1)

## Artifact Text
---
${artifactText}
---

Extract all evidence-backed claims from the text above. Return ONLY valid JSON.`;
}
