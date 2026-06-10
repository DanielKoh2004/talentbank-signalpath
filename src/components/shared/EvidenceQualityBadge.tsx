"use client";

import { EVIDENCE_QUALITY_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

// =============================================================================
// EvidenceQualityBadge
// Displays evidence quality score (0-5) with color coding.
// =============================================================================

function getQualityColor(score: number): string {
  if (score >= 4) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 3) return "text-blue-600 dark:text-blue-400";
  if (score >= 2) return "text-amber-600 dark:text-amber-400";
  if (score >= 1) return "text-orange-600 dark:text-orange-400";
  return "text-gray-500 dark:text-gray-400";
}

function getQualityBg(score: number): string {
  if (score >= 4) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 3) return "bg-blue-500/10 border-blue-500/20";
  if (score >= 2) return "bg-amber-500/10 border-amber-500/20";
  if (score >= 1) return "bg-orange-500/10 border-orange-500/20";
  return "bg-gray-500/10 border-gray-500/20";
}

interface EvidenceQualityBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function EvidenceQualityBadge({
  score,
  showLabel = true,
  size = "sm",
  className,
}: EvidenceQualityBadgeProps) {
  const clampedScore = Math.max(0, Math.min(5, Math.round(score)));
  const label = EVIDENCE_QUALITY_LABELS[clampedScore];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        getQualityColor(clampedScore),
        getQualityBg(clampedScore),
        className
      )}
      title={`Evidence Quality: ${clampedScore}/5 — ${label}`}
    >
      <Shield className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{clampedScore}/5</span>
      {showLabel && (
        <span className="hidden sm:inline">· {label}</span>
      )}
    </span>
  );
}
