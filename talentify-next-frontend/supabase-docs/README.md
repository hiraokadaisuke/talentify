# Supabase設計ドキュメント（Talentify）

このディレクトリは、Supabase に関する全てのDB設計情報を含みます。
Codexはコード生成や修正時にこれらを参照してください。

## 構成ファイル

- [schema.md](./schema.md): 各テーブルとカラム定義
- [constraints.md](./constraints.md): 主キー・外部キー・ユニーク制約
- [enums.md](./enums.md): ENUM型一覧
- [rls.md](./rls.md): Row Level Securityポリシー
- [triggers.md](./triggers.md): トリガー定義
- [functions.sql](./functions.sql): PL/pgSQL関数定義

## プロビジョニングフロー

- `/talent/edit` と `/store/edit` ではアクセス時に `user_id = auth.uid()` の行を `select … maybeSingle` で確認し、存在しない場合は初期値で `insert` します。
- 重複によるユニーク制約エラーは無視し、初回のみ `provisioned <role> profile` をログ出力します。
- 以後の `SELECT/INSERT/UPDATE` は RLS 前提で常に `user_id` 条件を付与してください。

## 通知運用ルール

- 通知は service role (`createServiceClient`) でのみ作成します。
- 通知の宛先は関連するタレントの `talents.user_id` を `notifications.user_id` にそのままセットします。
- `talents.user_id` を取得できない場合は通知を作成せず、理由をサーバーログに記録します。
