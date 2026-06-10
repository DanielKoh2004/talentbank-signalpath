"use client";

import { useState } from "react";
import { usePersona } from "@/providers/PersonaProvider";
import { PersonaSwitcher } from "@/components/shared/PersonaSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  User,
  Building2,
  GraduationCap,
  Database,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// =============================================================================
// Demo Control Page
// Admin panel for managing demo state, persona switching, and resetting data.
// =============================================================================

export default function DemoControlPage() {
  const { persona } = usePersona();
  const [resetStatus, setResetStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [resetMessage, setResetMessage] = useState("");

  async function handleReset() {
    setResetStatus("loading");
    setResetMessage("");

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetStatus("success");
        setResetMessage(data.message ?? "Demo data reset successfully.");
      } else {
        setResetStatus("error");
        setResetMessage(data.error ?? "Reset failed.");
      }
    } catch {
      setResetStatus("error");
      setResetMessage("Failed to connect to the server.");
    }

    // Clear status after 5 seconds
    setTimeout(() => setResetStatus("idle"), 5000);
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-sm">
                <Compass className="h-5 w-5 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Demo Control
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Internal · Not visible to judges
              </p>
            </div>
          </div>
          <PersonaSwitcher />
        </div>

        <div className="grid gap-6">
          {/* Persona Switching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Active Persona
              </CardTitle>
              <CardDescription>
                Switch between demo personas to view different dashboards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <PersonaCard
                  name="Aisha Razak"
                  role="Candidate"
                  icon={User}
                  color="from-indigo-500 to-violet-600"
                  isActive={persona.role === "candidate"}
                  href="/portfolio"
                />
                <PersonaCard
                  name="DataCo HR"
                  role="Employer"
                  icon={Building2}
                  color="from-emerald-500 to-teal-600"
                  isActive={persona.role === "employer"}
                  href="/dashboard"
                />
                <PersonaCard
                  name="UM Admin"
                  role="University"
                  icon={GraduationCap}
                  color="from-amber-500 to-orange-600"
                  isActive={persona.role === "university_admin"}
                  href="/dashboard"
                />
              </div>
            </CardContent>
          </Card>

          {/* Demo Reset */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                Demo Data Reset
              </CardTitle>
              <CardDescription>
                Reset all data to the known demo state. Restores Aisha, DataCo, and UM seed data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleReset}
                  disabled={resetStatus === "loading"}
                  variant="destructive"
                  className="gap-2"
                >
                  {resetStatus === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Reset Demo Data
                </Button>

                {resetStatus === "success" && (
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {resetMessage}
                  </div>
                )}
                {resetStatus === "error" && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {resetMessage}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-900/20 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Expected scores after reset:</strong> Aisha → Junior Product Analyst = 61% (before A/B project), 79% (after A/B project upload + acceptance).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Scenario Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4" />
                Demo Scenario Status
              </CardTitle>
              <CardDescription>
                Current state of the Aisha / DataCo / UM demo narrative.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ScenarioStep
                  step={1}
                  label="Aisha opens Living Portfolio"
                  status="ready"
                />
                <ScenarioStep
                  step={2}
                  label="Upload seeded artifacts (cert + retail project)"
                  status="ready"
                />
                <ScenarioStep
                  step={3}
                  label="Extraction produces claims"
                  status="pending"
                  note="Requires Module 2"
                />
                <ScenarioStep
                  step={4}
                  label="Aisha approves claims → Living CV updates"
                  status="pending"
                  note="Requires Module 2"
                />
                <ScenarioStep
                  step={5}
                  label="Career Path Navigator shows 61% for Product Analyst"
                  status="pending"
                  note="Requires Module 3"
                />
                <ScenarioStep
                  step={6}
                  label="DataCo sees evidence matrix + AI memo"
                  status="pending"
                  note="Requires Module 5"
                />
                <ScenarioStep
                  step={7}
                  label="A/B project → re-engagement → 79%"
                  status="pending"
                  note="Requires Module 6"
                />
                <ScenarioStep
                  step={8}
                  label="UM dashboard shows cohort gaps"
                  status="pending"
                  note="Requires Module 7"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function PersonaCard({
  name,
  role,
  icon: Icon,
  color,
  isActive,
  href,
}: {
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  isActive: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
        isActive
          ? "border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800"
          : "border-transparent bg-gray-50 hover:bg-white hover:border-gray-200 hover:shadow-sm dark:bg-gray-800/50 dark:hover:bg-gray-800"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {name}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {role}
        </p>
      </div>
      {isActive && (
        <Badge variant="secondary" className="text-[10px]">
          Active
        </Badge>
      )}
    </Link>
  );
}

function ScenarioStep({
  step,
  label,
  status,
  note,
}: {
  step: number;
  label: string;
  status: "ready" | "pending" | "done";
  note?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          status === "ready"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : status === "done"
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        }`}
      >
        {step}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm ${
            status === "pending"
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {label}
        </p>
        {note && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}
