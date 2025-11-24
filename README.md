## ほんぽくん保証登録（試作品）

LINE公式アカウントの挨拶メニューからアクセスできる保証登録フォームの試作品です。入力内容はNext.jsのAPIルート経由でkintoneにレコード登録されます。

### 主な特徴

- 青と白を基調にしたポップなUI（Tailwind CSS）
- 管理番号・氏名・住所などの必須フィールドを網羅
- 有料保証の希望有無とGoogle口コミ投稿の意思表示をワンタップで取得
- `.env.local` で設定したkintoneアプリに即時連携

### セットアップ

```bash
npm install
# .env.local に kintone の環境変数を設定
npm run dev
```

#### 環境変数の設定

`.env.local` ファイルを作成し、以下のいずれかを設定してください：

**本番環境（kintoneに接続する場合）:**
```
KINTONE_DOMAIN=tl648rw3jpg9.cybozu.com
KINTONE_APP_ID=9
KINTONE_API_TOKEN=zGVP7Oo5oiCKtHJ2SpnABMrK04MQZ5tQoTxRBCBu
```

**kintoneフィールドマッピング:**
- 管理番号: `文字列__1行__14`
- 電話番号: `文字列__1行__4`
- 氏名(漢字): `name_1`
- 郵便番号: `文字列__1行__5`
- 住所: `address_1`

**重複チェック機能:**
- 管理番号で既存レコードを検索
- 氏名または電話番号が既に入力されている場合は「既に登録済み」エラーを表示
- レコードは存在するが情報が未入力の場合は更新処理を実行

**開発・テスト環境（kintoneの設定がなくても動作確認する場合）:**
```
KINTONE_MOCK_MODE=true
```

モックモードを有効にすると、実際のkintoneには接続せずに動作確認できます。登録情報はlocalStorageに保存され、確認画面が表示されます。

詳細な手順は `docs/setup.md` を参照してください。

