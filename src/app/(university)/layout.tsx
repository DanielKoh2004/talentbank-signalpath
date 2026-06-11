"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { AppChrome, type AppNavItem } from "@/components/shared/AppChrome";
import { usePersona } from "@/providers/PersonaProvider";

const UNIVERSITY_NAV: AppNavItem[] = [
  { label: "Readiness Dashboard", href: "/readiness", icon: LayoutDashboard },
];

export default function UniversityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { persona } = usePersona();
  const router = useRouter();

  useEffect(() => {
    if (persona.role === "candidate") {
      router.replace("/portfolio");
    } else if (persona.role === "employer") {
      router.replace("/dashboard");
    }
  }, [persona.role, router]);

  if (persona.role !== "university_admin") {
    return null;
  }

  return (
    <AppChrome navItems={UNIVERSITY_NAV} sectionLabel="University">
      {children}
    </AppChrome>
  );
}
