import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createKintoneRecord,
  type WarrantyRegistrationPayload,
} from "@/lib/kintone";

const payloadSchema = z.object({
  managementId: z
    .string()
    .regex(/^URC\d{7}$/, "管理番号はURCに続けて7桁の数字で入力してください"),
  fullName: z.string().min(1, "氏名（漢字）を入力してください"),
  furigana: z.string().min(1, "フリガナを入力してください"),
  postalCode: z.string().min(7, "郵便番号を入力してください"),
  address: z.string().min(1, "住所を入力してください"),
  phone: z.string().min(10, "電話番号を入力してください"),
  warrantyPlan: z.enum(["standard", "campaign", "m", "s"]),
  reviewPledge: z.boolean(),
  termsAgreed: z.literal(true, {
    errorMap: () => ({
      message: "保証内容に同意してください",
    }),
  }),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "入力内容をご確認ください",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    await createKintoneRecord(parsed.data as WarrantyRegistrationPayload);
    return NextResponse.json(
      { ok: true, message: "保証登録を受け付けました" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // 重複エラーの場合は409 Conflictを返す
    if (error instanceof Error && error.message.includes("既に登録済み")) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 409 },
      );
    }

    // 管理番号が見つからない場合は404 Not Foundを返す
    if (error instanceof Error && error.message.includes("該当の管理番号は見当たりません")) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 404 },
      );
    }

    const isDev = process.env.NODE_ENV === "development";
    const errorMessage =
      error instanceof Error
        ? isDev
          ? `エラー: ${error.message}`
          : "システムエラーが発生しました。時間をおいて再度お試しください。"
        : "システムエラーが発生しました。時間をおいて再度お試しください。";

    return NextResponse.json(
      {
        ok: false,
        message: errorMessage,
        ...(isDev && error instanceof Error && { details: error.message }),
      },
      { status: 500 },
    );
  }
}

