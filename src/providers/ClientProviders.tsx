"use client";

import React from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProgressionProvider } from "@/providers/ProgressionProvider";
import AppLoadingGate from "@/components/layout/AppLoadingGate";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProgressionProvider>
        <AppLoadingGate>
          {children}
        </AppLoadingGate>
      </ProgressionProvider>
    </AuthProvider>
  );
}
