import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @libsql/client loads a platform-specific native binding at runtime. Bundling
  // it breaks that lookup on Vercel, so keep it as a runtime require.
  serverExternalPackages: ["@libsql/client"],

  // Public deployment headers. Without these the site works but gives a browser
  // no instructions about framing, sniffing or referrer policy, so any future
  // injection has nothing to stop it.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // This app needs none of these; denying them shrinks the surface if
            // anything ever gets injected.
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;