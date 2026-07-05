"use client";

import React, { useEffect, useState } from "react";
import { formatTime } from "./TimerDisplay";

interface CooldownBadgeProps {
  endAt: number | null;
}

export default function CooldownBadge({ endAt }: CooldownBadgeProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!endAt) return <span className="text-neutral-600 fs-tiny tabular-nums">--:--:--</span>;

  const remaining = Math.max(0, endAt - now);
  return (
    <span
      className={`fs-tiny font-bold tabular-nums ${remaining > 0 ? "text-emerald-400" : "text-amber-400"}`}
    >
      {remaining > 0 ? formatTime(remaining) : "LISTO"}
    </span>
  );
}
