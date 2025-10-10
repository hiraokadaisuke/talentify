## RLSポリシー一覧

### companies
- 会社本人のみ登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- 会社本人のみ閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- 会社本人のみ更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### invoices
- タレントは自分のオファーに紐づく請求書のみ登録可能 (`INSERT`):
  - 直接所有 (`talent_id`) の場合: CHECK `(auth.uid() = talent_id)`
  - オファー経由 (`offer_id`) の場合: CHECK `EXISTS (SELECT 1 FROM offers o JOIN talents t ON t.id = o.talent_id WHERE o.id = invoices.offer_id AND t.user_id = auth.uid())`
- ストアは自分の請求書のみ登録可能 (`INSERT`): CHECK `(auth.uid() = store_id)`
- ストアまたはタレントは自分の請求書のみ閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ストアユーザーは店舗所有者（stores.user_id）の照合でも閲覧・更新可能:
  - `SELECT`: USING `EXISTS (SELECT 1 FROM stores s WHERE s.id = invoices.store_id AND s.user_id = auth.uid())`
  - `UPDATE`: USING/CHECK `EXISTS (SELECT 1 FROM stores s WHERE s.id = invoices.store_id AND s.user_id = auth.uid())`
- タレントは自分の請求書をステータスに応じて更新可能 (`UPDATE`):
  - draft の編集: USING/CHECK `EXISTS (SELECT 1 FROM talents t WHERE t.id = invoices.talent_id AND t.user_id = auth.uid()) AND status = 'draft'`
  - 送信・承認フロー: USING `EXISTS (SELECT 1 FROM talents t WHERE t.id = invoices.talent_id AND t.user_id = auth.uid()) AND status IN ('draft', 'submitted')`, CHECK 同条件かつ `status IN ('submitted', 'approved')`
- ストアとタレントはいずれも自分の請求書を更新可能 (`UPDATE`): USING `(auth.uid() = store_id) OR (auth.uid() = talent_id)`

### message_threads
- 参加者のみスレッドを登録可能 (`INSERT`): CHECK `(auth.uid() = ANY (participant_user_ids))`
- 参加者のみスレッドを閲覧可能 (`SELECT`): USING `(auth.uid() = ANY (participant_user_ids))`

### messages
- スレッド参加者のみメッセージを登録可能 (`INSERT`): CHECK `sender_user_id = auth.uid()` かつ `EXISTS (SELECT 1 FROM message_threads t WHERE t.id = messages.thread_id AND auth.uid() = ANY (t.participant_user_ids))`
- スレッド参加者のみメッセージを閲覧可能 (`SELECT`): USING `EXISTS (SELECT 1 FROM message_threads t WHERE t.id = messages.thread_id AND auth.uid() = ANY (t.participant_user_ids))`
- 既存の直接送受信フィールドでも閲覧可能 (`SELECT`): USING `((auth.uid() = sender_id) OR (auth.uid() = receiver_id))`

### message_read_receipts
- スレッド参加者のみ既読情報を登録可能 (`INSERT`):
  - CHECK `user_id = auth.uid()`
  - CHECK `EXISTS (SELECT 1 FROM messages m JOIN message_threads t ON t.id = m.thread_id WHERE m.id = message_read_receipts.message_id AND auth.uid() = ANY (t.participant_user_ids))`
- スレッド参加者のみ既読情報を閲覧可能 (`SELECT`): USING `EXISTS (SELECT 1 FROM messages m JOIN message_threads t ON t.id = m.thread_id WHERE m.id = message_read_receipts.message_id AND auth.uid() = ANY (t.participant_user_ids))`

