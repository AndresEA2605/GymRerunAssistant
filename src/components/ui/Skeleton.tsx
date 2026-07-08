"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className = "", rounded = "md" }: SkeletonProps) {
  const rMap = { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-2xl", full: "rounded-full" };
  return (
    <div
      className={`animate-pulse bg-neutral-800/60 relative overflow-hidden ${rMap[rounded]} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="px-6 pb-6 pt-2 space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 shrink-0" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-2 w-full" rounded="full" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-16" rounded="lg" />)}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28" rounded="full" />
        <Skeleton className="h-8 w-24" rounded="full" />
      </div>
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800/60 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
