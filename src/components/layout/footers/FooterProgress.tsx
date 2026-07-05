export function FooterProgress({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="progress-shimmer h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-center fs-tiny text-neutral-500 font-mono tabular-nums">{label}</p>
    </div>
  );
}
