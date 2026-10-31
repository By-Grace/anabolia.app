export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div data-testid="stat" className="py-1 text-center [&+&]:border-l [&+&]:border-hair">
      <div className="num text-[26px] font-bold leading-none tracking-[-0.02em]">{value}</div>
      <div className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-grey">{label}</div>
    </div>
  );
}
