"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Compass,
  TrendingUp,
  Rocket,
  Shield,
  Shuffle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Minus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

// =============================================================================
// PathCard
// Career path card with readiness score, evidence, gaps, and suggested actions.
// =============================================================================

const PATH_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; gradient: string; label: string }
> = {
  nearby: {
    icon: Compass,
    color: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    label: "Nearby",
  },
  stretch: {
    icon: TrendingUp,
    color: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500/10 to-amber-500/5",
    label: "Stretch",
  },
  pivot: {
    icon: Shuffle,
    color: "text-violet-600 dark:text-violet-400",
    gradient: "from-violet-500/10 to-violet-500/5",
    label: "Pivot",
  },
  growth: {
    icon: Rocket,
    color: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
    label: "Growth",
  },
  stability: {
    icon: Shield,
    color: "text-slate-600 dark:text-slate-400",
    gradient: "from-slate-500/10 to-slate-500/5",
    label: "Stability",
  },
};

interface PathCardData {
  id: string;
  type: string;
  label: string;
  roleTitle: string;
  roleFamilyName: string;
  readinessPercent: number;
  whyThisPath: string;
  supportingEvidence: Array<{
    claimText: string;
    skillNames: string[];
    qualityScore: number;
  }>;
  missingSkills: Array<{
    skillId: string;
    skillName: string;
    suggestedAction: string;
  }>;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
    source: string;
  };
  uncertaintyNote: string;
  requirementCoverage?: Array<{
    skillId: string;
    displayLabel: string;
    importance: string;
    status: string;
    evidenceStrength: number;
    minimumRequired: number;
  }>;
}

interface PathCardProps {
  path: PathCardData;
  className?: string;
}

export function PathCard({ path, className }: PathCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = PATH_CONFIG[path.type] ?? PATH_CONFIG.nearby;
  const Icon = config.icon;

  const readinessColor =
    path.readinessPercent >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : path.readinessPercent >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";

  const progressColor =
    path.readinessPercent >= 70
      ? "[&>div]:bg-emerald-500"
      : path.readinessPercent >= 40
        ? "[&>div]:bg-amber-500"
        : "[&>div]:bg-red-500";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      {/* Gradient header */}
      <div className={cn("bg-gradient-to-r p-4", config.gradient)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm",
                config.color
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn("text-[10px] font-bold uppercase", config.color)}
                >
                  {config.label}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {path.roleFamilyName}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {path.roleTitle}
              </h3>
            </div>
          </div>

          {/* Readiness score */}
          <div className="text-right">
            <p className={cn("text-2xl font-black tabular-nums", readinessColor)}>
              {path.readinessPercent}%
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Readiness
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <Progress
            value={path.readinessPercent}
            className={cn("h-2 bg-gray-200/50 dark:bg-gray-700/50", progressColor)}
          />
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Why this path */}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {path.whyThisPath}
        </p>

        {/* Salary range */}
        {path.salaryRange && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <DollarSign className="h-3.5 w-3.5" />
            <span>
              {path.salaryRange.currency}{" "}
              {path.salaryRange.min.toLocaleString()}–
              {path.salaryRange.max.toLocaleString()}
            </span>
            <span className="text-gray-400">·</span>
            <span className="italic">{path.salaryRange.source}</span>
          </div>
        )}

        {/* Supporting evidence (top 3) */}
        {path.supportingEvidence.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Supporting Evidence
            </h4>
            <div className="space-y-1.5">
              {path.supportingEvidence.slice(0, 3).map((ev, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span>{ev.claimText}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {ev.skillNames.map((name) => (
                        <Badge
                          key={name}
                          variant="secondary"
                          className="text-[9px] px-1 py-0"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing skills / gaps */}
        {path.missingSkills.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Skills to Build
            </h4>
            <div className="space-y-1.5">
              {path.missingSkills.map((gap) => (
                <div
                  key={gap.skillId}
                  className="flex items-start gap-2 text-xs"
                >
                  <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {gap.skillName}
                    </span>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5 flex items-start gap-1">
                      <BookOpen className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {gap.suggestedAction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable: requirement coverage detail */}
        {path.requirementCoverage && path.requirementCoverage.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {expanded ? "Hide" : "Show"} requirement details
            </button>

            {expanded && (
              <div className="mt-2 space-y-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                {path.requirementCoverage.map((req) => (
                  <div
                    key={req.skillId}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {req.status === "met" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : req.status === "partial" ? (
                        <Minus className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span className="text-gray-700 dark:text-gray-200">
                        {req.displayLabel}
                      </span>
                      {req.importance === "nice_to_have" && (
                        <span className="text-[9px] text-gray-400">(nice to have)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          req.status === "met"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : req.status === "partial"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-400"
                        )}
                      >
                        {req.evidenceStrength}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Uncertainty note */}
        <div className="flex items-start gap-1.5 rounded-md bg-amber-50 dark:bg-amber-900/10 p-2 text-[11px] text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{path.uncertaintyNote}</span>
        </div>
      </CardContent>
    </Card>
  );
}
