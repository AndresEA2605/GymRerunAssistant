"use client";

import React from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProgressionProvider } from "@/providers/ProgressionProvider";
import ProgressionToasts from "@/components/progression/ProgressionToasts";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProgressionProvider>
        {children}
        <ProgressionToasts />
      </ProgressionProvider>
    </AuthProvider>
  );
}
