"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  X,
} from "lucide-react";

interface GuideStep {
  title: string;
  body: string;
  targetId?: string;
}

const HIGHLIGHT_CLASSES = [
  "ring-2",
  "ring-pink-500",
  "ring-offset-2",
  "ring-offset-background",
  "transition-shadow",
  "shadow-[0_0_0_6px_rgba(236,0,109,0.08)]",
];

const HIGHLIGHT_CLEANUP_CLASSES = [
  ...HIGHLIGHT_CLASSES,
  "ring-4",
  "ring-offset-4",
  "relative",
  "z-[60]",
];

const GUIDE_STEPS: Array<{
  match: (pathname: string) => boolean;
  steps: GuideStep[];
}> = [
  {
    match: (pathname) => pathname === "/marketplace",
    steps: [
      {
        title: "Search for roles",
        body: "Start by searching jobs by role, skill, or location. Filters narrow the list without hiding the proof guidance.",
        targetId: "candidate-marketplace-search",
      },
      {
        title: "Pick one role",
        body: "Select a role card to inspect the evidence fit on the right.",
        targetId: "candidate-marketplace-list",
      },
      {
        title: "Check the next action",
        body: "If you are below the shortlist threshold, SignalPath tells you exactly which proof to upload. If you are ready, apply.",
        targetId: "candidate-marketplace-action",
      },
    ],
  },
  {
    match: (pathname) => pathname === "/portfolio",
    steps: [
      {
        title: "Upload proof",
        body: "Add a project, certificate, resume, case study, or demo artifact. Proof creates claims for review.",
        targetId: "portfolio-upload-proof",
      },
      {
        title: "Review extracted claims",
        body: "Accept only claims that are true. Edited proof-backed claims are downgraded to self-claimed.",
        targetId: "portfolio-review-claims",
      },
      {
        title: "Watch the Living CV",
        body: "Accepted claims flow into the CV preview with visible proof sources.",
        targetId: "portfolio-living-cv",
      },
    ],
  },
  {
    match: (pathname) => pathname === "/profile",
    steps: [
      {
        title: "Fill basic profile",
        body: "Your name is required. Preferences like salary help matching, but stay optional.",
        targetId: "candidate-profile-basic",
      },
      {
        title: "Build your resume",
        body: "Write a resume from scratch or update the draft. Resume text finds skills that still need proof.",
        targetId: "candidate-profile-resume-builder",
      },
    ],
  },
  {
    match: (pathname) => pathname === "/roles",
    steps: [
      {
        title: "Create a role",
        body: "Create role briefs with title, location, work mode, description, and taxonomy requirements.",
        targetId: "employer-create-role",
      },
      {
        title: "Search role briefs",
        body: "Use search and filters to find the role workspace you want to review.",
        targetId: "employer-roles-search",
      },
    ],
  },
  {
    match: (pathname) => pathname.startsWith("/roles/"),
    steps: [
      {
        title: "Review applicants",
        body: "Applied candidates are marked clearly and include their note and reason for the role.",
        targetId: "employer-candidate-list",
      },
      {
        title: "Compute scores",
        body: "Generate the deterministic evidence matrix before making review decisions.",
        targetId: "employer-compute-scores",
      },
      {
        title: "Cross-check proof",
        body: "Open a candidate row to inspect the application details, match score, and proof matrix.",
        targetId: "employer-application-details",
      },
    ],
  },
  {
    match: (pathname) => pathname === "/applications",
    steps: [
      {
        title: "Track applications",
        body: "Every Apply action appears here with employer status and the next best proof action.",
      },
    ],
  },
  {
    match: (pathname) => pathname === "/re-engagement",
    steps: [
      {
        title: "Scan updates",
        body: "Ready to Reconnect shows candidates who improved after being marked not ready.",
      },
    ],
  },
  {
    match: (pathname) => pathname === "/readiness",
    steps: [
      {
        title: "Read cohort gaps",
        body: "Use this dashboard to see aggregate readiness gaps without exposing individual students.",
      },
    ],
  },
  {
    match: (pathname) => pathname === "/demo-control",
    steps: [
      {
        title: "Restore the demo",
        body: "Use Demo Control as the stage panel for resetting and launching the key story scenes.",
      },
    ],
  },
];

const DEFAULT_STEPS: GuideStep[] = [
  {
    title: "Start here",
    body: "Use the top navigation to move between the main workflow areas. Each page has one main action and a clear next step.",
  },
];

export function GuidedHelp() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => {
    return GUIDE_STEPS.find((guide) => guide.match(pathname))?.steps ?? DEFAULT_STEPS;
  }, [pathname]);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isLast = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (!open) {
      document
        .querySelectorAll("[data-help-highlight='true']")
        .forEach((element) => {
          element.removeAttribute("data-help-highlight");
          element.classList.remove(...HIGHLIGHT_CLEANUP_CLASSES);
        });
      return;
    }

    document
      .querySelectorAll("[data-help-highlight='true']")
      .forEach((element) => {
        element.removeAttribute("data-help-highlight");
        element.classList.remove(...HIGHLIGHT_CLEANUP_CLASSES);
      });

    if (!currentStep?.targetId) return;

    const target = document.querySelector<HTMLElement>(
      `[data-help-id="${currentStep.targetId}"]`,
    );
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.setAttribute("data-help-highlight", "true");
    target.classList.add(...HIGHLIGHT_CLASSES);
  }, [currentStep, open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="pointer-events-none fixed inset-0 z-[100]">
            <div className="pointer-events-auto fixed inset-x-4 bottom-4 sm:inset-x-auto sm:right-6 sm:w-[380px]">
              <Card className="border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-600">
                        Step {stepIndex + 1} of {steps.length}
                      </p>
                      <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                        {currentStep.title}
                      </h2>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setOpen(false)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close help</span>
                    </Button>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {currentStep.body}
                  </p>

                  {currentStep.targetId &&
                    !document.querySelector(
                      `[data-help-id="${currentStep.targetId}"]`,
                    ) && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                        This section is hidden right now. Complete the previous
                        step or use the empty-state action to reveal it.
                      </p>
                    )}

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={stepIndex === 0}
                      onClick={() =>
                        setStepIndex((current) => Math.max(0, current - 1))
                      }
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </Button>
                    <div className="flex items-center gap-1">
                      {steps.map((step, index) => (
                        <span
                          key={`${step.title}-${index}`}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            index === stepIndex
                              ? "bg-pink-600"
                              : "bg-slate-200 dark:bg-slate-800",
                          )}
                        />
                      ))}
                    </div>
                    {isLast ? (
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setOpen(false)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Finish
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5"
                        onClick={() =>
                          setStepIndex((current) =>
                            Math.min(steps.length - 1, current + 1),
                          )
                        }
                      >
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Open guided help"
        title="Open guided help"
        className="h-9 rounded-full px-2.5 2xl:gap-2 2xl:px-3"
        onClick={() => {
          setStepIndex(0);
          setOpen(true);
        }}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden 2xl:inline">Help</span>
      </Button>
      {panel}
    </>
  );
}
