## RLSポリシー一覧

### companies
- 会社本人のみ登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- 会社本人のみ閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- 会社本人のみ更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### invoices
- タレントは自分の請求書を登録可能 (`INSERT`): CHECK `(auth.uid() = talent_id)`
- ストアは自分の請求書を登録可能 (`INSERT`): CHECK `(auth.uid() = store_id)`
- ストアまたはタレントは自分の請求書を閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ストアまたはタレントは請求書を更新可能 (`UPDATE`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ストアは請求書を更新可能 (`UPDATE`): USING `(auth.uid() = store_id)`

### messages
- ユーザーは自分宛てのメッセージを閲覧可能 (`SELECT`): USING `((auth.uid() = sender_id) OR (auth.uid() = receiver_id))`

### notifications
- サービスロールのみ通知を登録可能 (`INSERT`): CHECK `true`
- 受信者のみ通知を閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`

### offers
- オファーはユーザー本人またはストアオーナーのみ登録可能 (`INSERT`): CHECK `auth.uid() = user_id OR EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid())`
- ストアは自分のオファーを削除可能 (`DELETE`): USING `EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid())`
- ストアまたはタレントは自分のオファーを閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ユーザー自身、所属するストアまたはタレントに紐づくオファーを閲覧可能 (`SELECT`): USING `auth.uid() = user_id OR EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM talents t WHERE t.id = offers.talent_id AND t.user_id = auth.uid())`
- ストアは自分のオファーを更新可能 (`UPDATE`): USING `EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid())`, CHECK `EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid())`
- タレントは自分のオファーのステータスを更新可能 (`UPDATE`): USING `EXISTS (SELECT 1 FROM talents t WHERE t.id = offers.talent_id AND t.user_id = auth.uid())`, CHECK `EXISTS (SELECT 1 FROM talents t WHERE t.id = offers.talent_id AND t.user_id = auth.uid()) AND (status = ANY (ARRAY['confirmed'::status_type, 'rejected'::status_type, 'pending'::status_type]))`

### payments
支払いは自分のオファーに紐づくもののみ閲覧・更新可能。

```sql
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_select_self ON payments;
CREATE POLICY payments_select_self
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1
      FROM offers o
      JOIN stores s ON s.id = o.store_id
      LEFT JOIN talents t ON t.id = o.talent_id
     WHERE o.id = payments.offer_id
       AND (s.user_id = auth.uid() OR t.user_id = auth.uid())
  )
);

CREATE POLICY IF NOT EXISTS "stores can update own payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (
  exists (
    select 1 from public.offers o
    join public.stores s on s.id = o.store_id
    where o.id = payments.offer_id
      and s.user_id = auth.uid()
  )
)
WITH CHECK (
  exists (
    select 1 from public.offers o
    join public.stores s on s.id = o.store_id
    where o.id = payments.offer_id
      and s.user_id = auth.uid()
  )
);
```

※支払い完了を操作できるのはホール（store）ユーザーのみです。

### reviews
- `INSERT`: offer_id を基準に `offers → stores.user_id = auth.uid()` で判定
- `SELECT`: `is_public = true` なら誰でも、それ以外は当事者（store/talent）のみ閲覧可
- SQLエディタでのテスト例:
  ```sql
  set local role authenticated;
  select set_config('request.jwt.claims', json_build_object('sub', '<ユーザーID>')::text, true);
  ```
- 推奨ペイロード例: `{ offer_id, rating, comment?, is_public?, category_ratings? }`
- RLS違反時の代表的なエラー: `new row violates row-level security policy for table "reviews"`

### schedules
- ユーザーは自分のスケジュールを登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- ユーザーは自分のスケジュールを閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- ユーザーは自分のスケジュールを更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### stores
- ストアオーナーのみ登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- ストアオーナーのみ閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- ストアオーナーのみ更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### store_profiles
- ストアオーナーのみ登録可能 (`INSERT`): CHECK `EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.user_id = auth.uid())`
- ストアオーナーのみ閲覧可能 (`SELECT`): USING `EXISTS (SELECT 1 FROM stores s WHERE s.id = store_profiles.store_id AND s.user_id = auth.uid())`
- ストアオーナーのみ更新可能 (`UPDATE`): USING `EXISTS (SELECT 1 FROM stores s WHERE s.id = store_profiles.store_id AND s.user_id = auth.uid())`, CHECK `EXISTS (SELECT 1 FROM stores s WHERE s.id = store_profiles.store_id AND s.user_id = auth.uid())`

### talents
- タレント本人のみ登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- ストアは公開済みでプロフィールが完成したタレントを閲覧可能 (`SELECT`): USING `(is_profile_complete = true)`
- タレント本人のみ閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- タレント本人のみ更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`

### visits
- 関連するユーザーのみ訪問履歴を閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ストアは訪問履歴を更新可能 (`UPDATE`): USING `(auth.uid() = store_id)`

### storage.objects
- 認証済みユーザーは `avatars` バケットにアップロード可能 (`INSERT`): CHECK `(bucket_id = 'avatars')`
- 認証済みユーザーは `logos` バケットにアップロード可能 (`INSERT`): CHECK `(bucket_id = 'logos')`
- 認証済みユーザーは `talent-photos` バケットにアップロード可能 (`INSERT`): CHECK `(bucket_id = 'talent-photos')`
- 認証済みユーザーは `talent-videos` バケットにアップロード可能 (`INSERT`): CHECK `(bucket_id = 'talent-videos')`
- 誰でも `avatars` バケットを閲覧可能 (`SELECT`): USING `(bucket_id = 'avatars')`
- 誰でも `logos` バケットを閲覧可能 (`SELECT`): USING `(bucket_id = 'logos')`
- 誰でも `talent-photos` バケットを閲覧可能 (`SELECT`): USING `(bucket_id = 'talent-photos')`
- オーナーのみ `talent-photos` バケットを更新 (`UPDATE`): USING `((bucket_id = 'talent-photos') AND (owner = auth.uid()))`, CHECK `((bucket_id = 'talent-photos') AND (owner = auth.uid()))`
- オーナーのみ `talent-photos` バケットを削除 (`DELETE`): USING `((bucket_id = 'talent-photos') AND (owner = auth.uid()))`
