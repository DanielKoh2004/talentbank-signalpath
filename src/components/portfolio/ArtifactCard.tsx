"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArtifactFromAPI } from "@/hooks/useArtifacts";
import {
  FileText,
  Code,
  Award,
  Globe,
  Image,
  FolderOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// =============================================================================
// ArtifactCard
// Displays artifact with extraction status and claim count.
// When status is "needs_input", shows an inline paste form so the user
// can provide content and re-trigger extraction.
// =============================================================================

const TYPE_ICONS: Record<string, React.ElementType> = {
  cv: FileText,
  project: Code,
  certificate: Award,
  repo_link: Globe,
  portfolio_link: Globe,
  case_study: FolderOpen,
  screenshot: Image,
  other: FileText,
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  queued: { icon: Clock, color: "text-gray-500", label: "Queued" },
  processing: { icon: Loader2, color: "text-blue-500", label: "Extracting..." },
  needs_input: { icon: MessageCircle, color: "text-amber-500", label: "Needs Content" },
  completed: { icon: CheckCircle2, color: "text-emerald-500", label: "Complete" },
  failed: { icon: AlertCircle, color: "text-red-500", label: "Failed" },
};

interface ArtifactCardProps {
  artifact: ArtifactFromAPI;
  isSelected?: boolean;
  onClick?: () => void;
  /** Called when user provides text for a needs_input artifact */
  onProvideContent?: (artifactId: string, text: string) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function ArtifactCard({
  artifact,
  isSelected,
  onClick,
  onProvideContent,
  isSubmitting,
  className,
}: ArtifactCardProps) {
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const Icon = TYPE_ICONS[artifact.type] ?? FileText;
  const latestJob = artifact.extractionJobs[0];
  const status = latestJob ? STATUS_CONFIG[latestJob.status] : null;
  const StatusIcon = status?.icon;
  const needsInput = latestJob?.status === "needs_input";

  function handleSubmitContent() {
    if (!pastedText.trim() || !onProvideContent) return;
    onProvideContent(artifact.id, pastedText.trim());
    setPastedText("");
    setShowPasteForm(false);
  }

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-150",
        isSelected
          ? "border-indigo-400 bg-indigo-50/70 shadow-sm dark:border-indigo-500 dark:bg-indigo-900/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50",
        needsInput && "border-amber-300 dark:border-amber-700",
        className
      )}
    >
      {/* Main row — clickable header */}
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
            isSelected
              ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
              : needsInput
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {artifact.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {artifact.type}
            </Badge>
            {status && StatusIcon && (
              <span className={cn("flex items-center gap-1 text-[11px] font-medium", status.color)}>
                <StatusIcon
                  className={cn(
                    "h-3 w-3",
                    latestJob?.status === "processing" && "animate-spin"
                  )}
                />
                {status.label}
                {latestJob && latestJob.createdClaimCount > 0 && (
                  <span className="text-gray-400 ml-0.5">
                    · {latestJob.createdClaimCount} claims
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Toggle paste form button for needs_input */}
        {needsInput && onProvideContent && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowPasteForm(!showPasteForm);
            }}
            className="flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 cursor-pointer"
          >
            <Send className="h-3 w-3" />
            Paste Content
            {showPasteForm ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        )}
      </button>

      {/* Expandable paste form */}
      {showPasteForm && needsInput && (
        <div className="border-t border-amber-200 bg-amber-50/50 px-3 pb-3 pt-2 dark:border-amber-800 dark:bg-amber-900/10">
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
            Paste the project README, certificate text, or any description of your work. We&apos;ll extract evidence claims from it.
          </p>
          <Textarea
            placeholder="Paste your content here...&#10;&#10;e.g., project README, repo description, certificate details, or a written summary of what you built and what skills you used."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={5}
            className="mb-2 text-sm bg-white dark:bg-gray-800"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {pastedText.length > 0 ? `${pastedText.length} characters` : ""}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowPasteForm(false);
                  setPastedText("");
                }}
              >
                Cancel
              </Button>
              {!pastedText.trim() || isSubmitting ? (
                <DisabledTooltipButton
                  size="sm"
                  variant="secondary"
                  className="gap-1.5"
                  disabledReason={
                    isSubmitting
                      ? "Artifact content is already being submitted."
                      : "Paste artifact content before extracting claims."
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Extract Claims
                </DisabledTooltipButton>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSubmitContent}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Extract Claims
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
