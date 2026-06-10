"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AIMemoPanel } from "@/components/employer/AIMemoPanel";
import {
  EvidenceMatrix,
  type EvidenceMatrixRow,
} from "@/components/employer/EvidenceMatrix";
import { ScoreBreakdown } from "@/components/employer/ScoreBreakdown";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Mail,
  Eye,
  ChevronDown,
  ChevronUp,
  Shield,
  Search,
} from "lucide-react";

// =============================================================================
// Role Workspace Page (Employer)
// Detailed role view with candidate interactions, readiness, and status mgmt.
// =============================================================================

interface RoleRequirement {
  id?: string;
  skillId: string;
  skillName: string;
  skillCategory?: string;
  importance: string;
  minimumEvidenceStrength: number;
  displayLabel: string | null;
}

interface InteractionData {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateStatus: string;
  employerStatus: string;
  readinessScore: number;
  gapCount: number;
  updatedAt: string;
}

interface MatchScoreData {
  id: string;
  candidateId: string;
  candidateName: string;
  totalScore: number;
  roleEvidenceCoverage: number;
  trajectoryFit: number;
  adjacentExperience: number;
  logisticsFit: number;
  growthSignal: number;
  preferenceAlignment: number;
  evidenceQuality: number;
  matrixJson: string | null;
  aiMemo: string | null;
  computedAt: string;
}

interface RoleDetail {
  id: string;
  title: string;
  employerId: string;
  roleFamilyId: string | null;
  roleFamilyName: string | null;
  location: string | null;
  workMode: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salarySource: string | null;
  description: string | null;
  status: string;
  requirements: RoleRequirement[];
  interactions: InteractionData[];
  matchScores: MatchScoreData[];
}

type CandidateFilter = "interested" | "all" | "shortlisted";

const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const EMPLOYER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  not_reviewed: {
    label: "Not Reviewed",
    color: "text-gray-500 bg-gray-100 dark:bg-gray-800",
    icon: Eye,
  },
  shortlisted: {
    label: "Shortlisted",
    color:
      "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/20",
    icon: UserCheck,
  },
  contacted: {
    label: "Contacted",
    color:
      "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/20",
    icon: Mail,
  },
  rejected: {
    label: "Rejected",
    color:
      "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20",
    icon: UserX,
  },
};

