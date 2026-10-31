import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // As receitas são lidas do disco no servidor; garante que entrem no bundle serverless.
  outputFileTracingIncludes: {
    "/**/*": ["./content/recipes/**/*.json"],
  },
};

export default nextConfig;
