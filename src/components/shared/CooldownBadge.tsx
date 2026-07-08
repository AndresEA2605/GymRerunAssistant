"use client";

import React, { useEffect, useState } from "react";
import { formatTime } from "./TimerDisplay";

interface CooldownBadgeProps {
  endAt: number | null;
}

export default function CooldownBadge({ endAt }: CooldownBadgeProps) {
  const [now, setNow] = useState(() => Date.now());
  const isActive = !!endAt && endAt > now;

  useEffect(() => {
    if (!isActive) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isActive]);

  if (!endAt) return <span className="text-neutral-600 fs-tiny tabular-nums min-w-[4.5rem] text-right inline-block">--:--:--</span>;

  const remaining = Math.max(0, endAt - now);
  return (
    <span
      className={`fs-tiny font-bold tabular-nums min-w-[4.5rem] text-right inline-block ${remaining > 0 ? "text-emerald-400" : "text-amber-400"}`}
    >
      {remaining > 0 ? formatTime(remaining) : "LISTO"}
    </span>
  );
}