export default function RoleWorkspacePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = use(params);
  const router = useRouter();

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateFilter, setCandidateFilter] =
    useState<CandidateFilter>("interested");
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(
    null
  );
  const [isComputing, setIsComputing] = useState(false);

  const refreshRole = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/roles/${roleId}`);
      if (!res.ok) throw new Error("Role not found");
      const data = await res.json();
      setRole(data.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load role");
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/roles/${roleId}`);
        if (!res.ok) throw new Error("Role not found");
        const data = await res.json();
        if (!cancelled) setRole(data.role);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load role");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [roleId]);

  // Toggle expanded candidate readiness
  const toggleExpand = useCallback((candidateId: string) => {
    setExpandedCandidate((prev) =>
      prev === candidateId ? null : candidateId
    );
  }, []);

  const computeScores = useCallback(async () => {
    setIsComputing(true);
    setError(null);
    try {
      const res = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleBriefId: roleId }),
      });
      if (!res.ok) throw new Error("Failed to compute scores");
      await refreshRole();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compute scores");
    } finally {
      setIsComputing(false);
    }
  }, [refreshRole, roleId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading role workspace...</p>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-gray-500">
          {error ?? "Role not found"}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/roles")}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Roles
          </Button>
          <Button
            onClick={refreshRole}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Interaction stats
  const interactions = role.interactions ?? [];
  const interestedCandidates = interactions.filter(
    (i) => i.candidateStatus === "interested"
  );
  const shortlisted = interactions.filter(
    (i) => i.employerStatus === "shortlisted"
  );
  const avgReadiness =
    interactions.length > 0
      ? Math.round(
          (interactions.reduce(
            (sum, i) => sum + (i.readinessScore ?? 0),
            0
          ) /
            interactions.length) *
            100
        )
      : 0;

  // Filter candidates
  const filteredInteractions = interactions.filter((i) => {
    if (candidateFilter === "interested")
      return i.candidateStatus === "interested";
    if (candidateFilter === "shortlisted")
      return i.employerStatus === "shortlisted";
    return true;
  });

  const requiredCount = role.requirements.filter(
    (r) => r.importance === "required"
  ).length;
  const scoreByCandidateId = new Map(
    (role.matchScores ?? []).map((score) => [score.candidateId, score])
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Back button + header */}
      <div>
        <Button
          onClick={() => router.push("/roles")}
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-2 mb-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Roles
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {role.roleFamilyName && (
                <Badge variant="secondary" className="text-[10px]">
                  {role.roleFamilyName}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px]",
                  role.status === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {role.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-indigo-500" />
              {role.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {role.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {role.location}
                </span>
              )}
              {role.workMode && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {WORK_MODE_LABELS[role.workMode] ?? role.workMode}
                </span>
              )}
              {role.salaryMin != null && role.salaryMax != null && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {role.salaryCurrency}{" "}
                  {role.salaryMin.toLocaleString()}–
                  {role.salaryMax.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={refreshRole}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              onClick={computeScores}
              size="sm"
              className="gap-1.5"
              disabled={isComputing}
            >
              {isComputing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Shield className="h-3.5 w-3.5" />
              )}
              Compute Scores
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Interested"
          value={interestedCandidates.length.toString()}
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Shortlisted"
          value={shortlisted.length.toString()}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          label="Avg. Readiness"
          value={interactions.length > 0 ? `${avgReadiness}%` : "—"}
          icon={Shield}
          color="violet"
        />
        <StatCard
          label="Requirements"
          value={`${requiredCount} req`}
          icon={Briefcase}
          color="amber"
        />
      </div>

      {/* Main content: two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Requirements */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Requirements
              </h3>
              <div className="space-y-1.5">
                {role.requirements.map((req) => (
                  <div
                    key={req.skillId}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs",
                      req.importance === "required"
                        ? "bg-gray-50 dark:bg-gray-800"
                        : "bg-gray-50/50 dark:bg-gray-800/30"
                    )}
                  >
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                      {req.displayLabel || req.skillName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] px-1 py-0",
                          req.importance === "required"
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-400"
                        )}
                      >
                        {req.importance === "required"
                          ? "Required"
                          : "Nice to Have"}
                      </Badge>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ≥{req.minimumEvidenceStrength}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Role description */}
              {role.description && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Description
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Candidates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Candidates
              <Badge variant="secondary" className="text-[10px] ml-1">
                {interactions.length}
              </Badge>
            </h2>
          </div>

          {/* Filter tabs */}
          <Tabs
            value={candidateFilter}
            onValueChange={(v) =>
              setCandidateFilter(v as CandidateFilter)
            }
          >
            <TabsList>
              <TabsTrigger value="interested" className="gap-1.5">
                Interested
                {interestedCandidates.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 ml-0.5"
                  >
                    {interestedCandidates.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-1.5">
                All Candidates
              </TabsTrigger>
              <TabsTrigger value="shortlisted" className="gap-1.5">
                <UserCheck className="h-3 w-3" />
                Shortlisted
                {shortlisted.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 ml-0.5"
                  >
                    {shortlisted.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Candidate list */}
          {filteredInteractions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {candidateFilter === "interested"
                    ? "No interested candidates yet."
                    : candidateFilter === "shortlisted"
                      ? "No shortlisted candidates yet."
                      : "No candidate interactions found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredInteractions.map((interaction) => (
                <CandidateRow
                  key={interaction.id}
                  roleBriefId={role.id}
                  interaction={interaction}
                  matchScore={scoreByCandidateId.get(interaction.candidateId) ?? null}
                  isExpanded={expandedCandidate === interaction.candidateId}
                  onToggle={() => toggleExpand(interaction.candidateId)}
                  onChanged={refreshRole}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Candidate Row sub-component ---

interface MatrixPayload {
  evidenceMatrix: EvidenceMatrixRow[];
  memoSource?: "ai" | "matrix_fallback";
}

function parseMatrixPayload(matrixJson: string | null | undefined): MatrixPayload | null {
  if (!matrixJson) return null;
  try {
    const parsed = JSON.parse(matrixJson) as Partial<MatrixPayload>;
    if (!Array.isArray(parsed.evidenceMatrix)) return null;
    return {
      evidenceMatrix: parsed.evidenceMatrix,
      memoSource: parsed.memoSource,
    };
  } catch {
    return null;
  }
}

function CandidateRow({
  roleBriefId,
  interaction,
  matchScore,
  isExpanded,
  onToggle,
  onChanged,
}: {
  roleBriefId: string;
  interaction: InteractionData;
  matchScore: MatchScoreData | null;
  isExpanded: boolean;
  onToggle: () => void;
  onChanged: () => Promise<void>;
}) {
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const readinessPercent = Math.round((interaction.readinessScore ?? 0) * 100);
  const gapCount = interaction.gapCount ?? 0;

  const readinessColor =
    readinessPercent >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : readinessPercent >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";

  const progressColor =
    readinessPercent >= 70
      ? "[&>div]:bg-emerald-500"
      : readinessPercent >= 40
        ? "[&>div]:bg-amber-500"
        : "[&>div]:bg-red-500";

  const statusConfig =
    EMPLOYER_STATUS_CONFIG[interaction.employerStatus] ??
    EMPLOYER_STATUS_CONFIG["not_reviewed"];
  const StatusIcon = statusConfig.icon;
  const matrixPayload = parseMatrixPayload(matchScore?.matrixJson);
  const matrixRows = matrixPayload?.evidenceMatrix ?? [];

  const snapshotNotReady = async () => {
    const defaultReason =
      gapCount > 0
        ? `Not ready yet: ${gapCount} evidence gap${gapCount === 1 ? "" : "s"} remain.`
        : "Not ready yet after employer review.";
    const rejectionReason = window.prompt(
      "Why is this candidate not ready yet?",
      defaultReason,
    );

    if (rejectionReason === null) return;

    setIsSnapshotting(true);
    setActionMessage(null);
    setActionError(null);

    try {
      const res = await fetch("/api/re-engagement/baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: interaction.candidateId,
          roleBriefId,
          rejectionReason,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to snapshot baseline");
      }

      const data = await res.json();
      setActionMessage(
        `Baseline saved at ${data.snapshot.baselineScore}% with ${data.snapshot.baselineMissingSkillIds.length} missing skill${data.snapshot.baselineMissingSkillIds.length === 1 ? "" : "s"}.`,
      );
      await onChanged();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to snapshot baseline",
      );
    } finally {
      setIsSnapshotting(false);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        isExpanded && "ring-2 ring-indigo-200 dark:ring-indigo-800"
      )}
    >
      <CardContent className="p-0">
        {/* Main row */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold flex-shrink-0">
              {interaction.candidateName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {interaction.candidateName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="secondary"
                  className={cn("text-[9px] px-1.5 py-0", statusConfig.color)}
                >
                  <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                  {statusConfig.label}
                </Badge>
                {gapCount > 0 && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">
                    {gapCount} gap{gapCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Readiness */}
            <div className="text-right">
              <p
                className={cn(
                  "text-lg font-black tabular-nums",
                  readinessColor
                )}
              >
                {readinessPercent}%
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">
                Ready
              </p>
            </div>

            {/* Progress bar (compact) */}
            <div className="w-20 hidden sm:block">
              <Progress
                value={readinessPercent}
                className={cn(
                  "h-1.5 bg-gray-100 dark:bg-gray-800",
                  progressColor
                )}
              />
            </div>

            {/* Expand icon */}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded readiness detail */}
        {isExpanded && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/30">
            {matchScore && matrixRows.length > 0 ? (
              <div className="space-y-4">
                <ScoreBreakdown
                  totalScore={matchScore.totalScore}
                  breakdown={{
                    roleEvidenceCoverage: matchScore.roleEvidenceCoverage,
                    trajectoryFit: matchScore.trajectoryFit,
                    adjacentExperience: matchScore.adjacentExperience,
                    logisticsFit: matchScore.logisticsFit,
                    growthSignal: matchScore.growthSignal,
                    preferenceAlignment: matchScore.preferenceAlignment,
                    evidenceQuality: matchScore.evidenceQuality,
                  }}
                />
                <EvidenceMatrix rows={matrixRows} />
                <AIMemoPanel
                  memo={matchScore.aiMemo}
                  source={matrixPayload?.memoSource ?? "matrix_fallback"}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-sm text-gray-500">
                  No evidence matrix has been computed yet. Use Compute Scores to generate
                  the deterministic breakdown for this candidate.
                </CardContent>
              </Card>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button size="sm" className="gap-1.5 h-7 text-xs">
                <UserCheck className="h-3 w-3" />
                Shortlist
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-7 text-xs"
              >
                <Mail className="h-3 w-3" />
                Contact
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 h-7 text-xs text-red-500 hover:text-red-600"
                disabled={isSnapshotting}
                onClick={snapshotNotReady}
              >
                {isSnapshotting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <UserX className="h-3 w-3" />
                )}
                Not Ready
              </Button>
              <span className="ml-auto text-[10px] text-gray-400">
                Updated{" "}
                {new Date(interaction.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {(actionMessage || actionError) && (
              <div
                className={cn(
                  "mt-3 rounded-md px-3 py-2 text-xs",
                  actionError
                    ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
                )}
              >
                {actionError ?? actionMessage}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Stat Card sub-component ---

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: "indigo" | "amber" | "violet" | "emerald";
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            colorMap[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {value}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
