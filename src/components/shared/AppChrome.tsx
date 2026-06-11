"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MonitorCog, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PersonaSwitcher } from "@/components/shared/PersonaSwitcher";
import { cn } from "@/lib/utils";

export interface AppNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AppChromeProps {
  children: React.ReactNode;
  navItems: AppNavItem[];
  sectionLabel: string;
}

export function AppChrome({ children, navItems, sectionLabel }: AppChromeProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071f5c] text-white shadow-sm">
              <Compass className="h-4.5 w-4.5" />
            </span>
            <span className="leading-none">
              <span className="block text-lg font-black tracking-tight text-slate-950 dark:text-white">
                SignalPath
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {sectionLabel}
              </span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#071f5c] dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                    active &&
                      "bg-[#071f5c] text-white shadow-sm hover:bg-[#071f5c] hover:text-white dark:bg-white dark:text-[#071f5c] dark:hover:bg-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 lg:flex">
              <Search className="h-3.5 w-3.5" />
              <span>Ctrl K</span>
            </div>
            <Link
              href="/demo-control"
              className="hidden h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#071f5c] dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white sm:flex"
            >
              <MonitorCog className="h-4 w-4" />
              Demo Control
            </Link>
            <PersonaSwitcher />
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-4 py-2 dark:border-slate-900 dark:bg-slate-950 md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold",
                    active
                      ? "border-[#071f5c] bg-[#071f5c] text-white"
                      : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
