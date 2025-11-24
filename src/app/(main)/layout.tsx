import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "保証登録フォーム｜ほんぽくんのPC",
  description:
    "LINE連携でカンタン保証登録。キントーンと連携して保証情報を即時反映します。",
  openGraph: {
    title: "ほんぽくんのPC｜保証登録",
    description:
      "LINE連携でカンタン保証登録。キントーンと連携して保証情報を即時反映します。",
    type: "website",
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

