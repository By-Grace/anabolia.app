import type { Metadata, Viewport } from "next";
import "./globals.css";
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
    <html lang="pt-BR">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
