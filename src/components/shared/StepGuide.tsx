import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepGuideItem {
  title: string;
  description: string;
  status?: "done" | "current" | "next";
}

interface StepGuideProps {
  steps: StepGuideItem[];
}

export function StepGuide({ steps }: StepGuideProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => {
        const Icon =
          step.status === "done"
            ? CheckCircle2
            : step.status === "current"
              ? CircleDot
              : Circle;
        return (
          <div
            key={step.title}
            className={cn(
              "rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950",
              step.status === "current"
                ? "border-[#071f5c] ring-2 ring-[#071f5c]/10 dark:border-blue-300"
                : "border-slate-200 dark:border-slate-800"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon
                className={cn(
                  "h-4 w-4",
                  step.status === "done"
                    ? "text-emerald-600"
                    : step.status === "current"
                      ? "text-[#071f5c] dark:text-blue-300"
                      : "text-slate-400"
                )}
              />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Step {index + 1}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-black text-slate-950 dark:text-white">
              {step.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {step.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
