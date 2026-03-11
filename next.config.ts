import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/loner', destination: '/lonestatistik', permanent: true },
      { source: '/om', destination: '/om-oss', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'udapbxbsclbepcdgppuu.supabase.co' },
    ],
  },
};

export default nextConfig;
