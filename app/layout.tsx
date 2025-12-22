import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loohcs志塾 合格者体験記",
  description: "志を抱く、場所となる。どんな受験生も、どんな志望校も、人生が変わるほどの成長と合格を掴み取れます。",
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
