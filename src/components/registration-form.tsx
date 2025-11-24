"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type {
  WarrantyPlan,
  WarrantyRegistrationPayload,
} from "@/lib/kintone";

type FormState = WarrantyRegistrationPayload;

const MANAGEMENT_PREFIX = "URC";
const MANAGEMENT_DIGIT_LENGTH = 7;

const defaultState: FormState = {
  managementId: MANAGEMENT_PREFIX,
  fullName: "",
  furigana: "",
  postalCode: "",
  address: "",
  phone: "",
  warrantyPlan: "standard",
  reviewPledge: true,
  termsAgreed: false,
};

const planOptions: Array<{
  id: WarrantyPlan;
  title: string;
  duration: string;
  price: string;
  description: string;
  highlight?: string;
}> = [
  {
    id: "standard",
    title: "通常保証",
    duration: "1ヶ月（標準）／3ヶ月（キャンペーン）",
    price: "追加料金なし",
    description:
      "基本は1ヶ月保証。キャンペーン対象の方は3ヶ月まで自動延長になります。",
  },
  {
    id: "m",
    title: "Mプラン",
    duration: "6ヶ月",
    price: "1,500円（税込）",
    description: "人気の安心プラン。",
  },
  {
    id: "s",
    title: "Sプラン",
    duration: "12ヶ月",
    price: "2,980円（税込）",
    description: "最長1年まで保証。法人・個人ともにおすすめです。",
  },
];

const perkCards = [
  {
    icon: "🛠️",
    title: "保証修理の安心ポイント",
    description:
      "修理作業費はいつでも無料。システム不良・メモリ・SSDなど、よくある故障の部品代は約2,000円からと超リーズナブル。他社で2万円以上かかるケースをグッと抑えられます。",
  },
  {
    icon: "💻",
    title: "他のPCでも保証が使える",
    description:
      "ご購入PC以外にも保証適用 OK。ご家族・職場の修理依頼も作業費が通常の半額で、液晶交換など高額メニューも当店なら半額ほどで解決できます。",
  },
  {
    icon: "💬",
    title: "チャット相談＆高額買取",
    description:
      "LINEチャットで操作やトラブルをリアルタイムサポート。不要PCは状態を問わず買取可能で、活用の幅が広がります。",
  },
];

const repairComparisons = [
  {
    title: "起動しない",
    cause: "OS不具合",
    ours: "当店：無料",
    others: "他店：約11,000〜20,000円",
  },
  {
    title: "電源が入らない",
    cause: "メモリ不良",
    ours: "当店：約2,000円〜",
    others: "他店：約13,000〜20,000円",
  },
  {
    title: "動作が遅い・固まる",
    cause: "SSD不良",
    ours: "当店：約2,000円〜",
    others: "他店：約20,000円〜",
  },
];

