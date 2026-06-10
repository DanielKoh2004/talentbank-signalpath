"use client";

import { getReadinessLevel, READINESS_CONFIG } from "@/types";
import { cn, formatPercent } from "@/lib/utils";

// =============================================================================
// ReadinessIndicator
// Shows a readiness percentage bar with status label.
// Used in path cards, opportunity cards, and match matrices.
// =============================================================================

const READINESS_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  not_ready: {
    bar: "bg-red-500",
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
  },
  building: {
    bar: "bg-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
  },
  near_ready: {
    bar: "bg-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
  },
  ready_to_discuss: {
    bar: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
  },
};

interface ReadinessIndicatorProps {
  /** Score between 0 and 1 */
  score: number;
  /** Optional label to show alongside the percentage */
  label?: string;
  /** Show the status label (e.g., "Near Ready") */
  showStatus?: boolean;
  /** Visual size */
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ReadinessIndicator({
  score,
  label,
  showStatus = true,
  size = "md",
  className,
}: ReadinessIndicatorProps) {
  const level = getReadinessLevel(score);
  const config = READINESS_CONFIG[level];
  const colors = READINESS_COLORS[level];
  const percent = Math.max(0, Math.min(100, Math.round(score * 100)));

  const barHeight = size === "sm" ? "h-1.5" : size === "md" ? "h-2" : "h-3";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showStatus && (
            <span className={cn("text-xs font-semibold", colors.text)}>
              {config.label}
            </span>
          )}
        </div>
        <span className={cn("text-sm font-semibold tabular-nums", colors.text)}>
          {formatPercent(score)}
        </span>
      </div>
      <div
        className={cn(
          "w-full rounded-full overflow-hidden",
          barHeight,
          "bg-gray-200 dark:bg-gray-700"
        )}
      >
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            barHeight,
            colors.bar
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
