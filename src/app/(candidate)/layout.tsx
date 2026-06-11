"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, FolderOpen, Map } from "lucide-react";
import { AppChrome, type AppNavItem } from "@/components/shared/AppChrome";
import { usePersona } from "@/providers/PersonaProvider";

const CANDIDATE_NAV: AppNavItem[] = [
  { label: "Living Portfolio", href: "/portfolio", icon: FolderOpen },
  { label: "Career Paths", href: "/paths", icon: Map },
  { label: "Marketplace", href: "/marketplace", icon: Briefcase },
];

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { persona } = usePersona();
  const router = useRouter();

  useEffect(() => {
    if (persona.role === "employer") {
      router.replace("/dashboard");
    } else if (persona.role === "university_admin") {
      router.replace("/readiness");
    }
  }, [persona.role, router]);

  if (persona.role !== "candidate") {
    return null;
  }

  return (
    <AppChrome navItems={CANDIDATE_NAV} sectionLabel="Candidate">
      {children}
    </AppChrome>
  );
}
