"use client";

import React from "react";

type CardPadding = "sm" | "md" | "lg";

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5 md:p-6",
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
}

export default function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div
      className={[
        "bg-neutral-950 backdrop-blur-sm rounded-xl border border-neutral-800 shadow-lg",
        "hover:border-neutral-700 hover:bg-neutral-950/90 transition-all",
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
