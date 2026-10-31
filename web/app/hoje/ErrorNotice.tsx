"use client";

import { useRouter } from "next/navigation";

export function ErrorNotice({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div role="alert" className="mb-4 flex items-center gap-3 rounded-2xl bg-soft px-4 py-3">
      <p className="flex-1 text-sm font-medium text-ink">{message}</p>
      <button type="button" onClick={() => router.refresh()} className="flex-none text-sm font-semibold text-acc">Tentar de novo</button>
    </div>
  );
}
