"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  ChevronRight,
  Heart,
  EyeOff,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  Upload,
} from "lucide-react";

// =============================================================================
// OpportunityCard
// Shared component with candidate and employer variants.
// =============================================================================

interface OpportunityCardData {
  id: string;
  title: string;
  roleFamilyName: string | null;
  location: string | null;
  workMode: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salarySource: string | null;
  employerName?: string;
  description: string | null;
  requirements: Array<{
    skillId: string;
    skillName: string;
    importance: string;
    displayLabel: string | null;
  }>;
  interactionCount?: number;
  readinessPercent?: number;
  gapCount?: number;
  candidateStatus?: string;
  thresholdPercent?: number;
  pointsToThreshold?: number;
  topGapSkill?: {
    skillId: string;
    skillName: string;
    status: string;
    evidenceStrength: number;
    minimumRequired: number;
  } | null;
}

interface OpportunityCardProps {
  role: OpportunityCardData;
  variant: "candidate" | "employer";
  onInterest?: (roleId: string) => void;
  onApply?: (roleId: string) => void;
  onUploadProof?: (roleId: string, skillId: string) => void;
  onHide?: (roleId: string) => void;
  onView?: (roleId: string) => void;
  interestLoading?: boolean;
  applyLoading?: boolean;
  className?: string;
}

const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export function OpportunityCard({
  role,
  variant,
  onInterest,
  onApply,
  onUploadProof,
  onHide,
  onView,
  interestLoading,
  applyLoading,
  className,
}: OpportunityCardProps) {
  const requiredCount = role.requirements.filter(
    (r) => r.importance === "required"
  ).length;

  const isInterested = role.candidateStatus === "interested";
  const isApplied = role.candidateStatus === "applied";
  const thresholdPercent = role.thresholdPercent ?? 75;
  const isBelowThreshold =
    variant === "candidate" &&
    role.readinessPercent !== undefined &&
    role.readinessPercent < thresholdPercent &&
    !!role.topGapSkill;

  const readinessColor =
    (role.readinessPercent ?? 0) >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : (role.readinessPercent ?? 0) >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";

  const progressColor =
    (role.readinessPercent ?? 0) >= 70
      ? "[&>div]:bg-emerald-500"
      : (role.readinessPercent ?? 0) >= 40
        ? "[&>div]:bg-amber-500"
        : "[&>div]:bg-red-500";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group",
        isInterested && "ring-2 ring-indigo-200 dark:ring-indigo-800",
        className
      )}
      onClick={() => onView?.(role.id)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {role.roleFamilyName && (
                <Badge variant="secondary" className="text-[10px]">
                  {role.roleFamilyName}
                </Badge>
              )}
              {isInterested && (
                <Badge className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <Heart className="h-2.5 w-2.5 mr-0.5 fill-current" />
                  Interested
                </Badge>
              )}
              {isApplied && (
                <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                  Applied
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {role.title}
            </h3>
          </div>

          {/* Readiness (candidate view) */}
          {variant === "candidate" && role.readinessPercent !== undefined && (
            <div className="text-right ml-3">
              <p className={cn("text-xl font-black tabular-nums", readinessColor)}>
                {role.readinessPercent}%
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">
                Ready
              </p>
            </div>
          )}

          {/* Interaction count (employer view) */}
          {variant === "employer" && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{role.interactionCount ?? 0}</span>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          {role.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {role.location}
            </span>
          )}
          {role.workMode && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {WORK_MODE_LABELS[role.workMode] ?? role.workMode}
            </span>
          )}
          {role.salaryMin != null && role.salaryMax != null && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {role.salaryCurrency} {role.salaryMin.toLocaleString()}–{role.salaryMax.toLocaleString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {requiredCount} required skill{requiredCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Readiness bar (candidate) */}
        {variant === "candidate" && role.readinessPercent !== undefined && (
          <Progress
            value={role.readinessPercent}
            className={cn("h-1.5 bg-gray-100 dark:bg-gray-800", progressColor)}
          />
        )}

        {isBelowThreshold && role.topGapSkill && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">
                  You are {Math.max(1, role.pointsToThreshold ?? 1)} point
                  {(role.pointsToThreshold ?? 1) === 1 ? "" : "s"} away from the{" "}
                  {role.employerName ?? "employer"} shortlist.
                </p>
                <p className="mt-1 leading-5">
                  {role.employerName ?? "This employer"} requires{" "}
                  <span className="font-bold">{role.topGapSkill.skillName}</span>.
                  Upload proof for this skill to cross the {thresholdPercent}%
                  threshold and notify HR.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skills preview */}
        <div className="flex flex-wrap gap-1">
          {role.requirements.slice(0, 3).map((req) => (
            <Badge
              key={req.skillId}
              variant="secondary"
              className={cn(
                "text-[10px]",
                req.importance === "required"
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-800/50 text-gray-400"
              )}
            >
              {req.displayLabel || req.skillName}
            </Badge>
          ))}
          {role.requirements.length > 3 && (
            <Badge variant="secondary" className="text-[10px] text-gray-400">
              +{role.requirements.length - 3} more
            </Badge>
          )}
        </div>

        {/* Description preview */}
        {role.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {role.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {variant === "candidate" && (
            <div className="flex items-center gap-2">
              {isApplied ? (
                <DisabledTooltipButton
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-emerald-600"
                  disabledReason="Your application has already been sent."
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Application Sent
                </DisabledTooltipButton>
              ) : isBelowThreshold && role.topGapSkill ? (
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUploadProof?.(role.id, role.topGapSkill!.skillId);
                  }}
                >
                  <Upload className="h-3 w-3" />
                  Upload Evidence
                </Button>
              ) : role.readinessPercent !== undefined &&
                role.readinessPercent >= thresholdPercent ? (
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  disabled={applyLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply?.(role.id);
                  }}
                >
                  <Send className="h-3 w-3" />
                  Apply Now
                </Button>
              ) : !isInterested ? (
                interestLoading ? (
                  <DisabledTooltipButton
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs gap-1"
                    disabledReason="Interest signal is being saved."
                  >
                    <Heart className="h-3 w-3" />
                    Express Interest
                  </DisabledTooltipButton>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInterest?.(role.id);
                    }}
                  >
                    <Heart className="h-3 w-3" />
                    Express Interest
                  </Button>
                )
              ) : (
                <DisabledTooltipButton
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-emerald-600"
                  disabledReason="You have already expressed interest in this role."
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Interest Sent
                </DisabledTooltipButton>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 text-gray-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onHide?.(role.id);
                }}
              >
                <EyeOff className="h-3 w-3" />
                Hide
              </Button>
            </div>
          )}

          {variant === "employer" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(role.id);
              }}
            >
              View Workspace
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}

          {/* Gap indicator */}
          {variant === "candidate" &&
            role.gapCount !== undefined &&
            role.gapCount > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                {role.gapCount} skill gap{role.gapCount !== 1 ? "s" : ""}
              </span>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
