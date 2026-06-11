"use client";

import { cn } from "@/lib/utils";

interface FilterPillProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function FilterPill({ children, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-white bg-white text-[#071f5c]"
          : "border-white/55 bg-transparent text-white hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}
