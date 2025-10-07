# Supabase Operations Handbook

本ドキュメントは Supabase 関連の運用ナレッジを 1 か所に集約したものです。RLS ポリシー、RPC、及び補助 SQL の情報を横断的に確認できます。

## 目次
- [Row Level Security (RLS)](#row-level-security-rls)
  - [public.stores ポリシー最終構成 (2025-08-15)](#publicstores-ポリシー最終構成-2025-08-15)
  - [public.offer_messages ポリシー (2025-08-30)](#publicoffer_messages-ポリシー-2025-08-30)
- [Remote Procedure Calls (RPC)](#remote-procedure-calls-rpc)
  - [public.get_offer_store_names(uuid[])](#publicget_offer_store_namesuuid)
- [関連 SQL スクリプト](#関連-sql-スクリプト)

---

## Row Level Security (RLS)

### public.stores ポリシー最終構成 (2025-08-15)

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

### public.offer_messages ポリシー (2025-08-30)

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

## Remote Procedure Calls (RPC)

### public.get_offer_store_names(uuid[])

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

## 関連 SQL スクリプト

| ファイル | 概要 |
| --- | --- |
| `20250825_add_rpcs_for_store_display_name.sql` | `get_offer_store_names` 追加用マイグレーション。 |
| `20250830_offer_message_tables.sql` | `offer_messages` テーブルおよび関連制約を定義。 |
| `20250901_unread_messages_rpc.sql` | 未読メッセージ数取得 RPC の下書き。 |
| `20250904_add_bank_fields_to_talents.sql` | `talents` テーブルへの銀行口座カラム追加。 |

---

今後 Supabase 関連の知見を追記する際は本ファイルに集約し、断片化を防ぎます。
