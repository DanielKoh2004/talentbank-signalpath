"use client";

import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBandProps {
  title: string;
  description?: string;
  keyword: string;
  onKeywordChange: (value: string) => void;
  keywordPlaceholder?: string;
  location?: string;
  onLocationChange?: (value: string) => void;
  locationPlaceholder?: string;
  actionLabel?: string;
  onSubmit?: () => void;
  showAction?: boolean;
  children?: React.ReactNode;
}

export function SearchBand({
  title,
  description,
  keyword,
  onKeywordChange,
  keywordPlaceholder = "Search by role, skill, company...",
  location = "",
  onLocationChange,
  locationPlaceholder = "Location",
  actionLabel = "Search",
  onSubmit,
  showAction = true,
  children,
}: SearchBandProps) {
  return (
    <section className="overflow-hidden rounded-[1.4rem] bg-[#071f5c] text-white shadow-sm">
      <div className="relative p-5 sm:p-6">
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#123a8c]/70" />
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-[#0d2b75]/80" />

        <div className="relative space-y-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-blue-100">
                {description}
              </p>
            )}
          </div>

          <div className={showAction ? "grid gap-3 lg:grid-cols-[1fr_280px_auto]" : "grid gap-3 lg:grid-cols-[1fr_280px]"}>
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSubmit?.();
                }}
                placeholder={keywordPlaceholder}
                className="h-12 rounded-lg border-0 bg-white pl-11 text-base text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-white/60"
              />
            </label>

            {onLocationChange && (
              <label className="relative block">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={location}
                  onChange={(event) => onLocationChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSubmit?.();
                  }}
                  placeholder={locationPlaceholder}
                  className="h-12 rounded-lg border-0 bg-white pl-11 text-base text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-white/60"
                />
              </label>
            )}

            {showAction && (
              <Button
                className="h-12 rounded-lg bg-[#ec006d] px-8 text-sm font-black uppercase tracking-wide text-white hover:bg-[#d10062]"
                onClick={onSubmit}
              >
                {actionLabel}
              </Button>
            )}
          </div>

          {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
      </div>
    </section>
  );
}
