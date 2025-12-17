import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "合格体験談プラットフォーム",
  description: "合格者の体験談を共有・検索できるプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <SessionProvider>
          <AuthGuard>
            <Navbar />
            {children}
          </AuthGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
