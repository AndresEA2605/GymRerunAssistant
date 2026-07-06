"use client";

import { useContext } from "react";
import { ProgressionContext } from "@/providers/ProgressionProvider";

export function useProgression() {
  const ctx = useContext(ProgressionContext);
  if (!ctx) throw new Error("useProgression must be used within ProgressionProvider");
  return ctx;
}
