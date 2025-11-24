"use client";

import { RegistrationForm } from "@/components/registration-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 登録済みかチェック
    const stored = localStorage.getItem("warranty_registration");
    if (stored) {
      // 登録済みの場合は確認ページへリダイレクト
      router.push("/registered");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <main className="hero-gradient">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <div className="card-blur shadow-card rounded-3xl p-6 sm:p-8">
            <p className="text-center text-slate-600">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="hero-gradient">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <RegistrationForm />
      </div>
    </main>
  );
}

