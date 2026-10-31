import Link from "next/link";
import Image from "next/image";
import { PlateIcon, PlayIcon } from "./icons";

export function PhotoCard({ src, title, meta, href }: { src?: string; title: string; meta: string; href: string }) {
  return (
    <Link href={href} className="relative block h-[220px] overflow-hidden rounded-[20px] bg-soft active:scale-[0.99] transition-transform">
      {src ? (
        <Image src={src} alt="" fill sizes="(max-width: 480px) 100vw, 480px" className="object-cover" priority />
      ) : (
        <div data-testid="photo-placeholder" className="absolute inset-0 grid place-items-center text-ring">
          <PlateIcon size={48} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-14 pr-16 text-white">
        <div className="text-xl font-bold leading-tight tracking-[-0.015em]">{title}</div>
        <div className="mt-1 text-[13px] font-medium text-white/90 num">{meta}</div>
      </div>
      <span className="absolute bottom-3.5 right-3.5 grid size-[46px] place-items-center rounded-full bg-acc text-white shadow-[0_4px_12px_rgba(0,0,0,.25)]">
        <PlayIcon />
      </span>
    </Link>
  );
}
