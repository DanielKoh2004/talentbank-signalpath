"use client";

import { ProvenanceStatus, PROVENANCE_CONFIG } from "@/types";
import { cn } from "@/lib/utils";
import {
  GitBranch,
  FileCode,
  FileText,
  UserCheck,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

// =============================================================================
// ProvenanceBadge
// Visual status badge for all 6 provenance types.
// Uses calm status colors per execution plan: green=strong, amber=weak, grey=missing.
// =============================================================================

const PROVENANCE_ICONS: Record<ProvenanceStatus, React.ElementType> = {
  repo_backed: GitBranch,
  artifact_backed: FileCode,
  document_backed: FileText,
  reviewer_confirmed: UserCheck,
  self_claimed: MessageSquare,
  unmapped: HelpCircle,
};

const PROVENANCE_COLORS: Record<ProvenanceStatus, string> = {
  repo_backed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-400",
  artifact_backed: "bg-blue-500/15 text-blue-700 border-blue-500/25 dark:text-blue-400",
  document_backed: "bg-sky-500/15 text-sky-700 border-sky-500/25 dark:text-sky-400",
  reviewer_confirmed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-400",
  self_claimed: "bg-amber-500/15 text-amber-700 border-amber-500/25 dark:text-amber-400",
  unmapped: "bg-gray-500/15 text-gray-600 border-gray-500/25 dark:text-gray-400",
};

interface ProvenanceBadgeProps {
  status: ProvenanceStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ProvenanceBadge({
  status,
  showLabel = true,
  size = "sm",
  className,
}: ProvenanceBadgeProps) {
  const config = PROVENANCE_CONFIG[status];
  const Icon = PROVENANCE_ICONS[status];
  const colorClass = PROVENANCE_COLORS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        colorClass,
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
