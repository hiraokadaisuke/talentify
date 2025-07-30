Talentify【タレントファイ】

Talentify は、ライター・演者とパチンコホールをマッチングするプラットフォームです。ホールは演者を検索・オファー、演者はプロフィール作成・スケジュール管理ができます。

📁 プロジェクト構成

/talentify-next-frontend   ← メインの Next.js アプリ (App Router 構成)
/supabase                  ← Supabase プロジェクト構成・管理

Next.js の API Routes や Middleware を用いたサーバー処理と
Supabase を組み合わせた BaaS 構成です。
認証・DB・ストレージは Supabase が提供し、
API や処理の一部を Next.js 側で実装しています。

```
+-------------+      +-----------+
|   Next.js   | <--> | Supabase  |
| (API/MW)    |      | (Auth,DB) |
+-------------+      +-----------+
```

UI は shadcn/ui + Tailwind CSS

✨ セットアップ手順

1. Supabase プロジェクトを作成

Supabase で新規プロジェクトを作成し、下記の情報を獲得:

SUPABASE_URL

SUPABASE_ANON_KEY

2. .env.local の作成

talentify-next-frontend 目に `.env.local` を作成し、下記を記述:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://example.com
NOTIFICATION_WEBHOOK_URL=https://example.com/webhook

`NOTIFICATION_WEBHOOK_URL` はオファーのステータス更新後に通知を送るWebフックのURLです。

※ `.env.local` は `.gitignore` に含まれています。

3. ビルド / デプロイ

`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`、
そして `NEXT_PUBLIC_SITE_URL` は `npm run build` などのビルド時にも必須です。
Vercel などにデプロイする際は同じ名前で環境変数を設定してください。
設定されていない場合、ミドルウェアでリダイレクト先 URL が生成できず
`500` エラーとなる可能性があります。

4. 開発サーバーの起動

cd talentify-next-frontend
npm install
npm run dev

http://localhost:3000 で開始します。
4. Lint チェック
cd talentify-next-frontend
npm run lint

5. テスト実行
cd talentify-next-frontend
npm test


✨ 実装済み・予定機能

✅ 実装済

Supabase 認証 (ログイン/新規登録)

演者プロフィール登録/編集

店舗からのオファー機能

スケジュールカレンダー表示

ダッシュボード UI (演者/店舗)

🔜 実装予定

メッセージ機能

オファー承認/迷惑操作

ギャラ管理/支払いフロー

出演評価/レビュー投稿

デプロイ (予定: Vercel)

📦 ディレクトリ構成 (Next.js)

talentify-next-frontend/
├── app/                 # App Router のページ定義
├── components/          # UI コンポーネント
├── lib/                 # Supabase クライアント/ユーティリティ
├── styles/              # CSS
├── public/              # 静的ファイル
├── .env.local           # Supabase 設定
└── package.json

🔐 Supabase の活用ポイント

PostgreSQL を使用したスキーマベースのデータ構造

Row Level Security (RLS) による安全なデータアクセス
RLSポリシーの詳細は [docs/rls-policies.md](docs/rls-policies.md) を参照してください。

Supabase Auth による認証管理 (メール/パスワード)

Supabase Storage で画像/動画アップロード

## Migration Notes

The role string previously stored as `performer` is now `talent`.
Run the following SQL on Supabase to migrate existing data:

```sql
UPDATE talents SET role = 'talent' WHERE role = 'performer';
```

📄 ライセンス

MIT License. See the LICENSE file for details.
