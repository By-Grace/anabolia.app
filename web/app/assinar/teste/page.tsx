import { notFound } from "next/navigation";
import { getProvider } from "@/lib/payments";
import { simulateTestPaymentAction } from "../actions";
import { TesteView } from "./TesteView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pagamento de teste · Anaból[IA]" };

export default function TestePage() {
  if (process.env.VERCEL_ENV === "production" || getProvider()?.id !== "teste") notFound();
  return <TesteView onPay={simulateTestPaymentAction} />;
}
