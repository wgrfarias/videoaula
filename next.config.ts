import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone with only the files needed to run in
  // production (traced node_modules included) — the Dockerfile copies just
  // that output instead of the whole node_modules tree.
  output: "standalone",
};

export default nextConfig;
