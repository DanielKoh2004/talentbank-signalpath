export interface UniversityAggregateRow {
  id: string;
  roleFamilyId: string | null;
  roleFamilyName: string | null;
  skillId: string | null;
  skillName: string | null;
  metricType: string;
  metricValue: number;
  metricLabel: string;
  denominator: number;
  computedAt: Date | string;
}

export interface ReadinessByRoleFamily {
  roleFamilyId: string;
  roleFamilyName: string;
  readinessPercent: number;
  denominator: number;
  label: string;
}

export interface SkillGapAggregate {
  skillId: string;
  skillName: string;
  roleFamilyId: string;
  roleFamilyName: string;
  evidenceCoveragePercent: number;
  missingPercent: number;
  affectedStudents: number;
  denominator: number;
  demandPercent: number | null;
  demandDenominator: number | null;
  label: string;
  demandLabel: string | null;
}

export interface EvidenceCoverageAggregate {
  roleFamilyId: string;
  roleFamilyName: string;
  coveragePercent: number;
  denominator: number;
  label: string;
}

export interface CurriculumGapCard {
  id: string;
  title: string;
  roleFamilyName: string;
  evidenceStatement: string;
  demandStatement: string;
  affectedStatement: string;
  recommendation: string;
  confidenceLabel: string;
  priority: "critical" | "high" | "watch";
}

function percent(value: number) {
  return Math.round(value * 100);
}

function affectedStudents(coverage: number, denominator: number) {
  return Math.max(0, denominator - Math.round(coverage * denominator));
}

function demandKey(row: UniversityAggregateRow) {
  return `${row.roleFamilyId ?? "none"}:${row.skillId ?? "none"}`;
}

function prettifySkill(skillName: string, skillId: string) {
  if (skillId === "ab_testing") return "Experimentation";
  return skillName;
}

function recommendationFor(skillId: string, skillName: string) {
  const recommendations: Record<string, string> = {
    ab_testing:
      "Add an experimentation case project where students design a hypothesis, define success metrics, interpret A/B results, and publish the artifact to their portfolio.",
    product_analytics:
      "Require a product metrics dashboard artifact in the capstone so students can demonstrate funnel, retention, and cohort analysis.",
    stakeholder_communication:
      "Add a review checkpoint where students present analytical trade-offs to a non-technical stakeholder panel.",
    python_data:
      "Introduce a reusable data-cleaning notebook artifact in the analytics methods course.",
  };

  return recommendations[skillId] ?? `Add an artifact-backed assessment for ${skillName}.`;
}

export function buildUniversityReadiness(rows: UniversityAggregateRow[]) {
  const demandRows = new Map(
    rows
      .filter((row) => row.metricType === "market_demand")
      .map((row) => [demandKey(row), row]),
  );

  const readinessByRoleFamily = rows
    .filter((row) => row.metricType === "readiness_distribution" && row.roleFamilyId)
    .map<ReadinessByRoleFamily>((row) => ({
      roleFamilyId: row.roleFamilyId!,
      roleFamilyName: row.roleFamilyName ?? "Unknown role family",
      readinessPercent: percent(row.metricValue),
      denominator: row.denominator,
      label: row.metricLabel,
    }))
    .sort((a, b) => b.readinessPercent - a.readinessPercent);

  const evidenceCoverage = rows
    .filter((row) => row.metricType === "evidence_coverage" && row.roleFamilyId)
    .map<EvidenceCoverageAggregate>((row) => ({
      roleFamilyId: row.roleFamilyId!,
      roleFamilyName: row.roleFamilyName ?? "Unknown role family",
      coveragePercent: percent(row.metricValue),
      denominator: row.denominator,
      label: row.metricLabel,
    }))
    .sort((a, b) => b.coveragePercent - a.coveragePercent);

  const topSkillGaps = rows
    .filter(
      (row) =>
        row.metricType === "missing_skill" &&
        row.skillId &&
        row.roleFamilyId &&
        row.skillName,
    )
    .map<SkillGapAggregate>((row) => {
      const demand = demandRows.get(demandKey(row));
      const evidenceCoveragePercent = percent(row.metricValue);
      return {
        skillId: row.skillId!,
        skillName: prettifySkill(row.skillName!, row.skillId!),
        roleFamilyId: row.roleFamilyId!,
        roleFamilyName: row.roleFamilyName ?? "Unknown role family",
        evidenceCoveragePercent,
        missingPercent: 100 - evidenceCoveragePercent,
        affectedStudents: affectedStudents(row.metricValue, row.denominator),
        denominator: row.denominator,
        demandPercent: demand ? percent(demand.metricValue) : null,
        demandDenominator: demand?.denominator ?? null,
        label: row.metricLabel,
        demandLabel: demand?.metricLabel ?? null,
      };
    })
    .sort((a, b) => {
      if (a.skillId === "ab_testing") return -1;
      if (b.skillId === "ab_testing") return 1;
      return b.missingPercent - a.missingPercent;
    });

  const curriculumGapCards = topSkillGaps.slice(0, 3).map<CurriculumGapCard>((gap) => ({
    id: `${gap.roleFamilyId}:${gap.skillId}`,
    title:
      gap.skillId === "ab_testing"
        ? "Experimentation evidence is missing at cohort scale"
        : `${gap.skillName} evidence gap`,
    roleFamilyName: gap.roleFamilyName,
    evidenceStatement: `${gap.evidenceCoveragePercent}% of the cohort has artifact-backed ${gap.skillName.toLowerCase()} evidence.`,
    demandStatement:
      gap.demandPercent == null
        ? "No marketplace demand benchmark is attached yet."
        : `${gap.demandPercent}% of ${gap.roleFamilyName} role briefs in the benchmark require this skill.`,
    affectedStatement: `${gap.affectedStudents} of ${gap.denominator} students are missing artifact-backed evidence.`,
    recommendation: recommendationFor(gap.skillId, gap.skillName),
    confidenceLabel:
      gap.demandPercent == null
        ? "Cohort aggregate only"
        : "Cohort aggregate + marketplace demand aggregate",
    priority:
      gap.missingPercent >= 80 && (gap.demandPercent ?? 0) >= 50
        ? "critical"
        : gap.missingPercent >= 50
          ? "high"
          : "watch",
  }));

  const internshipReadiness = rows.find(
    (row) => row.metricType === "internship_readiness",
  );

  return {
    readinessByRoleFamily,
    topSkillGaps,
    evidenceCoverage,
    curriculumGapCards,
    internshipReadiness: internshipReadiness
      ? {
          readinessPercent: percent(internshipReadiness.metricValue),
          denominator: internshipReadiness.denominator,
          label: internshipReadiness.metricLabel,
        }
      : null,
  };
}
