export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * 100);
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-track">
      <div className="absolute inset-y-0 left-0 rounded-full bg-acc transition-[width] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ width: `${pct}%` }} />
    </div>
  );
}
