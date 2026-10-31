import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "soft" | "text";

const base = "inline-flex items-center justify-center gap-2 select-none transition-[transform,opacity] active:scale-[0.98] disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "h-[54px] flex-1 rounded-full bg-acc px-6 text-[17px] font-bold text-white shadow-[0_6px_16px_rgba(0,0,0,.14)]",
  secondary: "h-[54px] w-[54px] flex-none rounded-full bg-soft text-ink",
  soft: "h-[54px] flex-none rounded-full bg-soft px-5 text-[16px] font-semibold text-ink",
  text: "h-11 px-2 text-[15px] font-semibold text-acc",
};

export function buttonClass(variant: Variant = "primary") {
  return `${base} ${variants[variant]}`;
}

export function Button({ variant = "primary", className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${buttonClass(variant)} ${className}`} {...rest} />;
}

export function ButtonLink({ href, variant = "primary", className = "", children, ...rest }: {
  href: string; variant?: Variant; className?: string; children: ReactNode; "aria-label"?: string;
}) {
  return <Link href={href} className={`${buttonClass(variant)} ${className}`} {...rest}>{children}</Link>;
}
