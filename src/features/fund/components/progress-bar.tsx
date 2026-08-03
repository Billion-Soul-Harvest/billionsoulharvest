"use client";

import { cn } from "@/lib/utils";
import { getProgressPercentage } from "../utils/campaign-progress";

interface ProgressBarProps {
  raisedCents: number;
  goalCents: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  raisedCents,
  goalCents,
  className,
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const pct = getProgressPercentage(raisedCents, goalCents);

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={className}>
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", heights[size])}>
        <div
          className="bg-cyan-600 rounded-full transition-all duration-500 h-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1">{pct}% funded</p>
      )}
    </div>
  );
}
