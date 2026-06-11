import type { LucideIcon } from "lucide-react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NextStepPanelProps {
  title?: string;
  steps: string[];
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export function NextStepPanel({
  title = "What to do next",
  steps,
  actionLabel,
  onAction,
  icon: Icon = Lightbulb,
}: NextStepPanelProps) {
  return (
    <Card className="border-[#071f5c]/20 bg-[#071f5c]/5 dark:border-blue-300/20 dark:bg-blue-300/5">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071f5c] text-white">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950 dark:text-white">
              {title}
            </h2>
            <ol className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
              {steps.map((step, index) => (
                <li key={step}>
                  <span className="font-bold text-[#071f5c] dark:text-blue-300">
                    {index + 1}.
                  </span>{" "}
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="shrink-0 gap-2">
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
