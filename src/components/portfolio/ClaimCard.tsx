"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { EvidenceQualityBadge } from "@/components/shared/EvidenceQualityBadge";
import { SkillTag } from "@/components/shared/SkillTag";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ClaimFromAPI } from "@/hooks/useClaims";
import {
  Check,
  X,
  Pencil,
  Quote,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ProvenanceStatus, SkillCategory } from "@/types";

// =============================================================================
// ClaimCard
// Evidence claim review card — accept, edit, or reject.
// Shows provenance badge, quality score, skill tags, and source span.
// =============================================================================

interface ClaimCardProps {
  claim: ClaimFromAPI;
  onAccept: (claimId: string) => void;
  onReject: (claimId: string) => void;
  onEdit: (data: {
    claimId: string;
    editedText?: string;
    editedSkillIds?: string[];
  }) => void;
  isUpdating: boolean;
  skillMap?: Record<string, { name: string; category: string }>;
  className?: string;
}

export function ClaimCard({
  claim,
  onAccept,
  onReject,
  onEdit,
  isUpdating,
  skillMap = {},
  className,
}: ClaimCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(claim.claimText);
  const [showSource, setShowSource] = useState(false);

  const isPending = claim.candidateStatus === "pending";
  const isAccepted = claim.candidateStatus === "accepted" || claim.candidateStatus === "edited";
  const isRejected = claim.candidateStatus === "rejected";

  function handleSaveEdit() {
    onEdit({ claimId: claim.id, editedText });
    setIsEditing(false);
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all duration-200",
        isPending && "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-900/10",
        isAccepted && "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-900/10",
        isRejected && "border-gray-200 bg-gray-50/50 opacity-60 dark:border-gray-700 dark:bg-gray-800/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ProvenanceBadge
            status={claim.provenanceStatus as ProvenanceStatus}
            size="sm"
          />
          <EvidenceQualityBadge
            score={claim.evidenceQualityScore}
            size="sm"
            showLabel={false}
          />
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
          from {claim.artifact.title}
        </span>
      </div>

      {/* Claim text */}
      {isEditing ? (
        <div className="space-y-2 mb-3">
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={3}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setEditedText(claim.claimText);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
          {claim.claimText}
        </p>
      )}

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {claim.normalizedSkillIds.map((skillId) => {
          const skill = skillMap[skillId];
          return (
            <SkillTag
              key={skillId}
              name={skill?.name ?? skillId}
              category={skill?.category as SkillCategory | undefined}
              size="sm"
            />
          );
        })}
        {claim.suggestedSkillNames.map((name) => (
          <SkillTag key={name} name={name} isSuggested size="sm" />
        ))}
      </div>

      {/* Source span */}
      {claim.sourceSpan && (
        <div className="mb-3">
          <button
            onClick={() => setShowSource(!showSource)}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <Quote className="h-3 w-3" />
            <span>Source evidence</span>
            {showSource ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {showSource && (
            <div className="mt-1.5 rounded bg-gray-100 p-2.5 text-xs text-gray-600 italic border-l-2 border-indigo-300 dark:bg-gray-800 dark:text-gray-400 dark:border-indigo-600">
              &ldquo;{claim.sourceSpan}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {isPending && !isEditing && (
        <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
          <Button
            size="sm"
            onClick={() => onAccept(claim.id)}
            disabled={isUpdating}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReject(claim.id)}
            disabled={isUpdating}
            className="gap-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      )}

      {/* Status indicator for already-reviewed claims */}
      {isAccepted && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
          <Check className="h-3 w-3" />
          <span>Accepted — visible in Living CV</span>
        </div>
      )}
      {isRejected && (
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
          <X className="h-3 w-3" />
          <span>Rejected</span>
        </div>
      )}
    </div>
  );
}
