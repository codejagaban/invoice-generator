import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  serverExternalPackages: ["mysql2", "bcryptjs"],
};

export default nextConfig;
