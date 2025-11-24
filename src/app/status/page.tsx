"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusPage() {
  const router = useRouter();
  const [managementId, setManagementId] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managementId, phoneLast4 }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 未登録の場合は保証登録フォームへリダイレクト
        if (data.needsRegistration) {
          router.push("/");
          return;
        }
        throw new Error(data.message || "エラーが発生しました");
      }

      // 電話番号の下4桁をlocalStorageに保存
      localStorage.setItem(
        `warranty_status_${managementId}`,
        JSON.stringify({ phoneLast4 }),
      );

      // 成功した場合は登録情報表示ページへ
      router.push(`/status/result?managementId=${encodeURIComponent(managementId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-5 sm:py-10">
        <div className="card-blur shadow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6">
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
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">保証登録情報確認</h1>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl bg-white/90 p-4 sm:p-5 border border-primary/30">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-3">
              登録情報を確認するには、管理番号と電話番号の下4桁を入力してください
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5">
                  管理番号
                </label>
                <input
                  type="text"
                  value={managementId}
                  onChange={(e) => setManagementId(e.target.value.toUpperCase())}
                  placeholder="URC1234567"
                  required
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white/70 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px] uppercase"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5">
                  電話番号（下4桁）
                </label>
                <input
                  type="text"
                  value={phoneLast4}
                  onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  required
                  maxLength={4}
                  inputMode="numeric"
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white/70 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                />
              </div>
              {error && (
                <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-medium bg-red-50 text-red-700 space-y-2">
                  <p>{error}</p>
                  {(error.includes("まだ登録が完了していません") ||
                    error.includes("保証登録フォーム")) && (
                    <Link
                      href="/"
                      className="block mt-2 text-center rounded-lg bg-primary text-white px-4 py-2 text-xs sm:text-sm font-semibold hover:opacity-90 transition min-h-[44px] flex items-center justify-center touch-manipulation"
                    >
                      保証登録フォームへ
                    </Link>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !managementId || phoneLast4.length !== 4}
                className="w-full bg-primary text-white font-semibold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-card disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base min-h-[48px] touch-manipulation"
              >
                {isLoading ? "確認中..." : "登録情報を確認する"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

