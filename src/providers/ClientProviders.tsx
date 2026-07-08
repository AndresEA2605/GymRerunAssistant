"use client";

import React from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProgressionProvider } from "@/providers/ProgressionProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProgressionProvider>
        {children}
      </ProgressionProvider>
    </AuthProvider>
  );
}
