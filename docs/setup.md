# 開発環境セットアップ手順

このプロジェクトを新しい環境（別のPCなど）でセットアップするための手順です。

## 1. リポジトリのクローン
ターミナルで作業ディレクトリに移動し、以下のコマンドを実行します。

```bash
git clone https://github.com/ulunaia99-max/HONPOKUN-WARRANTY.git
cd HONPOKUN-WARRANTY
```

## 2. 依存関係のインストール
必要なパッケージをインストールします。

```bash
npm install
```

## 3. 環境変数の設定
ルートディレクトリに `.env` ファイルを作成し、以下の内容を設定してください。
※ 既存の環境から値をコピーするか、管理者に問い合わせてください。

**`.env` の内容例:**

```env
# データベース接続 (SQLiteの場合)
DATABASE_URL="file:./dev.db"

# Kintone連携 (必要な場合)
KINTONE_DOMAIN=your-subdomain.cybozu.com
KINTONE_APP_ID=123
KINTONE_API_TOKEN=xxxxxxxxxxxxxxxxxxxx
```

## 4. データベースのセットアップ
Prismaを使用してSQLiteデータベースを作成・マイグレーションします。

```bash
npx prisma migrate dev
```
※ このコマンドで `dev.db` が作成され、テーブル構造が定義されます。

## 5. 開発サーバーの起動

```bash
npm run dev
```
`http://localhost:3000` にアクセスして動作を確認してください。

## トラブルシューティング

### データベースエラーが発生する場合
- `.env` ファイルに `DATABASE_URL` が正しく設定されているか確認してください。
- `npx prisma generate` を実行してクライアントを再生成してみてください。

### Kintoneエラー
- APIトークンの権限（レコード追加など）を確認してください。
