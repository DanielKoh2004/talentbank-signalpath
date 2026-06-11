"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, LayoutDashboard, UserSearch } from "lucide-react";
import { AppChrome, type AppNavItem } from "@/components/shared/AppChrome";
import { usePersona } from "@/providers/PersonaProvider";

const EMPLOYER_NAV: AppNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Roles", href: "/roles", icon: Briefcase },
  { label: "Ready to Reconnect", href: "/re-engagement", icon: UserSearch },
];

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { persona } = usePersona();
  const router = useRouter();

  useEffect(() => {
    if (persona.role === "candidate") {
      router.replace("/portfolio");
    } else if (persona.role === "university_admin") {
      router.replace("/readiness");
    }
  }, [persona.role, router]);

  if (persona.role !== "employer") {
    return null;
  }

  return (
    <AppChrome navItems={EMPLOYER_NAV} sectionLabel="Employer">
      {children}
    </AppChrome>
  );
}
