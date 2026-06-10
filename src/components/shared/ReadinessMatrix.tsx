"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Minus,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// =============================================================================
// ReadinessMatrix
// Shared component used by both candidate (marketplace) and employer (role workspace).
// Shows requirement-by-requirement evidence coverage.
// =============================================================================

interface RequirementRow {
  skillId: string;
  skillName: string;
  displayLabel: string;
  importance: string;
  status: "met" | "partial" | "gap";
  evidenceStrength: number;
  minimumRequired: number;
}

interface ReadinessMatrixProps {
  requirements: RequirementRow[];
  readinessPercent: number;
  gapCount: number;
  metCount: number;
  variant?: "candidate" | "employer";
  className?: string;
}

const STATUS_CONFIG = {
  met: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    label: "Covered",
  },
  partial: {
    icon: Minus,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/10",
    label: "Partial",
  },
  gap: {
    icon: XCircle,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/10",
    label: "Gap",
  },
};

export function ReadinessMatrix({
  requirements,
  readinessPercent,
  gapCount,
  metCount,
  variant = "candidate",
  className,
}: ReadinessMatrixProps) {
  const readinessColor =
    readinessPercent >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : readinessPercent >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";

  const requiredReqs = requirements.filter((r) => r.importance === "required");
  const niceToHaveReqs = requirements.filter((r) => r.importance === "nice_to_have");

  return (
    <div className={cn("space-y-3", className)}>
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Readiness
          </span>
          <span className={cn("text-lg font-black tabular-nums", readinessColor)}>
            {readinessPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <Badge variant="secondary" className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
            {metCount} met
          </Badge>
          {gapCount > 0 && (
            <Badge variant="secondary" className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20">
              {gapCount} gap{gapCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      {/* Required skills */}
      {requiredReqs.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Required
          </h4>
          <div className="space-y-1">
            {requiredReqs.map((req) => (
              <RequirementRowComponent
                key={req.skillId}
                req={req}
              />
            ))}
          </div>
        </div>
      )}

      {/* Nice-to-have skills */}
      {niceToHaveReqs.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Nice to Have
          </h4>
          <div className="space-y-1">
            {niceToHaveReqs.map((req) => (
              <RequirementRowComponent
                key={req.skillId}
                req={req}
              />
            ))}
          </div>
        </div>
      )}

      {/* Candidate hint */}
      {variant === "candidate" && gapCount > 0 && (
        <div className="flex items-start gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/10 p-2 text-[11px] text-indigo-700 dark:text-indigo-400">
          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            Upload evidence in your Portfolio to close {gapCount} gap{gapCount !== 1 ? "s" : ""} and improve your readiness.
          </span>
        </div>
      )}
    </div>
  );
}

// --- Individual row ---

function RequirementRowComponent({
  req,
}: {
  req: RequirementRow;
}) {
  const config = STATUS_CONFIG[req.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors",
        config.bg
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          {req.displayLabel || req.skillName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("font-mono text-[10px]", config.color)}>
          {req.evidenceStrength}/{req.minimumRequired} min
        </span>
        <Badge
          variant="secondary"
          className={cn("text-[9px] px-1 py-0", config.color)}
        >
          {config.label}
        </Badge>
      </div>
    </div>
  );
}
