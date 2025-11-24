import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "保証登録フォーム｜ほんぽくん",
  description:
    "LINE連携でカンタン保証登録。キントーンと連携して保証情報を即時反映します。",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSans.variable} font-sans bg-soft min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