### notifications
- サービスロールのみ通知を登録可能 (`INSERT`): CHECK `true`
- 受信者のみ通知を閲覧・更新可能 (`SELECT`/`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### offer_messages
- 送信者本人のみメッセージを登録可能 (`INSERT`): CHECK `(auth.uid() = sender_user)`
- 送信者または受信者のみ閲覧可能 (`SELECT`): USING `((auth.uid() = sender_user) OR (auth.uid() = receiver_user))`

### offer_read_receipts
- 関係者のみ閲覧可能 (`SELECT`): USING `EXISTS (SELECT 1 FROM offers o WHERE o.id = offer_read_receipts.offer_id AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM stores s WHERE s.id = o.store_id AND s.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM talents t WHERE t.id = o.talent_id AND t.user_id = auth.uid()))`
- 関係者かつ本人のみ upsert 可能 (`ALL`): USING `true`, CHECK `user_id = auth.uid()` かつ上記関連者条件

### offers
- ユーザー本人またはストアオーナーのみ登録可能 (`INSERT`): CHECK `(auth.uid() = user_id) OR EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid())`
- ストアは自分のオファーを削除可能 (`DELETE`): USING `EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid())`
- ストアまたはタレントは自分のオファーを閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ユーザー本人・所属ストア・タレントでの閲覧も許可 (`SELECT`): USING `(auth.uid() = user_id) OR EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM talents t WHERE t.id = offers.talent_id AND t.user_id = auth.uid())`
- ストアは自分のオファーを更新可能 (`UPDATE`): USING/CHECK `EXISTS (SELECT 1 FROM stores s WHERE s.id = offers.store_id AND s.user_id = auth.uid())`
- タレントは自分のオファーを更新可能 (`UPDATE`): USING/CHECK `EXISTS (SELECT 1 FROM talents t WHERE t.id = offers.talent_id AND t.user_id = auth.uid()) AND status IN ('confirmed', 'rejected', 'pending')`

### payments
- 関係者（ストアまたはタレント）のみ閲覧可能 (`SELECT`): USING `EXISTS (SELECT 1 FROM offers o JOIN stores s ON s.id = o.store_id LEFT JOIN talents t ON t.id = o.talent_id WHERE o.id = payments.offer_id AND (s.user_id = auth.uid() OR t.user_id = auth.uid()))`
- ストアオーナーのみ更新可能 (`UPDATE`): USING/CHECK `EXISTS (SELECT 1 FROM offers o JOIN stores s ON s.id = o.store_id WHERE o.id = payments.offer_id AND s.user_id = auth.uid())`
- 認証の有無に関わらず `payments_select_self` は `public` ロールを対象にしているため、匿名ユーザーでも JWT を介して権限があれば参照可能です。

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
- ストアオーナーのみ削除可能 (`DELETE`): USING `(auth.uid() = user_id)`

### store_profiles
- ストアオーナーのみ登録可能 (`INSERT`): CHECK `EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.user_id = auth.uid())`
- ストアオーナーのみ閲覧可能 (`SELECT`): USING `EXISTS (SELECT 1 FROM stores s WHERE s.id = store_profiles.store_id AND s.user_id = auth.uid())`
- ストアオーナーのみ更新可能 (`UPDATE`): USING/CHECK `EXISTS (SELECT 1 FROM stores s WHERE s.id = store_profiles.store_id AND s.user_id = auth.uid())`

### talent_availability_dates
- タレント本人のみ登録 (`INSERT`): CHECK `(auth.uid() = user_id)`
- タレント本人のみ閲覧 (`SELECT`): USING `(auth.uid() = user_id)`
- タレント本人のみ更新 (`UPDATE`): USING/CHECK `(auth.uid() = user_id)`
- タレント本人のみ削除 (`DELETE`): USING `(auth.uid() = user_id)`

### talent_availability_settings
- タレント本人のみ登録 (`INSERT`): CHECK `(auth.uid() = user_id)`
- タレント本人のみ閲覧 (`SELECT`): USING `(auth.uid() = user_id)`
- タレント本人のみ更新 (`UPDATE`): USING/CHECK `(auth.uid() = user_id)`

### talents
- タレント本人のみ登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- ストアは公開済みでプロフィールが完成したタレントを閲覧可能 (`SELECT`): USING `(is_profile_complete = true)`
- タレント本人のみ閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- タレント本人のみ更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`

### visits
- 関連するユーザーのみ訪問履歴を閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ストアオーナーは stores.user_id 経由でも閲覧可能 (`SELECT`): USING `EXISTS (SELECT 1 FROM stores s WHERE s.id = visits.store_id AND s.user_id = auth.uid())`
- ストアは訪問履歴を更新可能 (`UPDATE`): USING `(auth.uid() = store_id)`

### storage.objects
- 認証済みユーザーは `avatars` バケットにアップロード可能 (`INSERT`): CHECK `(bucket_id = 'avatars')`
- 認証済みユーザーは `logos` バケットにアップロード可能 (`INSERT`): CHECK `(bucket_id = 'logos')`
- 認証済みユーザーは `talent-photos` バケットにアップロード可能 (`INSERT`): CHECK `(bucket_id = 'talent-photos')`
- 認証済みユーザーは `talent-videos` バケットにアップロード可能 (`INSERT`): CHECK `(bucket_id = 'talent-videos')`
- 誰でも `avatars` バケットを閲覧可能 (`SELECT`): USING `(bucket_id = 'avatars')`
- 誰でも `logos` バケットを閲覧可能 (`SELECT`): USING `(bucket_id = 'logos')`
- 誰でも `talent-photos` バケットを閲覧可能 (`SELECT`): USING `(bucket_id = 'talent-photos')`
- オーナーのみ `talent-photos` バケットを更新 (`UPDATE`): USING/CHECK `((bucket_id = 'talent-photos') AND (owner = auth.uid()))`
- オーナーのみ `talent-photos` バケットを削除 (`DELETE`): USING `((bucket_id = 'talent-photos') AND (owner = auth.uid()))`
