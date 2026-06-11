"use client";

import { CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skillName: string;
  provenance_status: string;
  className?: string;
}

export function SkillBadge({
  skillName,
  provenance_status,
  className,
}: SkillBadgeProps) {
  const isArtifactBacked = provenance_status === "artifact_backed";
  const Icon = isArtifactBacked ? CheckCircle2 : Info;

  return (
    <Badge
      variant={isArtifactBacked ? "default" : "outline"}
      className={cn(
        "h-6 gap-1.5 rounded-full px-2.5 text-[11px] font-semibold",
        isArtifactBacked
          ? "border-emerald-700/20 bg-emerald-600 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-600"
          : "border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-50 dark:border-amber-800/70 dark:bg-amber-950/30 dark:text-amber-300",
        className,
      )}
      title={
        isArtifactBacked
          ? "Artifact-backed skill"
          : "Self-claimed or not artifact-backed"
      }
    >
      <Icon className="h-3 w-3" />
      <span className="max-w-[12rem] truncate">{skillName}</span>
    </Badge>
  );
}
