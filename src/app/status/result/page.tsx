"use client";

import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type WarrantyData = {
  managementId: string;
  fullName: string;
  phone: string;
  postalCode: string;
  address: string;
  maker: string;
  model: string;
  serial: string;
  purchaseSite: string;
  purchaseDate: string;
  warrantyPeriod: string;
  warrantyPlan: string;
  warrantyEndDate: string;
};

function calculateRemainingDays(endDate: string): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatusResultContent() {
  const searchParams = useSearchParams();
  const managementId = searchParams.get("managementId");
  const [data, setData] = useState<WarrantyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!managementId) {
      setError("管理番号が指定されていません");
      setIsLoading(false);
      return;
    }

    // 管理番号から電話番号の下4桁を取得（localStorageから）
    const stored = localStorage.getItem(`warranty_status_${managementId}`);
    if (stored) {
      const { phoneLast4 } = JSON.parse(stored);
      fetchStatus(managementId, phoneLast4);
    } else {
      setError("認証情報が見つかりません");
      setIsLoading(false);
    }
  }, [managementId]);

  const fetchStatus = async (mgmtId: string, phoneLast4: string) => {
    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managementId: mgmtId, phoneLast4 }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "エラーが発生しました");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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

  if (error || !data) {
    return (
      <main className="hero-gradient min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
          <div className="card-blur shadow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4">
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-medium bg-red-50 text-red-700">
              {error || "登録情報の取得に失敗しました"}
            </div>
            <Link
              href="/status"
              className="block w-full rounded-xl sm:rounded-2xl bg-primary text-white px-4 py-2.5 sm:px-6 sm:py-3 text-center text-xs sm:text-sm font-semibold hover:opacity-90 transition min-h-[44px] flex items-center justify-center touch-manipulation"
            >
              もう一度確認する
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const remainingDays = calculateRemainingDays(data.warrantyEndDate);
  const isExpired = remainingDays !== null && remainingDays < 0;
  const isExpiringSoon = remainingDays !== null && remainingDays >= 0 && remainingDays <= 30;

  return (
    <main className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
        <div className="card-blur shadow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 flex-shrink-0 rounded-xl sm:rounded-2xl bg-white p-1.5 sm:p-2 shadow-card overflow-hidden">
              <Image
                src="/logo-official.png"
                alt="ほんぽくんロゴ"
                width={100}
                height={100}
                className="h-full w-full object-contain"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                HONPOKUN WARRANTY
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">保証登録情報</h1>
            </div>
          </div>

          {/* 保証期間の状態表示 */}
          {remainingDays !== null && (
            <div
              className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border ${
                isExpired
                  ? "bg-red-50 border-red-200"
                  : isExpiringSoon
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">
                  {isExpired ? "⚠️" : isExpiringSoon ? "⏰" : "✓"}
                </span>
                <div>
                  <p
                    className={`text-sm sm:text-base font-bold ${
                      isExpired
                        ? "text-red-800"
                        : isExpiringSoon
                          ? "text-yellow-800"
                          : "text-green-800"
                    }`}
                  >
                    {isExpired
                      ? "保証期間が終了しています"
                      : isExpiringSoon
                        ? `保証期間が残り${remainingDays}日です`
                        : `保証期間は残り${remainingDays}日です`}
                  </p>
                  {data.warrantyEndDate && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      保証終了日: {new Date(data.warrantyEndDate).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* お客様情報 */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">お客様情報</h2>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">管理番号</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-all">
                  {data.managementId}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">氏名</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-words">
                  {data.fullName}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">連絡先（電話番号）</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-all">
                  {data.phone}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">郵便番号</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {data.postalCode || "未登録"}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200 sm:col-span-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">住所</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-words">
                  {data.address || "未登録"}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-2 italic">
                  ※この住所は発送先等に使用します。異なる場合はお知らせください。
                </p>
              </div>
            </div>
          </div>

          {/* 製品情報 */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">製品情報</h2>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">メーカー</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {data.maker || "未登録"}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">モデル名</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-words">
                  {data.model || "未登録"}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200 sm:col-span-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">製造番号</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 break-all">
                  {data.serial || "未登録"}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">購入サイト</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {data.purchaseSite || "未登録"}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">購入日</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {data.purchaseDate
                    ? new Date(data.purchaseDate).toLocaleDateString("ja-JP")
                    : "未登録"}
                </p>
              </div>
            </div>
          </div>

          {/* 保証情報 */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">保証情報</h2>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">保証期間</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {data.warrantyPeriod ? `${data.warrantyPeriod}ヶ月` : "未登録"}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-white/80 p-3 sm:p-4 border border-slate-200">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500">保証プラン</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {data.warrantyPlan || "未登録"}
                </p>
              </div>
            </div>
          </div>

          {/* 保証内容 */}
          <div className="rounded-xl sm:rounded-3xl bg-white/90 p-4 sm:p-5 border border-primary/30 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">保証内容</h2>
            
            {/* メイン：修理費作業費全額負担 */}
            <div className="rounded-xl sm:rounded-2xl bg-primary/10 p-4 sm:p-5 border-2 border-primary/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl flex-shrink-0">✓</span>
                <div>
                  <p className="text-base sm:text-lg font-bold text-primary mb-1">
                    修理費・作業費は全額弊社負担
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    保証期間中の修理作業費はすべて無料です。お客様のご負担は一切ありません。
                  </p>
                </div>
              </div>
            </div>

            {/* 予備：部品代のみお客様負担 */}
            <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4 border border-slate-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary font-bold flex-shrink-0 text-sm sm:text-base">※</span>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-slate-800 mb-1">
                    部品代のみお客様負担
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    部品の交換が必要な場合のみ、部品代金をお客様にご負担いただきます。
                  </p>
                </div>
              </div>
            </div>

            {/* 注意事項：送料 */}
            <div className="rounded-xl sm:rounded-2xl bg-yellow-50 p-3 sm:p-4 border border-yellow-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-yellow-600 font-bold flex-shrink-0 text-sm sm:text-base">⚠</span>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-yellow-800 mb-1">
                    送料について
                  </p>
                  <p className="text-xs sm:text-sm text-yellow-700 leading-relaxed">
                    発送修理の場合は、往復送料（元払い発送）をお客様にご負担いただきます。
                  </p>
                </div>
              </div>
            </div>

            {/* その他 */}
            <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4 border border-slate-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary font-bold flex-shrink-0 text-sm sm:text-base">•</span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  他にお持ちのパソコンも対象（作業費は半額まで弊社負担）
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
            <Link
              href="/status"
              className="flex-1 rounded-xl sm:rounded-2xl border border-primary/50 bg-white px-4 py-2.5 sm:px-6 sm:py-3 text-center text-xs sm:text-sm font-semibold text-primary hover:bg-primary/5 transition min-h-[44px] flex items-center justify-center touch-manipulation"
            >
              別の情報を確認する
            </Link>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/terms.html"
              target="_blank"
              className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              安心保証 ご利用規約を確認する
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StatusResultPage() {
  return (
    <Suspense
      fallback={
        <main className="hero-gradient min-h-screen">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
            <div className="card-blur shadow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
              <p className="text-center text-slate-600 text-sm sm:text-base">読み込み中...</p>
            </div>
          </div>
        </main>
      }
    >
      <StatusResultContent />
    </Suspense>
  );
}

