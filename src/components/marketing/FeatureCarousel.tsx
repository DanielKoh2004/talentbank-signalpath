"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface FeatureCarouselProps {
  features: FeatureItem[];
}

export function FeatureCarousel({ features }: FeatureCarouselProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % features.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [features.length]);

  const current = features[active];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <button
              type="button"
              key={feature.title}
              onClick={() => setActive(index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                active === index
                  ? "border-[#071f5c] bg-[#071f5c] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
              )}
            >
              <feature.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="text-sm font-bold">{feature.title}</span>
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-xl bg-slate-50 p-6 dark:bg-slate-900">
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-[#ec006d]/10" />
          <div className="relative max-w-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ec006d] text-white">
              <current.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-6 text-2xl font-black text-slate-950 dark:text-white">
              {current.title}
            </h3>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
              {current.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
