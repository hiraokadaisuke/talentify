# RLS: public.stores の最終ポリシー構成（2025-08-15）

## 目的

- 店舗オーナー（`auth.uid() = stores.user_id`）のみが自身の店舗を CRUD できる
- タレントは `offers` / `reviews` 経由で関連店舗のみ `SELECT` できる
- 匿名（public ロール）はアクセス不可

## 適用テーブル

- `public.stores`

## 有効化

```sql
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
```

## アクティブなポリシー（最終形）

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

-- タレント向け（関連する店舗のみ閲覧可）
-- offers 経由
CREATE POLICY "talent_can_select_related_store_via_offers"
ON public.stores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM talents t
    JOIN offers o ON o.talent_id = t.id
    WHERE t.user_id = auth.uid()
      AND o.store_id = stores.id
  )
);

-- reviews 経由
CREATE POLICY "talent_can_select_related_store_via_reviews"
ON public.stores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM talents t
    JOIN reviews r ON r.talent_id = t.id
    WHERE t.user_id = auth.uid()
      AND r.store_id = stores.id
  )
);
```

## 注記

- `TO authenticated` を明示し、public ロール（匿名）を含めない。
- `INSERT`/`UPDATE` は `USING` と `WITH CHECK` の両方で `auth.uid() = user_id` を満たす必要がある（upsert時も担保）。
- Service Role（サーバー側）は RLS をバイパスするため、フロントの実ユーザー検証は authenticated セッションで行う。

## 削除した/統合した旧ポリシー（参考）

- Allow authenticated insert
- Allow store owner insert / Allow store owner read / Allow store owner update
- store owners can insert/read/update/delete own stores
  （重複・役割曖昧・public ロール混在回避のため整理）

## 動作確認クエリ

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
