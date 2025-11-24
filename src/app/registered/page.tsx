"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

type RegistrationData = {
  managementId: string;
  fullName: string;
  furigana: string;
  postalCode: string;
  address: string;
  phone: string;
  warrantyPlan: string;
  reviewPledge: boolean;
  registeredAt: string;
};

export default function RegisteredPage() {
  const [data, setData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("warranty_registration");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // 登録情報がない場合はトップページへリダイレクト
      window.location.href = "/";
    }
  }, []);

  if (!data) {
    return (
      <main className="hero-gradient min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
          <div className="card-blur shadow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
            <p className="text-center text-slate-600 text-sm sm:text-base">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  const warrantyPlanLabels: Record<string, string> = {
    standard: "通常保証（1ヶ月／3ヶ月）",
    campaign: "キャンペーン保証（3ヶ月）",
    m: "Mプラン（6ヶ月・1,500円）",
    s: "Sプラン（12ヶ月・2,980円）",
  };

  return (
    <main className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
        <div className="card-blur shadow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Image
              src="/logo-official.png"
              alt="ほんぽくんロゴ"
              width={100}
              height={100}
              className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-xl sm:rounded-2xl bg-white p-1.5 sm:p-2 shadow-card flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                HONPOKUN WARRANTY
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">登録完了</h1>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-3xl bg-green-50 border border-green-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg
                className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-bold text-green-800">
                  保証登録が完了しました
                </p>
                <p className="text-xs sm:text-sm text-green-700 mt-1">
                  ご登録いただいた情報は正常に受け付けられました。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">登録内容</h2>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">管理番号</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-all">
                  {data.managementId}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">電話番号</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-all">
                  {data.phone}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">氏名（漢字）</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-words">
                  {data.fullName}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">氏名（フリガナ）</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-words">
                  {data.furigana}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200 sm:col-span-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">住所</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-words">
                  〒{data.postalCode} {data.address}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200 sm:col-span-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">保証プラン</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {warrantyPlanLabels[data.warrantyPlan] || data.warrantyPlan}
                </p>
                {["m", "s"].includes(data.warrantyPlan) && (
                  <div className="mt-2 sm:mt-3 rounded-lg sm:rounded-xl bg-primary/10 p-2.5 sm:p-3 border border-primary/30">
                    <p className="text-[10px] sm:text-xs font-semibold text-primary">
                      ✓ 振込完了後
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                      振込名義と延長保証分の振込完了の旨をLINEで送信いただくと、延長保証が有効化されます。
                    </p>
                  </div>
                )}
              </div>
              {data.reviewPledge && (
                <div className="rounded-xl sm:rounded-2xl bg-primary/10 p-3 sm:p-4 border border-primary/30 sm:col-span-2">
                  <p className="text-xs sm:text-sm font-semibold text-primary">
                    ✓ Google口コミ投稿予定
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                    投稿完了後、スクリーンショットをLINEで送信いただくと、保証期間が1ヶ月延長されます。
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl sm:rounded-3xl bg-white/90 p-4 sm:p-5 border border-primary/30">
            <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2 sm:mb-3">次のステップ</p>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  保証期間中に不具合が発生した場合は、公式LINEの修理依頼やトークからご連絡ください。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  保証内容の詳細や情報はメニューのMy 保証状況からご確認いただけます。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  口コミや延長保証をご希望の方はこの後トークにて完了のご連絡をお願いいたします。
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
            <Link
              href="/terms.html"
              target="_blank"
              className="flex-1 rounded-xl sm:rounded-2xl border border-primary/50 bg-white px-4 py-2.5 sm:px-6 sm:py-3 text-center text-xs sm:text-sm font-semibold text-primary hover:bg-primary/5 transition min-h-[44px] flex items-center justify-center touch-manipulation"
            >
              規約を確認する
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("warranty_registration");
                window.location.href = "/";
              }}
              className="flex-1 rounded-xl sm:rounded-2xl bg-primary text-white px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold hover:opacity-90 transition min-h-[44px] touch-manipulation"
            >
              新規登録を行う
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

