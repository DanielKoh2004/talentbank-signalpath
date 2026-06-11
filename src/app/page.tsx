"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileUp,
  GraduationCap,
  HeartHandshake,
  Layers3,
  Radar,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { FeatureCarousel } from "@/components/marketing/FeatureCarousel";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Living Portfolio",
    description:
      "Candidates upload proof once. SignalPath turns projects, certificates, and case studies into reviewable CV claims with proof source labels.",
    icon: FileUp,
  },
  {
    title: "Career Marketplace",
    description:
      "Roles and candidates meet through the same evidence graph, so the marketplace shows readiness, gaps, and next proof instead of keyword noise.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Smart Matching",
    description:
      "Employers see a row-by-row reason for every score. The AI memo explains the visible matrix; it never invents hidden evidence.",
    icon: Radar,
  },
  {
    title: "Ready to Reconnect",
    description:
      "Rejected candidates can resurface when their evidence improves, with a clear before-and-after delta for HR to approve.",
    icon: HeartHandshake,
  },
  {
    title: "Adaptive Readiness",
    description:
      "Universities see aggregate readiness gaps, like missing experimentation evidence, without exposing individual student data.",
    icon: GraduationCap,
  },
];

const AUDIENCES = [
  {
    title: "Candidates",
    description:
      "Build a CV that stays current and shows exactly which proof backs each claim.",
    href: "/portfolio",
    cta: "Try Candidate Demo",
    icon: Users,
  },
  {
    title: "Employers",
    description:
      "Review candidates by evidence fit, not keyword match, with proof cross-checking built in.",
    href: "/dashboard",
    cta: "Open Employer Demo",
    icon: ShieldCheck,
  },
  {
    title: "Universities",
    description:
      "Track cohort readiness gaps and align curriculum with real marketplace demand.",
    href: "/readiness",
    cta: "View University Dashboard",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071f5c] text-white">
              <Layers3 className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight">
                SignalPath
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec006d]">
                Proof over prediction
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
            <a href="#product">Product</a>
            <a href="#audiences">Audiences</a>
            <a href="#loop">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/portfolio"
              className={cn(buttonVariants(), "bg-[#ec006d] hover:bg-[#d10062]")}
            >
              Try Candidate Demo
            </Link>
          </div>
        </div>
      </header>

      <section
        className="relative min-h-[620px] overflow-hidden bg-[#071f5c] text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(2, 8, 28, 0.92), rgba(7, 31, 92, 0.78), rgba(2, 8, 28, 0.62)), url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1800&q=80')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#ec006d]" />
              Auditable AI for Career OS builders
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Turn career evidence into trusted matches.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-50">
              SignalPath turns messy proof into a living, auditable career graph
              that candidates own, employers can trust, and universities can use
              to understand readiness gaps.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/portfolio"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-[#ec006d] font-black hover:bg-[#d10062]"
                )}
              >
                Try Candidate Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white bg-transparent font-black text-white hover:bg-white hover:text-[#071f5c]"
                )}
              >
                Open Employer Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="loop" className="border-b border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Upload proof", "PDFs, repos, projects"],
              ["Review claims", "Human-approved evidence"],
              ["Match to roles", "Scores users can audit"],
              ["Show gaps", "Aggregate readiness insight"],
            ].map(([title, body], index) => (
              <Card key={title} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071f5c] text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <h2 className="mt-4 text-lg font-black">{title}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ec006d]">
              Product modules
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              One evidence graph. Five connected workflows.
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              The app stays honest by making every recommendation traceable back
              to accepted claims, uploaded proof, and deterministic score rows.
            </p>
          </div>
          <FeatureCarousel features={FEATURES} />
        </div>
      </section>

      <section id="audiences" className="bg-slate-50 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ec006d]">
                Built for the marketplace
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Candidates, employers, and universities see the same signal.
              </h2>
            </div>
            <Link
              href="/readiness"
              className={buttonVariants({ variant: "outline" })}
            >
              View University Dashboard
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <Card
                key={audience.title}
                className="group border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#071f5c] text-white">
                    <audience.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{audience.title}</h3>
                  <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {audience.description}
                  </p>
                  <Link
                    href={audience.href}
                    className={cn(
                      buttonVariants({ variant: "secondary" }),
                      "mt-5 w-full justify-between"
                    )}
                  >
                    {audience.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#071f5c] p-8 text-white shadow-xl sm:p-10">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-100">
                  <CheckCircle2 className="h-4 w-4 text-[#ec006d]" />
                  Demo-ready with seeded evidence, roles, and readiness gaps
                </div>
                <h2 className="mt-3 text-3xl font-black">
                  Walk the Aisha story from proof to trusted match.
                </h2>
                <p className="mt-3 max-w-2xl text-blue-100">
                  Upload proof, compute matches, reconnect after improvement,
                  then show the university-level gap.
                </p>
              </div>
              <Link
                href="/portfolio"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-[#ec006d] font-black hover:bg-[#d10062]"
                )}
              >
                Start Candidate Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
