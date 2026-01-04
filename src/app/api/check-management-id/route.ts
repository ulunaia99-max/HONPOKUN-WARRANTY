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
    let record;
    try {
      record = await findRecordByManagementId(managementId);
    } catch (error) {
      console.error("findRecordByManagementId error:", error);
      const isDev = process.env.NODE_ENV === "development";
      const errorMessage = error instanceof Error 
        ? (isDev ? `管理番号の検索エラー: ${error.message}` : "管理番号の確認中にエラーが発生しました。")
        : "管理番号の確認中にエラーが発生しました。";
      
      return NextResponse.json(
        {
          ok: false,
          message: errorMessage,
          ...(isDev && error instanceof Error && { details: error.message }),
        },
        { status: 500 },
      );
    }

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
    const existingPhone = record.record.phone || "";
    const existingName = record.record.fullName || "";

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

    // 管理番号は存在するが未登録の場合、登録可能
    return NextResponse.json(
      {
        ok: true,
        message: "管理番号の確認が完了しました。",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Management ID check error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "管理番号の確認中にエラーが発生しました。",
      },
      { status: 500 },
    );
  }
}

