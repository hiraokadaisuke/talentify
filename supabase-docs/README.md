# Supabase Documentation Hub

本ディレクトリは Supabase に関する設計情報と運用ナレッジを 1 か所に集約したハブです。データベーススキーマ、RLS ポリシー、RPC、補助 SQL などを横断的に参照できます。

## ドキュメント構成
- [schema.md](./schema.md): 各テーブルとカラム定義
- [constraints.md](./constraints.md): 主キー・外部キー・ユニーク制約
- [enums.md](./enums.md) / [./enums](./enums): ENUM 型の詳細と JSON 定義
- [extensions.md](./extensions.md): 有効化済み拡張機能の一覧
- [rls.md](./rls.md): Row Level Security ポリシー一覧
- [triggers.md](./triggers.md): トリガー定義
- [sequences.md](./sequences.md): シーケンス定義
- [functions.sql](./functions.sql): PL/pgSQL 関数定義
- [invoices-rls-and-policies.md](./invoices-rls-and-policies.md): 請求書関連の RLS とポリシー
- [invoices-status-and-payment.md](./invoices-status-and-payment.md): 請求書ステータスと支払いフロー
- [migration-notes.md](./migration-notes.md): 手動で適用した移行クエリや補足メモ
- [20250315_add_note_to_visits.sql](./20250315_add_note_to_visits.sql) などの SQL: マイグレーションや補助スクリプト

## 設計メモ
### プロビジョニングフロー
- `/talent/edit` と `/store/edit` ではアクセス時に `user_id = auth.uid()` の行を `select … maybeSingle` で確認し、存在しない場合は初期値で `insert`。
- 重複によるユニーク制約エラーは無視し、初回のみ `provisioned <role> profile` をログ出力。
- 以後の `SELECT/INSERT/UPDATE` は RLS 前提で常に `user_id` 条件を付与。

### 通知運用ルール
- 通知は service role (`createServiceClient`) でのみ作成。
- 通知の宛先は関連するタレントの `talents.user_id` を `notifications.user_id` にそのままセット。
- `talents.user_id` を取得できない場合は通知を作成せず、理由をサーバーログに記録。

### API 仕様: スケジュール取得
`GET /api/store/schedule?from=&to=&statuses=&includeCompleted=`

- `includeCompleted` (boolean, default: `true`): `false` の場合、完了済みの予定を除外。

## 運用ハンドブック

### Row Level Security (RLS)

#### public.stores ポリシー最終構成 (2025-08-15)

- **目的**
  - 店舗オーナー（`auth.uid() = stores.user_id`）のみが自身の店舗を CRUD できる
  - 匿名（public ロール）はアクセス不可
- **適用テーブル**: `public.stores`
- **有効化**
  ```sql
  ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
  ```
- **アクティブなポリシー（最終形）**
  ```sql
  -- 店舗オーナー向け
  CREATE POLICY "store_owner_select_own"
  ON public.stores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

  CREATE POLICY "store_owner_insert_own"
  ON public.stores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "store_owner_update_own"
  ON public.stores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "store_owner_delete_own"
  ON public.stores
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
  ```
- **注記**
  - `TO authenticated` を明示し、public ロール（匿名）を含めない。
  - `INSERT`/`UPDATE` は `USING` と `WITH CHECK` の両方で `auth.uid() = user_id` を満たす必要がある（upsert 時も担保）。
  - Service Role（サーバー側）は RLS をバイパスするため、フロントの実ユーザー検証は authenticated セッションで行う。
- **削除・統合済みの旧ポリシー**
  - Allow authenticated insert
  - Allow store owner insert / Allow store owner read / Allow store owner update
  - store owners can insert/read/update/delete own stores（重複・役割曖昧・public ロール混在回避のため整理）
- **変更履歴 (2025-08-15)**
  - `public.stores`: `talent_can_select_related_store_via_offers`, `talent_can_select_related_store_via_reviews` を削除
  - オーナースコープのポリシーのみ（`auth.uid() = user_id`）を SELECT/INSERT/UPDATE/DELETE に残す
  - フロントエンド規約: タレントは `stores` を直接参照せず、`offers`/`reviews`/`payments` 経由で取得する
  - 目的: Postgres エラー 42P17 "infinite recursion" の回避
- **動作確認クエリ**
  ```sql
  -- 現在のポリシー一覧
  SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
  FROM pg_policies
  WHERE tablename = 'stores'
  ORDER BY policyname, cmd;

  -- 1) 自分の行だけ SELECT できるか
  EXPLAIN (costs off)
  SELECT * FROM public.stores WHERE user_id = auth.uid();

  -- 2) 自分以外の行 UPDATE が拒否されること（この UPDATE は失敗する想定）
  UPDATE public.stores SET store_name = 'test' WHERE user_id <> auth.uid();
  ```

#### public.offer_messages ポリシー (2025-08-30)

- **有効化**
  ```sql
  ALTER TABLE public.offer_messages ENABLE ROW LEVEL SECURITY;
  ```
- **ポリシー**
  ```sql
  -- Users can view messages they sent or received
  CREATE POLICY offer_messages_select ON public.offer_messages
  FOR SELECT USING (
    auth.uid() = sender_user OR auth.uid() = receiver_user
  );

  -- Only the sender may insert their own messages
  CREATE POLICY offer_messages_insert ON public.offer_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_user
  );
  ```
- **注記**
  - `offer_id` はオファーとメッセージを紐付けるための任意フィールド。
  - 挿入は送信者のみ、閲覧は送信者または受信者に限定。

### Remote Procedure Calls (RPC)

#### public.get_offer_store_names(uuid[])

- **目的**: RLS を維持したまま、呼び出しユーザーに関係するオファーの店舗名のみ取得する。
- **戻り値**
  - `offer_id uuid`
  - `store_id uuid`
  - `store_display_name text`
- **セキュリティ**
  - `SECURITY DEFINER`
  - `SET search_path=public`
  - `GRANT EXECUTE ON FUNCTION public.get_offer_store_names(uuid[]) TO authenticated`
- **アクセス制御**: `EXISTS` 句で「タレント本人 or ストア本人」のみ許可。
- **利用例**
  ```sql
  select * from public.get_offer_store_names(array['<offer-uuid-1>','<offer-uuid-2>']);
  ```
- **クライアント実装例 (TypeScript)**
  ```ts
  const { data, error } = await supabase.rpc("get_offer_store_names", { _offer_ids: offerIds });
  ```

### 関連 SQL スクリプト

| ファイル | 概要 |
| --- | --- |
| `20250315_add_note_to_visits.sql` | `visit_notes` 追加のための補助スクリプト。 |
| `20250825_add_rpcs_for_store_display_name.sql` | `get_offer_store_names` 追加用マイグレーション。 |
| `20250830_offer_message_tables.sql` | `offer_messages` テーブルおよび関連制約を定義。 |
| `20250904_add_bank_fields_to_talents.sql` | `talents` テーブルへの銀行口座カラム追加。 |

---

今後 Supabase 関連の知見を追記する際は本ディレクトリに集約し、断片化を防ぎます。
