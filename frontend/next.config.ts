import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Proxy API requests to the backend — avoids CORS issues in all environments.
  // In production the NEXT_PUBLIC_API_URL env var on Vercel should be set to
  // your Render backend URL (e.g. https://second-brain-os-api.onrender.com).
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
