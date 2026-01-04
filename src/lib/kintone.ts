import { prisma } from "./db";

export type WarrantyPlan = "standard" | "campaign" | "m" | "s";

export type WarrantyRegistrationPayload = {
  managementId: string;
  fullName: string;
  furigana: string;
  postalCode: string;
  address: string;
  phone: string;
  warrantyPlan: WarrantyPlan;
  reviewPledge: boolean;
  termsAgreed: boolean;
};

/**
 * 管理番号でデータベースのレコードを検索
 */
export async function findRecordByManagementId(
  managementId: string,
): Promise<{ id: string; record: Record<string, any> } | null> {
  try {
    const record = await prisma.warrantyRegistration.findUnique({
      where: { managementId },
    });

    if (!record) {
      return null;
    }

    // kintoneの形式に合わせたレコード形式を返す
    return {
      id: record.id,
      record: {
        managementId: record.managementId,
        phone: record.phone || "",
        fullName: record.fullName || "",
        furigana: record.furigana || "",
        postalCode: record.postalCode || "",
        address: record.address || "",
        maker: record.maker || "",
        model: record.model || "",
        serial: record.serial || "",
        purchaseSite: record.purchaseSite || "",
        purchaseDate: record.purchaseDate || "",
        warrantyPeriod: record.warrantyPeriod || "",
        warrantyPlan: record.warrantyPlan || "",
        warrantyEndDate: record.warrantyEndDate || "",
      },
    };
  } catch (error) {
    console.error("Database search error:", error);
    throw new Error(`データベースの検索に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * 既に登録済みかチェック（管理番号と氏名・電話番号で確認）
 */
export async function checkExistingRegistration(
  managementId: string,
  fullName: string,
  phone: string,
): Promise<{ exists: boolean; message?: string }> {
  const existing = await findRecordByManagementId(managementId);

  if (!existing) {
    return { exists: false };
  }

  const existingName = existing.record.fullName || "";
  const existingPhone = existing.record.phone || "";

  // 氏名または電話番号が既に入力されている場合は登録済みとみなす
  if (existingName || existingPhone) {
    return {
      exists: true,
      message: "この管理番号は既に登録済みです。",
    };
  }

  return { exists: false };
}

export async function createKintoneRecord(
  payload: WarrantyRegistrationPayload,
) {
  try {
    // 管理番号で既存レコードを検索
    const existing = await prisma.warrantyRegistration.findUnique({
      where: { managementId: payload.managementId },
    });

    if (existing) {
      const existingName = existing.fullName || "";
      const existingPhone = existing.phone || "";

      // 氏名または電話番号が既に入力されている場合は登録済み
      if (existingName || existingPhone) {
        throw new Error("この管理番号は既に登録済みです。");
      }

      // レコードは存在するが情報が未入力の場合は更新
      const updated = await prisma.warrantyRegistration.update({
        where: { id: existing.id },
        data: {
          phone: payload.phone,
          fullName: payload.fullName,
          furigana: payload.furigana,
          postalCode: payload.postalCode,
          address: payload.address,
          warrantyPlan: payload.warrantyPlan,
          reviewPledge: payload.reviewPledge,
          termsAgreed: payload.termsAgreed,
        },
      });

      return {
        id: updated.id,
        revision: "1",
      };
    }

    // 管理番号が見つからない場合はエラー
    throw new Error("該当の管理番号は見当たりません。");
  } catch (error) {
    if (error instanceof Error && error.message.includes("既に登録済み")) {
      throw error;
    }
    if (error instanceof Error && error.message.includes("該当の管理番号は見当たりません")) {
      throw error;
    }
    console.error("Database create/update error:", error);
    throw new Error(`データベースの登録に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * 管理番号と電話番号の下4桁で認証し、登録情報を取得
 */
export async function getWarrantyStatus(
  managementId: string,
  phoneLast4: string,
): Promise<{
  success: boolean;
  data?: any;
  message?: string;
  needsRegistration?: boolean;
}> {
  try {
    // 管理番号で検索
    const record = await findRecordByManagementId(managementId);

    if (!record) {
      return {
        success: false,
        message: "該当の管理番号は見当たりません。",
      };
    }

    const phone = record.record.phone || "";
    const fullName = record.record.fullName || "";

    // 氏名や電話番号が未入力の場合は登録を促す
    if (!fullName || !phone) {
      return {
        success: false,
        message: "この管理番号はまだ登録が完了していません。保証登録フォームから登録をお願いします。",
        needsRegistration: true,
      };
    }

    // 電話番号の下4桁を確認（ハイフンを除去して比較）
    const phoneDigits = phone.replace(/\D/g, "");
    const phoneLast4Digits = phoneDigits.slice(-4);
    if (phoneLast4Digits !== phoneLast4) {
      return {
        success: false,
        message: "管理番号と電話番号が一致しません。",
      };
    }

    // 認証成功 - 登録情報を返す
    return {
      success: true,
      data: {
        managementId: record.record.managementId || "",
        fullName: fullName,
        phone: phone,
        postalCode: record.record.postalCode || "",
        address: record.record.address || "",
        maker: record.record.maker || "",
        model: record.record.model || "",
        serial: record.record.serial || "",
        purchaseSite: record.record.purchaseSite || "",
        purchaseDate: record.record.purchaseDate || "",
        warrantyPeriod: record.record.warrantyPeriod || "",
        warrantyPlan: record.record.warrantyPlan || "",
        warrantyEndDate: record.record.warrantyEndDate || "",
      },
    };
  } catch (error) {
    console.error("Database status check error:", error);
    return {
      success: false,
      message: "システムエラーが発生しました。時間をおいて再度お試しください。",
    };
  }
}

