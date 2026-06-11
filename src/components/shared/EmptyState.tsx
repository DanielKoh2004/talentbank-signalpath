"use client";

import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: ComponentProps<typeof Button>["variant"];
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "default",
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "border-dashed border-2 border-muted p-8 text-center",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-0">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant={actionVariant} className="mt-5">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
