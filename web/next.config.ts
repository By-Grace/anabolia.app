import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite um build de verificação em outra pasta sem derrubar o servidor de desenvolvimento.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // As receitas são lidas do disco no servidor; garante que entrem no bundle serverless.
  outputFileTracingIncludes: {
    "/**/*": ["./content/recipes/**/*.json"],
  },
};

export default nextConfig;
