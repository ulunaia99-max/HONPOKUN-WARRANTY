"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusPage() {
  const router = useRouter();
  const [managementId, setManagementId] = useState("URC");
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
    <main className="hero-gradient min-h-screen relative">
      {/* 新規保証登録ボタン（右上隅） */}
      <Link
        href="/"
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-300/60 px-2 py-2 sm:px-2.5 sm:py-2.5 text-slate-600 hover:bg-white hover:border-slate-400 hover:shadow-md transition shadow-sm w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center touch-manipulation group"
        title="新規保証登録"
      >
        <svg
          className="w-5 h-5 sm:w-5 sm:h-5 text-slate-500 group-hover:text-slate-700 transition"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Link>
      
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-5 sm:py-10">
        <div className="card-blur shadow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6">
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
                <div className="relative">
                  <input
                    type="text"
                    value={managementId}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // URCで始まるように強制、URCを削除できないようにする
                      if (value.startsWith("URC")) {
                        setManagementId(value);
                      } else if (value.length < 3) {
                        setManagementId("URC");
                      }
                    }}
                    onKeyDown={(e) => {
                      // バックスペースやDeleteでURCを削除できないようにする
                      if ((e.key === "Backspace" || e.key === "Delete") && managementId.length <= 3) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="URC1234567"
                    required
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white/70 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px] uppercase"
                  />
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5">
                  同梱書類記載の7桁の数字を入力してください
                </p>
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
                <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-medium bg-red-50 text-red-700 space-y-2.5">
                  <p className="font-semibold">{error}</p>
                  <p className="text-[10px] sm:text-xs text-red-600 leading-relaxed">
                    保証登録をお済みで無い方は、右上の＋ボタンより新規保証登録をお願いいたします。
                  </p>
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
                disabled={isLoading || !managementId || managementId.length < 10 || phoneLast4.length !== 4}
                className="w-full bg-primary text-white font-semibold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-card disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base min-h-[48px] touch-manipulation"
              >
                {isLoading ? "確認中..." : "登録情報を確認する"}
              </button>
            </form>
          </div>

          <div className="text-center">
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

