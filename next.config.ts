import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  // セキュリティヘッダーを追加
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // HTTPS強制（HSTS）
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // XSS防止
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // クリックジャッキング防止
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // MIMEタイプスニッフィング防止
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // リファラー制御
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // パーミッションポリシー（不要な機能を無効化）
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
