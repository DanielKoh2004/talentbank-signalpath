"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function AIMemoPanel({
  memo,
  source,
}: {
  memo: string | null | undefined;
  source?: "ai" | "matrix_fallback" | string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = memo?.split(/\n{2,}/) ?? [];

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Match Memo
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {source === "ai" ? "AI-generated" : "Generated from evidence matrix"}
          </Badge>
        </div>

        {memo ? (
          <div className="space-y-2">
            <div
              className={
                expanded
                  ? "space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200"
                  : "line-clamp-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200"
              }
            >
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
              ))}
            </div>
            {memo.length > 180 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-0 text-xs text-primary hover:bg-transparent"
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? "Show less" : "Read more"}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Compute scores to generate a memo from the evidence matrix.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
