"use client";

import { usePersona } from "@/providers/PersonaProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Compass } from "lucide-react";

// =============================================================================
// Landing Page
// Redirects to the appropriate dashboard based on active persona.
// =============================================================================

const ROLE_REDIRECTS: Record<string, string> = {
  candidate: "/portfolio",
  employer: "/dashboard",
  university_admin: "/readiness",
};

export default function LandingPage() {
  const { persona } = usePersona();
  const router = useRouter();

  useEffect(() => {
    const target = ROLE_REDIRECTS[persona.role] ?? "/portfolio";
    router.replace(target);
  }, [persona.role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <Compass className="h-8 w-8 text-white" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            SignalPath
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading your workspace…
          </p>
        </div>
      </div>
    </div>
  );
}
