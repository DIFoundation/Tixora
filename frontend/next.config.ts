import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_SELF_SCOPE: process.env.NEXT_PUBLIC_SELF_SCOPE,
      NEXT_PUBLIC_SELF_ENDPOINT: process.env.NEXT_PUBLIC_SELF_ENDPOINT,
      NEXT_PUBLIC_ENABLE_SELF_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_SELF_VERIFICATION,
    },
  experimental: {
    // serverExternalPackages: [
    //   "pino",
    //   "thread-stream",
    //   "@tapjs/fixture",
    //   "rimraf"
    // ]
  }, 
  output: 'standalone'
};

export default nextConfig;
