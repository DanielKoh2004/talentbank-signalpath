"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { NextStepPanel } from "@/components/shared/NextStepPanel";
import { StepGuide } from "@/components/shared/StepGuide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

const ReadinessChart = dynamic(
  () => import("@/components/university/ReadinessChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton heightClass="h-72" />,
  },
);

const GapChart = dynamic(() => import("@/components/university/GapChart"), {
  ssr: false,
  loading: () => <ChartSkeleton heightClass="h-72" />,
});

const EvidenceCoverageChart = dynamic(
  () => import("@/components/university/EvidenceCoverageChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton heightClass="h-64" />,
  },
);

interface Cohort {
  id: string;
  universityName: string;
  facultyName: string;
  programName: string;
  year: number;
  studentCount: number;
  createdAt: string;
}

interface ReadinessByRoleFamily {
  roleFamilyId: string;
  roleFamilyName: string;
  readinessPercent: number;
  denominator: number;
  label: string;
}

interface SkillGapAggregate {
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

interface EvidenceCoverageAggregate {
  roleFamilyId: string;
  roleFamilyName: string;
  coveragePercent: number;
  denominator: number;
  label: string;
}

interface CurriculumGapCard {
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

interface UniversityDashboard {
  readinessByRoleFamily: ReadinessByRoleFamily[];
  topSkillGaps: SkillGapAggregate[];
  evidenceCoverage: EvidenceCoverageAggregate[];
  curriculumGapCards: CurriculumGapCard[];
  internshipReadiness: {
    readinessPercent: number;
    denominator: number;
    label: string;
  } | null;
  lastComputedAt: string;
  source: string;
  privacyBoundary: string;
}

interface UniversityApiResponse {
  cohorts: Cohort[];
  selectedCohort: Cohort;
  dashboard: UniversityDashboard;
}

export default function UniversityDashboardPage() {
  const [data, setData] = useState<UniversityApiResponse | null>(null);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (cohortId?: string | null) => {
    setError(null);
    const params = cohortId ? `?cohortId=${encodeURIComponent(cohortId)}` : "";
    const res = await fetch(`/api/university${params}`);
    if (!res.ok) throw new Error("Failed to load readiness aggregates");
    const nextData = (await res.json()) as UniversityApiResponse;
    setData(nextData);
    setSelectedCohortId(nextData.selectedCohort?.id ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      fetchDashboard(selectedCohortId)
        .catch((err) => {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load readiness aggregates",
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [fetchDashboard, selectedCohortId]);

  const dashboard = data?.dashboard;
  const cohort = data?.selectedCohort;
  const experimentationGap = useMemo(
    () =>
      dashboard?.topSkillGaps.find((gap) => gap.skillId === "ab_testing") ??
      null,
    [dashboard?.topSkillGaps],
  );
  const strongestFamily = dashboard?.readinessByRoleFamily[0];
  const weakestEvidence = dashboard?.evidenceCoverage.at(-1);

  const refresh = async () => {
    setLoading(true);
    try {
      await fetchDashboard(selectedCohortId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleCohortChange = async (cohortId: string) => {
    setSelectedCohortId(cohortId);
    setLoading(true);
    try {
      await fetchDashboard(cohortId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch cohort");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              Module 7
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Adaptive Readiness Profile
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cohort Readiness Without Individual Surveillance
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
            Aggregate evidence coverage, role-family readiness, and market-aligned
            curriculum gaps for the selected cohort.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCohortId ?? ""}
            onChange={(event) => handleCohortChange(event.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-amber-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            disabled={loading || !data?.cohorts?.length}
            aria-label="Select cohort"
          >
            {(data?.cohorts ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.universityName} {item.year}
              </option>
            ))}
          </select>
          {loading ? (
            <DisabledTooltipButton
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabledReason="Cohort aggregates are already loading."
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Refresh
            </DisabledTooltipButton>
          ) : (
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <StepGuide
        steps={[
          {
            title: "What skills are missing?",
            description: "Start with evidence gaps, not generic graduate traits.",
            status: "current",
          },
          {
            title: "Which roles are students ready for?",
            description: "Readiness bands are stored aggregates for fast demos.",
            status: "current",
          },
          {
            title: "What should curriculum improve?",
            description: "Use demand-linked gap cards to propose action.",
            status: "next",
          },
        ]}
      />

      <NextStepPanel
        steps={[
          "Pick the cohort.",
          "Review the experimentation gap.",
          "Connect the gap back to employer role demand.",
        ]}
        icon={GraduationCap}
      />

      {loading && !dashboard ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-gray-500">Loading cohort aggregates...</p>
        </div>
      ) : !dashboard || !cohort ? (
        <EmptyState
          icon={GraduationCap}
          title="No cohort aggregates found"
          description="Use demo control to repair the precomputed cohort aggregates before presenting this dashboard."
          actionLabel="Refresh Aggregates"
          onAction={refresh}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Students in Cohort"
              value={cohort.studentCount.toString()}
              detail={`${cohort.facultyName}, ${cohort.programName}`}
              icon={Users}
              color="amber"
            />
            <MetricCard
              label="Strongest Role Family"
              value={strongestFamily ? `${strongestFamily.readinessPercent}%` : "N/A"}
              detail={strongestFamily?.roleFamilyName ?? "No aggregate"}
              icon={Target}
              color="emerald"
            />
            <MetricCard
              label="Internship Readiness"
              value={
                dashboard.internshipReadiness
                  ? `${dashboard.internshipReadiness.readinessPercent}%`
                  : "N/A"
              }
              detail={
                dashboard.internshipReadiness
                  ? `${dashboard.internshipReadiness.denominator} students`
                  : "No aggregate"
              }
              icon={BookOpenCheck}
              color="blue"
            />
            <MetricCard
              label="Weakest Evidence Area"
              value={weakestEvidence ? `${weakestEvidence.coveragePercent}%` : "N/A"}
              detail={weakestEvidence?.roleFamilyName ?? "No aggregate"}
              icon={BarChart3}
              color="rose"
            />
          </div>

          {experimentationGap && (
            <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20">
              <CardContent className="grid gap-5 p-5 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-white text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Career OS Echo
                    </Badge>
                    <span className="text-xs font-semibold uppercase tracking-widest text-amber-700/70 dark:text-amber-300/70">
                      Candidate gap to cohort gap
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    0% of the 2025 cohort have artifact-backed experimentation evidence.
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    Experimentation appears in {experimentationGap.demandPercent}% of
                    Product Analytics role briefs, the same gap that made Aisha a
                    “not ready yet” candidate before she added her A/B testing project.
                  </p>
                </div>
                <div className="space-y-3">
                  <Progress
                    value={experimentationGap.evidenceCoveragePercent}
                    className="h-2 bg-white [&>div]:bg-amber-500 dark:bg-gray-900"
                  />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                        {experimentationGap.affectedStudents}
                      </p>
                      <p className="text-xs text-gray-500">
                        of {experimentationGap.denominator} students missing evidence
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                        {experimentationGap.demandPercent}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Product Analytics demand signal
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel
              title="Readiness by Role Family"
              subtitle="Precomputed cohort aggregate, shown with denominator."
            >
              <ReadinessChart data={dashboard.readinessByRoleFamily} />
            </Panel>
            <Panel
              title="Top Evidence Gaps"
              subtitle="Sorted to keep the employer rejection gap visible at cohort level."
            >
              <GapChart data={dashboard.topSkillGaps.slice(0, 4)} />
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel
              title="Evidence Coverage"
              subtitle="Artifact-backed coverage across role-family required skills."
            >
              <EvidenceCoverageChart data={dashboard.evidenceCoverage} />
            </Panel>

            <Panel
              title="Curriculum Interventions"
              subtitle="Actions are derived from stored aggregate gaps, not individual profiles."
            >
              <div className="space-y-3">
                {dashboard.curriculumGapCards.map((card) => (
                  <CurriculumCard key={card.id} card={card} />
                ))}
              </div>
            </Panel>
          </div>

          <Card>
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Aggregate privacy boundary
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {dashboard.privacyBoundary}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CalendarClock className="h-3.5 w-3.5" />
                Updated {new Date(dashboard.lastComputedAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function ChartSkeleton({ heightClass }: { heightClass: string }) {
  return (
    <div
      className={cn(
        "flex w-full animate-pulse items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-800",
        heightClass,
      )}
    >
      Loading chart
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  color: "amber" | "emerald" | "blue" | "rose";
}) {
  const colors = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="truncate text-[10px] text-gray-400">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function CurriculumCard({ card }: { card: CurriculumGapCard }) {
  const priorityStyle = {
    critical:
      "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    high: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    watch: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  }[card.priority];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge className={cn("text-[10px]", priorityStyle)}>
          {card.priority}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {card.roleFamilyName}
        </Badge>
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        {card.title}
      </h3>
      <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
        <p>{card.evidenceStatement}</p>
        <p>{card.demandStatement}</p>
        <p>{card.affectedStatement}</p>
      </div>
      <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        {card.recommendation}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400">
        <CheckCircle2 className="h-3 w-3" />
        {card.confidenceLabel}
      </div>
    </div>
  );
}
