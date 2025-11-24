import { NextResponse } from "next/server";
import { z } from "zod";
import { findRecordByManagementId } from "@/lib/kintone";

const checkSchema = z.object({
  managementId: z.string().regex(/^URC\d{7}$/, "管理番号はURCに続けて7桁の数字で入力してください"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = checkSchema.safeParse(json);

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

    const { managementId } = parsed.data;

    // 管理番号でレコードを検索
    const record = await findRecordByManagementId(managementId);

    if (!record) {
      return NextResponse.json(
        {
          ok: false,
          message: "該当の管理番号は見当たりません。",
        },
        { status: 404 },
      );
    }

    // 既に登録済みかチェック
    const FIELD_CODES = {
      phone: "文字列__1行__4",
      fullName: "name_1",
    } as const;
    
    const existingPhone = record.record[FIELD_CODES.phone]?.value || "";
    const existingName = record.record[FIELD_CODES.fullName]?.value || "";

    // 既に登録済みの場合はエラー
    if (existingName || existingPhone) {
      return NextResponse.json(
        {
          ok: false,
          message: "この管理番号は既に登録済みです。",
        },
        { status: 409 },
      );
    }

    // 管理番号は存在するが未登録の場合、合言葉を返す
    const passphrase = record.record["paycard_0"]?.value || "";
    
    return NextResponse.json(
      {
        ok: true,
        message: "管理番号の確認が完了しました。",
        passphrase: passphrase,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Management ID check error:", error);
    
    const isDev = process.env.NODE_ENV === "development";
    const errorMessage =
      error instanceof Error
        ? isDev
          ? `エラー: ${error.message}`
          : "管理番号の確認中にエラーが発生しました。時間をおいて再度お試しください。"
        : "管理番号の確認中にエラーが発生しました。時間をおいて再度お試しください。";
    
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

