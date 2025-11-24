import { NextResponse } from "next/server";
import { z } from "zod";
import { findRecordByManagementId } from "@/lib/kintone";

const checkSchema = z.object({
  managementId: z.string().regex(/^URC\d{7}$/, "管理番号はURCに続けて7桁の数字で入力してください"),
  phone: z.string().min(10, "電話番号を入力してください"),
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

    const { managementId, phone } = parsed.data;

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

    if (existingName || existingPhone) {
      // 既に登録済みの場合、電話番号の下4桁を確認
      if (existingPhone) {
        const phoneDigits = phone.replace(/\D/g, "");
        const existingPhoneDigits = existingPhone.replace(/\D/g, "");
        
        if (existingPhoneDigits.slice(-4) !== phoneDigits.slice(-4)) {
          return NextResponse.json(
            {
              ok: false,
              message: "管理番号と電話番号の組み合わせが正しくありません。",
            },
            { status: 403 },
          );
        }
      }
      
      return NextResponse.json(
        {
          ok: false,
          message: "この管理番号は既に登録済みです。",
        },
        { status: 409 },
      );
    }

    // 管理番号は存在するが未登録の場合、電話番号の下4桁で検証
    // （kintoneに管理番号と電話番号の関連情報があれば確認）
    // ここでは管理番号が存在し、未登録であることを確認
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

