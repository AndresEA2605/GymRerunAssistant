"use client";

import React, { memo, useEffect, useState } from "react";

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

interface TimerDisplayProps {
  isRunning: boolean;
  startTime: number | null;
  elapsedBeforePause: number;
}

const TimerDisplay = memo(({ isRunning, startTime, elapsedBeforePause }: TimerDisplayProps) => {
  const [elapsed, setElapsed] = useState(elapsedBeforePause);

  useEffect(() => {
    let frameId: number;
    const update = () => {
      if (isRunning && startTime) {
        setElapsed(elapsedBeforePause + (Date.now() - startTime));
        frameId = requestAnimationFrame(update);
      }
    };
    if (isRunning) {
      frameId = requestAnimationFrame(update);
    } else {
      setElapsed(elapsedBeforePause);
    }
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isRunning, startTime, elapsedBeforePause]);

  return (
    <span
      className={`font-mono fs-mono font-bold tracking-wider tabular-nums ${
        isRunning ? "timer-running text-indigo-300" : "text-neutral-300"
      }`}
    >
      {formatTime(isRunning ? elapsed : elapsedBeforePause)}
    </span>
  );
});

TimerDisplay.displayName = "TimerDisplay";

export default TimerDisplay;
