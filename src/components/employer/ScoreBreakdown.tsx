"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BarChart3, Info } from "lucide-react";

export interface ScoreBreakdownData {
  roleEvidenceCoverage: number;
  trajectoryFit: number;
  adjacentExperience: number;
  logisticsFit: number;
  growthSignal: number;
  preferenceAlignment: number;
  evidenceQuality: number;
}

const SCORED_DIMENSIONS: Array<{
  key: keyof ScoreBreakdownData;
  label: string;
  weight: string;
}> = [
  { key: "roleEvidenceCoverage", label: "Evidence Coverage", weight: "35%" },
  { key: "trajectoryFit", label: "Trajectory Fit", weight: "25%" },
  { key: "adjacentExperience", label: "Adjacent Experience", weight: "15%" },
  { key: "logisticsFit", label: "Logistics Fit", weight: "10%" },
  { key: "growthSignal", label: "Growth Signal", weight: "10%" },
  { key: "preferenceAlignment", label: "Preference Alignment", weight: "5%" },
];

function scoreTone(score: number): string {
  if (score >= 0.7) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 0.4) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function progressTone(score: number): string {
  if (score >= 0.7) return "[&>div]:bg-emerald-500";
  if (score >= 0.4) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

function DimensionBar({ label, weight, value }: { label: string; weight: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {label}
        </span>
        <span className="flex items-center gap-2 tabular-nums">
          <span className="text-gray-400">{weight}</span>
          <span className={cn("font-bold", scoreTone(value))}>
            {Math.round(value * 100)}%
          </span>
        </span>
      </div>
      <Progress
        value={Math.round(value * 100)}
        className={cn("h-1.5 bg-gray-100 dark:bg-gray-800", progressTone(value))}
      />
    </div>
  );
}

export function ScoreBreakdown({
  totalScore,
  breakdown,
}: {
  totalScore: number;
  breakdown: ScoreBreakdownData;
}) {
  const eqValue = breakdown.evidenceQuality ?? 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Score Breakdown
          </h3>
          <span className={cn("text-2xl font-black tabular-nums", scoreTone(totalScore))}>
            {Math.round(totalScore * 100)}%
          </span>
        </div>

        <div className="space-y-2.5">
          {SCORED_DIMENSIONS.map((dim) => (
            <DimensionBar
              key={dim.key}
              label={dim.label}
              weight={dim.weight}
              value={breakdown[dim.key] ?? 0}
            />
          ))}
        </div>

        {/* Informational audit dimension — not included in weighted total */}
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 cursor-help">
                    Evidence Quality
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    Informational only — average quality of supporting evidence. Does not affect the total match score.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-gray-400 italic text-[10px]">info</span>
                <span className={cn("font-bold", scoreTone(eqValue))}>
                  {Math.round(eqValue * 100)}%
                </span>
              </span>
            </div>
            <Progress
              value={Math.round(eqValue * 100)}
              className={cn("h-1 bg-gray-100 dark:bg-gray-800 opacity-60", progressTone(eqValue))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
