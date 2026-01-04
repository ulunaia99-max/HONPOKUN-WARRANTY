## 環境変数の設定

`.env.local` に以下の値を設定してください。kintoneアプリのフィールドコードは `src/lib/kintone.ts` の `FIELD_CODES` を実際の環境に合わせて変更します。

```
KINTONE_DOMAIN=your-subdomain.cybozu.com
KINTONE_APP_ID=123
KINTONE_API_TOKEN=xxxxxxxxxxxxxxxxxxxx
```

## セットアップ手順

1. 依存関係をインストール  
   `npm install`
2. 開発サーバーを起動  
   `npm run dev`
3. `http://localhost:3000` にアクセスしてフォームを確認します。LINEの挨拶メッセージでは、このURLをLIFFまたは外部ブラウザリンクとして使用してください。

## kintone連携

- APIトークンには「レコード追加」権限が必要です。
- 口コミ投稿の有無などのフィールドが無い場合は、新規フィールドを作成し `FIELD_CODES` と揃えてください。
- 本番運用時は必ずHTTPSで配信し、APIトークンはサーバーサイドのみで扱ってください。


