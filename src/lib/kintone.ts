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

const FIELD_CODES = {
  managementId: "文字列__1行__14",
  phone: "文字列__1行__4",
  fullName: "name_1",
  postalCode: "文字列__1行__5",
  address: "address_1",
} as const;

const planLabelMap: Record<WarrantyPlan, string> = {
  standard: "通常保証（1ヶ月）",
  campaign: "キャンペーン保証（3ヶ月）",
  m: "Mプラン（6ヶ月）",
  s: "Sプラン（12ヶ月）",
};

/**
 * 管理番号でkintoneのレコードを検索
 */
async function findRecordByManagementId(
  managementId: string,
): Promise<{ id: string; record: Record<string, any> } | null> {
  const domain = process.env.KINTONE_DOMAIN;
  const appId = process.env.KINTONE_APP_ID;
  const apiToken = process.env.KINTONE_API_TOKEN;
  const mockMode = process.env.KINTONE_MOCK_MODE === "true";

  if (mockMode || !domain || !appId || !apiToken) {
    return null;
  }

  const endpoint = `https://${domain}/k/v1/records.json`;
  const query = `${FIELD_CODES.managementId} = "${managementId}"`;

  const response = await fetch(
    `${endpoint}?app=${appId}&query=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "X-Cybozu-API-Token": apiToken,
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`kintoneの検索に失敗しました: ${message}`);
  }

  const data = await response.json();
  if (data.records && data.records.length > 0) {
    return {
      id: data.records[0].$id.value,
      record: data.records[0],
    };
  }

  return null;
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

  const existingName = existing.record[FIELD_CODES.fullName]?.value || "";
  const existingPhone = existing.record[FIELD_CODES.phone]?.value || "";

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
  const domain = process.env.KINTONE_DOMAIN;
  const appId = process.env.KINTONE_APP_ID;
  const apiToken = process.env.KINTONE_API_TOKEN;
  const mockMode = process.env.KINTONE_MOCK_MODE === "true";

  // モックモードまたは設定が未完了の場合は、モックレスポンスを返す
  if (mockMode || !domain || !appId || !apiToken) {
    if (!mockMode && (!domain || !appId || !apiToken)) {
      console.log(
        "⚠️ Kintoneの設定が未完了のため、モックモードで動作しています。",
      );
      console.log("本番環境では .env.local に KINTONE_DOMAIN, KINTONE_APP_ID, KINTONE_API_TOKEN を設定してください。",
      );
    } else {
      console.log("✅ Kintoneモックモード: 登録データ", payload);
    }
    // モックレスポンス（実際のkintoneと同じ形式）
    return {
      id: `mock_${Date.now()}`,
      revision: "1",
    };
  }

  // 管理番号で既存レコードを検索
  const existing = await findRecordByManagementId(payload.managementId);

  if (existing) {
    const existingName = existing.record[FIELD_CODES.fullName]?.value || "";
    const existingPhone = existing.record[FIELD_CODES.phone]?.value || "";

    // 氏名または電話番号が既に入力されている場合は登録済み
    if (existingName || existingPhone) {
      throw new Error("この管理番号は既に登録済みです。");
    }

    // レコードは存在するが情報が未入力の場合は更新
    const endpoint = `https://${domain}/k/v1/record.json`;
    const body = {
      app: appId,
      id: existing.id,
      record: {
        [FIELD_CODES.phone]: { value: payload.phone },
        [FIELD_CODES.fullName]: { value: payload.fullName },
        [FIELD_CODES.postalCode]: { value: payload.postalCode },
        [FIELD_CODES.address]: { value: payload.address },
      },
    };

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Cybozu-API-Token": apiToken,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`kintoneの更新に失敗しました: ${message}`);
    }

    return response.json();
  }

  // 管理番号が存在しない場合はエラー
  throw new Error("該当の管理番号は見当たりません。");
}

