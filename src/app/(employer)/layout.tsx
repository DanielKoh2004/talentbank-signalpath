"use client";

import { SidebarNav, NavItem } from "@/components/shared/SidebarNav";
import { PersonaSwitcher } from "@/components/shared/PersonaSwitcher";
import { usePersona } from "@/providers/PersonaProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Compass,
  LayoutDashboard,
  Briefcase,
  UserSearch,
  Settings,
} from "lucide-react";
import Link from "next/link";

// =============================================================================
// Employer Layout
// Sidebar navigation for employer-facing features.
// =============================================================================

const EMPLOYER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Roles", href: "/roles", icon: Briefcase },
  { label: "Re-Engagement", href: "/re-engagement", icon: UserSearch },
];

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { persona } = usePersona();
  const router = useRouter();

  // Redirect non-employers away
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
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-gray-200/80 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-gray-200/80 px-5 py-4 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <Compass className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                SignalPath
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5">
                Employer
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3">
          <SidebarNav
            items={EMPLOYER_NAV}
            title="Workspace"
            accentColor="text-emerald-500"
          />
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200/80 p-3 dark:border-gray-800">
          <Link
            href="/demo-control"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Demo Control</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/80 bg-white/80 px-6 py-3 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
          <div />
          <PersonaSwitcher />
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
