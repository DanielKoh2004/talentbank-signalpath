import { getAI } from "@/lib/ai";
import type { EvidenceMatrixRow, MatchScoreBreakdown } from "./match-score";

interface MemoInput {
  candidateName: string;
  roleTitle: string;
  totalScore: number;
  breakdown: MatchScoreBreakdown;
  evidenceMatrix: EvidenceMatrixRow[];
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function buildDeterministicMemo(input: MemoInput): string {
  const covered = input.evidenceMatrix.filter((row) => row.status === "met");
  const partial = input.evidenceMatrix.filter((row) => row.status === "partial");
  const gaps = input.evidenceMatrix.filter((row) => row.status === "gap");

  const strongest = covered
    .slice()
    .sort((a, b) => b.evidenceStrength - a.evidenceStrength)
    .slice(0, 3)
    .map((row) => row.displayLabel)
    .join(", ");

  const gapText = gaps.map((row) => row.displayLabel).join(", ");
  const partialText = partial.map((row) => row.displayLabel).join(", ");

  const lines = [
    `${input.candidateName} currently scores ${formatPercent(input.totalScore)} for ${input.roleTitle}. The strongest evidence coverage is ${formatPercent(input.breakdown.roleEvidenceCoverage)}, with overall evidence quality at ${formatPercent(input.breakdown.evidenceQuality)}.`,
  ];

  if (strongest) {
    lines.push(`Covered requirements: ${strongest}. These rows have direct claim evidence in the matrix.`);
  }

  if (partialText || gapText) {
    lines.push(
      [
        partialText ? `Partial coverage: ${partialText}.` : "",
        gapText ? `Open gaps: ${gapText}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  lines.push(
    "Use the matrix rows below as the source of truth. The memo is generated only from visible requirements, claims, and deterministic score dimensions.",
  );

  return lines.join("\n\n");
}

function buildPrompt(input: MemoInput): string {
  const rows = input.evidenceMatrix.map((row) => ({
    skill: row.displayLabel,
    importance: row.importance,
    status: row.status,
    evidenceStrength: row.evidenceStrength,
    minimumRequired: row.minimumRequired,
    claims: row.matchingClaims.map((claim) => ({
      text: claim.claimText,
      provenance: claim.provenanceStatus,
      quality: claim.evidenceQualityScore,
    })),
    relationNote: row.relationNote ?? null,
  }));

  return [
    "Write a short employer-facing match memo.",
    "Only reference facts present in the evidence matrix JSON below.",
    "Do not invent experience, employers, schools, salaries, or future outcomes.",
    "Use honest uncertainty language and mention gaps clearly.",
    "",
    JSON.stringify({
      candidateName: input.candidateName,
      roleTitle: input.roleTitle,
      totalScore: input.totalScore,
      breakdown: input.breakdown,
      evidenceMatrix: rows,
    }),
  ].join("\n");
}

export async function generateMatchMemo(input: MemoInput): Promise<{
  memo: string;
  source: "ai" | "matrix_fallback";
}> {
  const hasAIConfig = Boolean(
    process.env.AI_API_KEY && process.env.AI_BASE_URL && process.env.AI_MODEL,
  );

  if (!hasAIConfig) {
    return {
      memo: buildDeterministicMemo(input),
      source: "matrix_fallback",
    };
  }

  try {
    const memo = await getAI().generateText(buildPrompt(input));
    return {
      memo: memo.trim() || buildDeterministicMemo(input),
      source: memo.trim() ? "ai" : "matrix_fallback",
    };
  } catch (error) {
    console.warn("[match-memo] AI memo failed, using matrix fallback:", error);
    return {
      memo: buildDeterministicMemo(input),
      source: "matrix_fallback",
    };
  }
}
