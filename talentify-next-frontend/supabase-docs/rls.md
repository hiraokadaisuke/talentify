## RLSポリシー一覧

### companies
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- 会社本人のみ登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- 会社本人のみ閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- 会社本人のみ更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### invoices
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- ストアは請求書を登録可能 (`INSERT`): CHECK `(auth.uid() = store_id)`
- ストアまたはタレントは自分の請求書を閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ストアは請求書を更新可能 (`UPDATE`): USING `(auth.uid() = store_id)`

### messages
- ユーザーは自分宛てのメッセージを閲覧可能 (`SELECT`): USING `((auth.uid() = sender_id) OR (auth.uid() = receiver_id))`

### notifications
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- サービスロールのみ通知を登録可能 (`INSERT`): CHECK `true`
- 受信者のみ通知を閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`

### offers
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- オファーはユーザー自身またはストアオーナーのみ登録可能 (`INSERT`): CHECK `auth.uid() = user_id OR EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid())`
- ストアは自分のオファーを削除可能 (`DELETE`): USING `(auth.uid() = store_id)`
- ユーザー自身、自分のストア、または自分のタレントに紐づくオファーを閲覧可能 (`SELECT`): USING `auth.uid() = user_id OR EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM talents t WHERE t.id = offers.talent_id AND t.user_id = auth.uid())`
- ストアとタレントが自分のオファーを更新可能 (`UPDATE`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`

### payments
支払いは自分のオファーに紐づくもののみ閲覧・更新可能。

```sql
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_select_self ON payments;
CREATE POLICY payments_select_self
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM offers o
    WHERE o.id = payments.offer_id
      AND (o.store_id = auth.uid() OR o.talent_id = auth.uid())
  )
);

DROP POLICY IF EXISTS payments_update_self ON payments;
CREATE POLICY payments_update_self
ON payments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM offers o
    WHERE o.id = payments.offer_id
      AND o.store_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM offers o
    WHERE o.id = payments.offer_id
      AND o.store_id = auth.uid()
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
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- ユーザーは自分のスケジュールを登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- ユーザーは自分のスケジュールを閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- ユーザーは自分のスケジュールを更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### stores
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- 認証済みユーザーはストアを登録可能 (`INSERT`): USING `true`, CHECK `true`
- ストアオーナーのみストアを登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- 認証済みユーザーは自分のストアを更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`
- ストアオーナーは自分のストアを閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- ストアオーナーは自分のストアを更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### talents
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- タレント本人のみ登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- ストアは公開済みでプロフィールが完成したタレントを閲覧可能 (`SELECT`): USING `(is_profile_complete = true)`
- タレント本人のみ閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- タレント本人のみ更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`

### visits
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- 関連するユーザーのみ訪問履歴を閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ストアは訪問履歴を更新可能 (`UPDATE`): USING `(auth.uid() = store_id)`
