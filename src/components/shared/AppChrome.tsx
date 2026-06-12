"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MonitorCog, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GuidedHelp } from "@/components/shared/GuidedHelp";
import { PersonaSwitcher } from "@/components/shared/PersonaSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 pr-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#071f5c] text-white shadow-sm">
              <Compass className="h-4 w-4" />
            </span>
            <span className="leading-none">
              <span className="block text-base font-black tracking-tight text-slate-950 dark:text-white">
                SignalPath
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {sectionLabel}
              </span>
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto md:flex">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#071f5c] dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white xl:gap-1.5 xl:px-2.5",
                    active &&
                      "bg-transparent text-[#071f5c] hover:bg-slate-50 hover:text-[#071f5c] dark:text-white dark:hover:bg-slate-900"
                  )}
                >
                  <item.icon className="hidden h-4 w-4 opacity-75 2xl:block" />
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-2 -bottom-[7px] h-0.5 rounded-full bg-transparent",
                      active && "bg-[#ec006d]"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label="Open command menu"
                      title="Open command menu"
                      className="hidden h-9 rounded-full px-3 text-xs text-slate-500 lg:inline-flex"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("signalpath:open-command"),
                        )
                      }
                    />
                  }
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="font-semibold">Ctrl K</span>
                </TooltipTrigger>
                <TooltipContent>Open command menu</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      href="/demo-control"
                      className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#071f5c] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white sm:flex"
                    />
                  }
                >
                  <MonitorCog className="h-4 w-4" />
                  <span className="sr-only">Demo Control</span>
                </TooltipTrigger>
                <TooltipContent>Demo Control</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <GuidedHelp />
            <ThemeToggle />
            <div className="ml-1 border-l border-slate-200 pl-2 dark:border-slate-800">
              <PersonaSwitcher />
            </div>
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
