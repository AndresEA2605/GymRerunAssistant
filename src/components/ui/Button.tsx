"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "neutral";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/25 border border-indigo-500/30",
  secondary:
    "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700",
  ghost:
    "bg-transparent hover:bg-neutral-800/80 text-neutral-400 hover:text-white border border-transparent",
  danger:
    "bg-red-700 hover:bg-red-600 text-white border border-red-600/40 shadow-md shadow-red-900/20",
  success:
    "bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600/40 shadow-md shadow-emerald-900/25",
  neutral:
    "bg-neutral-700 hover:bg-neutral-600 text-neutral-200 border border-neutral-600",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 gap-2 fs-tiny rounded-lg",
  md: "h-10 px-4 gap-2 fs-small rounded-xl",
  lg: "h-12 px-5 gap-2 fs-body rounded-xl",
};

const ICON_SIZE: Record<ButtonSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-4 h-4",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconOnly,
  fullWidth,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center font-bold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
        "disabled:opacity-30 disabled:pointer-events-none",
        VARIANT[variant],
        iconOnly ? (size === "sm" ? "h-8 w-8 p-0 rounded-lg" : size === "lg" ? "h-12 w-12 p-0 rounded-xl" : "h-10 w-10 p-0 rounded-xl") : SIZE[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {icon && <span className={`shrink-0 ${ICON_SIZE[size]}`}>{icon}</span>}
      {!iconOnly && children}
    </button>
  );
}
