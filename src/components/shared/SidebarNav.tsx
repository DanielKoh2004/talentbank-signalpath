"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// =============================================================================
// Sidebar Navigation
// Shared sidebar layout for all persona dashboards.
// =============================================================================

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface SidebarNavProps {
  items: NavItem[];
  title: string;
  accentColor: string;
}

export function SidebarNav({ items, title, accentColor }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      <div className="mb-3 px-2">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.15em]",
            accentColor
          )}
        >
          {title}
        </span>
      </div>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
            )}
          >
            <Icon
              className={cn(
                "h-4.5 w-4.5 flex-shrink-0 transition-colors",
                isActive
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400"
              )}
            />
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex-shrink-0 rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
