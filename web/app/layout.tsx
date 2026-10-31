import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Números arredondados fora da Apple (Android, Windows). No iPhone/Mac vale o SF Rounded do sistema.
const rounded = Nunito({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-nunito", display: "swap" });
import { RegisterSW } from "./RegisterSW";

export const metadata: Metadata = {
  title: "Anaból[IA]",
  description: "Receitas para ganhar massa que fecham a sua proteína do dia.",
  appleWebApp: { capable: true, title: "Anabolia", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={rounded.variable}>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
