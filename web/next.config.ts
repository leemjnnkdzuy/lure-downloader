import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-extra', 'puppeteer-extra-plugin-stealth', 'puppeteer'],
  },
};

export default nextConfig;

