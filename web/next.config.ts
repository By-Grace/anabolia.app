import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O selo "N" do modo dev cobria a barra de abas nas revisões no simulador.
  devIndicators: false,
  // Permite um build de verificação em outra pasta sem derrubar o servidor de desenvolvimento.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // As receitas são lidas do disco no servidor; garante que entrem no bundle serverless.
  outputFileTracingIncludes: {
    "/**/*": ["./content/recipes/**/*.json"],
  },
};

export default nextConfig;
