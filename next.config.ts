// In your CHATBOT project: /next.config.js - RECOMMENDED

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://client.botdigitalsolutions.com https://www.botdigitalsolutions.com https://www.thebot.agency http://localhost:3000 http://localhost:5173 https://www.ojkjobs.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;