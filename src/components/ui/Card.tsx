"use client";

import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
}

const variantStyles = {
  default: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
  elevated:
    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50",
  glass:
    "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30",
};

export default function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-3xl p-6 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
