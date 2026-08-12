import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project so Next.js/Turbopack don't
  // infer it from a stray lockfile higher up in the user's home directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