export function RegistrationForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string }>();
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isCheckingManagementId, setIsCheckingManagementId] = useState(false);

  // 氏名にスペースを自動挿入（苗字と名前の間）
  const formatNameWithSpace = (text: string): string => {
    if (!text || text.length < 2) return text;
    // 既にスペースがある場合はそのまま
    if (text.includes(" ")) return text;
    // 2文字以上でスペースがない場合、2文字目と3文字目の間にスペースを挿入
    const trimmed = text.trim();
    if (trimmed.length >= 2 && !trimmed.includes(" ")) {
      // 最初の2文字の後にスペースを挿入
      return trimmed.slice(0, 2) + " " + trimmed.slice(2);
    }
    return text;
  };

  // 管理番号の存在確認と電話番号検証
  const checkManagementId = async (managementId: string, phone: string) => {
    if (!managementId || managementId.length < 10 || !phone || phone.replace(/\D/g, "").length < 10) {
      return { valid: false, message: "" };
    }

    setIsCheckingManagementId(true);
    try {
      const response = await fetch("/api/check-management-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managementId, phone: phone.replace(/\D/g, "") }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { valid: false, message: data.message || "管理番号の確認に失敗しました。" };
      }
      return { valid: true, message: "" };
    } catch (error) {
      return { valid: false, message: "管理番号の確認中にエラーが発生しました。" };
    } finally {
      setIsCheckingManagementId(false);
    }
  };

  const updateField = (field: keyof FormState, value: string | boolean) => {
    // 氏名のフォーマット（スペース自動挿入）
    if (field === "fullName") {
      const nameValue = value as string;
      const formatted = formatNameWithSpace(nameValue);
      setFormState((prev) => ({ ...prev, fullName: formatted }));
    } else {
      setFormState((prev) => ({ ...prev, [field]: value }));
    }
  };

  // 郵便番号フォーマット関数（123-4567）
  const formatPostalCode = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 7);
    if (digits.length <= 3) {
      return digits;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  };

  // 電話番号フォーマット関数（090-1234-5678 または 03-1234-5678）
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      // 固定電話（03-1234-5678）
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else {
      // 携帯電話（090-1234-5678）
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePostalLookup = async () => {
    const digits = formState.postalCode.replace(/\D/g, "");
    if (!digits || digits.length < 7) {
      setMessage({
        type: "error",
        text: "郵便番号（7桁）を入力してからボタンを押してください。",
      });
      return;
    }

    setIsAddressLoading(true);
    setMessage(undefined);
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(digits)}`,
      );
      const data = await res.json();
      if (data?.results?.[0]) {
        const { address1, address2, address3 } = data.results[0];
        updateField("address", `${address1 ?? ""}${address2 ?? ""}${address3 ?? ""}`);
        setMessage({ type: "success", text: "郵便番号から住所を反映しました。" });
      } else {
        setMessage({
          type: "error",
          text: "住所を見つけられませんでした。手入力でご記入ください。",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: "住所検索に失敗しました。通信環境をご確認のうえ再試行してください。",
      });
    } finally {
      setIsAddressLoading(false);
    }
  };

  const managementDigits = useMemo(
    () => formState.managementId.replace(new RegExp(`^${MANAGEMENT_PREFIX}`, "i"), ""),
    [formState.managementId],
  );
  const isManagementIdValid = new RegExp(
    `^${MANAGEMENT_PREFIX}\\d{${MANAGEMENT_DIGIT_LENGTH}}$`,
  ).test(formState.managementId);
  const digitsRemaining = MANAGEMENT_DIGIT_LENGTH - managementDigits.length;

  const handleManagementIdChange = (value: string) => {
    const digits = value
      .replace(new RegExp(`^${MANAGEMENT_PREFIX}`, "i"), "")
      .replace(/\D/g, "")
      .slice(0, MANAGEMENT_DIGIT_LENGTH);
    updateField("managementId", `${MANAGEMENT_PREFIX}${digits}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isManagementIdValid) {
      setMessage({
        type: "error",
        text: "管理番号はURCに続けて7桁の数字を入力してください。",
      });
      return;
    }
    // 管理番号と電話番号の組み合わせを確認
    const phoneDigits = formState.phone.replace(/\D/g, "");
    const checkResult = await checkManagementId(formState.managementId, formState.phone);
    if (!checkResult.valid) {
      setMessage({
        type: "error",
        text: checkResult.message || "管理番号と電話番号の組み合わせが正しくありません。",
      });
      return;
    }
    if (!formState.termsAgreed) {
      setMessage({
        type: "error",
        text: "保証内容をご確認のうえ、同意にチェックを入れてください。",
      });
      return;
    }
    setIsSubmitting(true);
    setMessage(undefined);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "送信に失敗しました");
      }

      // 登録情報をlocalStorageに保存
      const registrationData = {
        ...formState,
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem("warranty_registration", JSON.stringify(registrationData));

      // 確認ページへリダイレクト
      router.push("/registered");
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "送信中にエラーが発生しました。時間をおいて再度お試しください。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-blur shadow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl sm:rounded-3xl bg-white/90 p-4 sm:p-5 shadow-card sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative h-20 w-20 sm:h-28 sm:w-28 flex-shrink-0 rounded-2xl sm:rounded-3xl bg-white p-2 sm:p-3 shadow-card overflow-hidden">
              <Image
                src="/logo-official.png"
                alt="ほんぽくんロゴ"
                width={140}
                height={140}
                className="h-full w-full object-contain"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                HONPOKUN WARRANTY
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                保証登録フォーム
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                LINEメニューから1分で完了。保証延長・口コミ特典・有料プランの申し込みがここで完結します。
              </p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-soft px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-600 sm:ml-auto">
            <p className="font-semibold text-primary">こんな方におすすめ</p>
            <ul className="mt-2 list-disc pl-4 space-y-1 text-[10px] sm:text-xs text-slate-600">
              <li>購入後も手厚い修理サポートが欲しい</li>
              <li>他PCの修理や相談もまとめて任せたい</li>
              <li>LINEだけで全て完結させたい</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl sm:rounded-3xl bg-white/95 p-4 sm:p-5 shadow-card">
          <p className="text-xs sm:text-sm font-semibold text-primary">保証登録で嬉しい内容が満載！</p>
          <div className="grid gap-4 md:grid-cols-3">
            {perkCards.map((perk) => (
              <div
                key={perk.title}
                className="flex flex-col gap-2 rounded-xl sm:rounded-2xl border border-soft bg-white/80 p-3 sm:p-4 shadow-card"
              >
                <span className="text-xl sm:text-2xl">{perk.icon}</span>
                <p className="text-xs sm:text-sm font-bold text-slate-800">{perk.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{perk.description}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-soft bg-gradient-to-r from-soft to-white p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-bold text-slate-800">修理事例と他社との比較</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {repairComparisons.map((item) => (
                <div key={item.title} className="rounded-xl sm:rounded-2xl bg-white px-3 py-3 text-xs shadow-card">
                  <p className="font-bold text-slate-800">{item.title}</p>
                  <p className="text-slate-600">{item.cause}</p>
                  <p className="mt-2 text-primary font-semibold">{item.ours}</p>
                  <p className="text-slate-500">{item.others}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs sm:text-sm text-primary font-semibold uppercase tracking-wider">
          STEP 1
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">お客様情報</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="管理番号"
          placeholder="URC1234567"
          value={formState.managementId}
          onChange={handleManagementIdChange}
          required
          inputMode="numeric"
          helper={
            <span
              className={`${
                isManagementIdValid ? "text-slate-500" : "text-red-500"
              } flex justify-between`}
            >
              同梱書類記載の7桁の数字を入力してください
              {!isManagementIdValid && (
                <span className="ml-2 text-xs">
                  残り {digitsRemaining > 0 ? digitsRemaining : 0}桁
                </span>
              )}
            </span>
          }
        />
        <InputField
          label="電話番号"
          placeholder="090-1234-5678"
          value={formState.phone}
          onChange={(value) => updateField("phone", formatPhoneNumber(value))}
          required
          inputMode="tel"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="氏名"
          placeholder="本舗 太郎"
          value={formState.fullName}
          onChange={(value) => updateField("fullName", value)}
          required
        />
        <InputField
          label="氏名（フリガナ）"
          placeholder="ホンポ タロウ"
          value={formState.furigana}
          onChange={(value) => updateField("furigana", value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <InputField
            label="郵便番号"
            placeholder="100-0001"
            value={formState.postalCode}
            onChange={(value) => updateField("postalCode", formatPostalCode(value))}
            required
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={handlePostalLookup}
            disabled={isAddressLoading}
            className="w-full rounded-2xl border border-primary/50 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
          >
            {isAddressLoading ? "住所を検索中..." : "郵便番号から住所を入れる"}
          </button>
        </div>
        <div className="sm:col-span-2">
          <InputField
            label="住所"
            placeholder="東京都千代田区千代田1-1"
            value={formState.address}
            onChange={(value) => updateField("address", value)}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            保証プランを選択（任意）
          </p>
          <span className="text-xs font-semibold text-primary">
            ※お選びの内容に合わせて保証期間が決まります
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {planOptions.map((plan) => (
            <PlanCard
              key={plan.id}
              data={plan}
              selected={formState.warrantyPlan === plan.id}
              onClick={() => updateField("warrantyPlan", plan.id)}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500">
          ※キャンペーン適用の有無が不明な場合はスタッフまでお問い合わせください。
        </p>
      </div>

      {["m", "s"].includes(formState.warrantyPlan) && (
        <PaymentNotice plan={formState.warrantyPlan as "m" | "s"} />
      )}

      <ReviewPrompt
        pledged={formState.reviewPledge}
        onToggle={(value) => updateField("reviewPledge", value)}
      />

      <TermsAgreement
        agreed={formState.termsAgreed}
        onToggle={(value) => updateField("termsAgreed", value)}
      />

      {message && (
        <div
          className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isCheckingManagementId || !formState.termsAgreed || !isManagementIdValid}
        className="w-full bg-primary text-white font-semibold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-card disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base min-h-[48px] touch-manipulation"
      >
        {isSubmitting ? "送信中..." : isCheckingManagementId ? "確認中..." : "保証登録を送信する"}
      </button>
    </form>
  );
}

type InputFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
  helper?: ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  type?: string;
  error?: string | null;
};

function InputField({
  label,
  placeholder,
  value,
  required,
  onChange,
  helper,
  inputMode,
  type = "text",
  error,
}: InputFieldProps) {
  const hasError = !!error;
  return (
    <div className="space-y-1.5">
      <label className="block text-xs sm:text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl sm:rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 min-h-[44px] transition ${
          hasError
            ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200"
            : "border-slate-200 bg-white/70 focus:border-primary focus:ring-primary/20"
        }`}
      />
      {error && <p className="text-[10px] sm:text-xs text-red-600 leading-relaxed">{error}</p>}
      {helper && !error && <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">{helper}</p>}
    </div>
  );
}

type PlanCardProps = {
  data: (typeof planOptions)[number];
  selected: boolean;
  onClick: () => void;
};

function PlanCard({ data, selected, onClick }: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition hover:shadow-card ${
        selected
          ? "border-primary bg-white shadow-card"
          : "border-slate-200 bg-white/60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">{data.duration}</p>
          <p className="text-lg font-bold text-slate-800">{data.title}</p>
          <p className="text-sm text-slate-500">{data.description}</p>
        </div>
        <div
          className={`h-4 w-4 rounded-full border ${
            selected ? "border-primary bg-primary" : "border-slate-300 bg-white"
          }`}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{data.price}</span>
        {data.highlight && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-slate-800">
            {data.highlight}
          </span>
        )}
      </div>
    </button>
  );
}

type PaymentNoticeProps = {
  plan: "m" | "s";
};

const bankInfo = [
  { label: "銀行名", value: "GMOあおぞらネット銀行" },
  { label: "支店名", value: "法人第二営業部（102）" },
  { label: "口座種別", value: "普通口座 2006818" },
  { label: "口座名義", value: "カ）ウルナイア" },
];

function PaymentNotice({ plan }: PaymentNoticeProps) {
  const price = plan === "m" ? "1,500円" : "2,980円";
  const duration = plan === "m" ? "6ヶ月保証" : "12ヶ月保証";

  return (
    <div className="rounded-3xl border border-primary/40 bg-white/90 p-5 space-y-3">
      <p className="text-base font-bold text-primary">
        {duration} のお振込みについて（{price}）
      </p>
      <p className="text-sm text-slate-600">
        下記口座へお振込み後、LINEトークにて
        「振込名義」と「延長保証分の振込が完了した旨」をメッセージでお知らせください。
        画面スクリーンショットを添えていただくと確認がスムーズです。
        確認が取れ次第、延長保証を有効化します。
      </p>
      <dl className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        {bankInfo.map((item) => (
          <div key={item.label} className="flex flex-col rounded-2xl bg-soft px-4 py-2">
            <dt className="text-xs font-semibold text-slate-500">{item.label}</dt>
            <dd className="font-bold text-slate-800">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-slate-500">
        ※振込手数料はお客様負担となります。記載内容は必要に応じて編集してください。
      </p>
    </div>
  );
}

type ReviewPromptProps = {
  pledged: boolean;
  onToggle: (value: boolean) => void;
};

function ReviewPrompt({ pledged, onToggle }: ReviewPromptProps) {
  return (
    <div className="rounded-3xl border border-primary/30 bg-white/80 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-primary font-bold text-lg">
            Google口コミで＋1ヶ月延長
          </p>
          <p className="text-sm text-slate-600 mt-1">
            投稿完了後にスクリーンショットをLINEで送信してください。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">
            {pledged ? "投稿予定" : "あとで検討"}
          </span>
          <button
            type="button"
            onClick={() => onToggle(!pledged)}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
              pledged ? "bg-primary" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                pledged ? "translate-x-8" : "translate-x-2"
              }`}
            />
          </button>
        </div>
      </div>
      <a
        href="https://www.google.com/search?q=%E3%81%BB%E3%82%93%E3%81%BD%E3%81%8F%E3%82%93%E3%81%AEpc&sca_esv=f4f0d3251154213d&sxsrf=AE3TifOC3eEun3zY3ske8AhM35Rpf5MUfA%3A1763991900776&ei=XGEkae-QL-eH1e8P5ZapsQc&ved=0ahUKEwjvrof19YqRAxXnQ_UHHWVLKnYQ4dUDCBE&uact=5&oq=%E3%81%BB%E3%82%93%E3%81%BD%E3%81%8F%E3%82%93%E3%81%AEpc&gs_lp=Egxnd3Mtd2l6LXNlcnAiFOOBu-OCk-OBveOBj-OCk-OBrnBjMgoQIxiABBgnGIoFMgoQIxiABBgnGIoFMgUQABiABDIEEAAYHjIEEAAYHjIEEAAYHjIIEAAYgAQYogQyCBAAGIAEGKIEMggQABiABBiiBDIIEAAYgAQYogRI6hNQ-AdYkBJwAXgBkAEAmAG8AaABpQaqAQMwLjW4AQPIAQD4AQGYAgWgAqEFwgIKEAAYsAMY1gQYR8ICCBAAGKIEGIkFwgIFEAAY7wWYAwCIBgGQBgSSBwMxLjSgB-EYsgcDMC40uAefBcIHBTAuMS40yAcW&sclient=gws-wiz-serp#lrd=0x60191d9c28f55b37:0x4ec976e3dc05dfeb,3,,,,"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        口コミを投稿する
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.25 6.75L6.75 17.25M17.25 6.75H9.75M17.25 6.75V14.25"
          />
        </svg>
      </a>
    </div>
  );
}

type TermsAgreementProps = {
  agreed: boolean;
  onToggle: (value: boolean) => void;
};

function TermsAgreement({ agreed, onToggle }: TermsAgreementProps) {
  return (
    <div className="rounded-3xl border border-primary/20 bg-white/80 p-5 space-y-3">
      <p className="text-sm font-semibold text-slate-700">保証内容への同意</p>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => onToggle(event.target.checked)}
          className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
        />
        <span>
          <span className="font-semibold text-slate-800">保証規約</span> を確認し、内容に同意しました。
          <a
            href="/terms.html"
            target="_blank"
            rel="noreferrer"
            className="ml-2 inline-flex items-center gap-1 text-primary font-semibold underline-offset-2 hover:underline"
          >
            規約を開く
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.25 6.75L6.75 17.25M17.25 6.75H9.75M17.25 6.75V14.25"
              />
            </svg>
          </a>
        </span>
      </label>
    </div>
  );
}

