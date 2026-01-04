import { NextResponse } from "next/server";
import { z } from "zod";
import { getWarrantyStatus } from "@/lib/kintone";

const statusSchema = z.object({
  managementId: z.string().min(1, "管理番号を入力してください"),
  phoneLast4: z.string().regex(/^\d{4}$/, "電話番号の下4桁を正しく入力してください"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = statusSchema.safeParse(json);

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

    const result = await getWarrantyStatus(
      parsed.data.managementId,
      parsed.data.phoneLast4,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          message: result.message,
          needsRegistration: result.needsRegistration || false,
        },
        { status: result.needsRegistration ? 404 : 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "システムエラーが発生しました。時間をおいて再度お試しください。",
      },
      { status: 500 },
    );
  }
}


