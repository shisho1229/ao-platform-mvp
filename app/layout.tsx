import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AO Compass - 総合型選抜プラットフォーム",
  description: "総合型選抜の合格体験記と書類閲覧プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
