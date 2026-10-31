import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const HomeIcon = (p: P) => <Svg {...p}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></Svg>;
export const BookIcon = (p: P) => <Svg {...p}><path d="M5 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5zM19 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" /></Svg>;
export const ListIcon = (p: P) => <Svg {...p}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></Svg>;
export const PersonIcon = (p: P) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></Svg>;
export const ChevronLeft = (p: P) => <Svg {...p}><path d="M15 5 8 12l7 7" /></Svg>;
export const ChevronRight = (p: P) => <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>;
export const SearchIcon = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></Svg>
);
export const FlameIcon = (p: P) => <Svg {...p}><path d="M12 3c2.5 3 4.5 5 4.5 8.5a4.5 4.5 0 0 1-9 0C7.5 8 9.5 6 12 3z" /></Svg>;
export const PlateIcon = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></Svg>;

export function PlayIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true"><path d="M6 3.5v11l9-5.5z" fill="currentColor" /></svg>;
}
export function PauseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <rect x="4" y="3" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="10.5" y="3" width="3.5" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}
export function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5 4.8 9 10 3.5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
