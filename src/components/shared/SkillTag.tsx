"use client";

import { SkillCategory } from "@/types";
import { cn } from "@/lib/utils";

// =============================================================================
// SkillTag
// Taxonomy skill chip with category-based color coding.
// =============================================================================

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Data: "bg-violet-500/15 text-violet-700 border-violet-500/25 dark:text-violet-400",
  Product: "bg-indigo-500/15 text-indigo-700 border-indigo-500/25 dark:text-indigo-400",
  Communication: "bg-rose-500/15 text-rose-700 border-rose-500/25 dark:text-rose-400",
  Technical: "bg-cyan-500/15 text-cyan-700 border-cyan-500/25 dark:text-cyan-400",
  Business: "bg-amber-500/15 text-amber-700 border-amber-500/25 dark:text-amber-400",
  Security: "bg-red-500/15 text-red-700 border-red-500/25 dark:text-red-400",
  Operations: "bg-teal-500/15 text-teal-700 border-teal-500/25 dark:text-teal-400",
};

interface SkillTagProps {
  name: string;
  category?: SkillCategory;
  /** Whether this is a suggested (unmapped) skill vs canonical */
  isSuggested?: boolean;
  size?: "sm" | "md";
  onRemove?: () => void;
  className?: string;
}

export function SkillTag({
  name,
  category,
  isSuggested = false,
  size = "sm",
  onRemove,
  className,
}: SkillTagProps) {
  const colorClass = isSuggested
    ? "bg-gray-500/10 text-gray-600 border-gray-300 border-dashed dark:text-gray-400 dark:border-gray-600"
    : category
      ? CATEGORY_COLORS[category]
      : "bg-gray-500/15 text-gray-700 border-gray-500/25 dark:text-gray-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-sm",
        colorClass,
        className
      )}
      title={
        isSuggested
          ? `Suggested skill (not in canonical taxonomy, does not score)`
          : category
            ? `${category} skill`
            : undefined
      }
    >
      {isSuggested && (
        <span className="opacity-60">?</span>
      )}
      <span>{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
