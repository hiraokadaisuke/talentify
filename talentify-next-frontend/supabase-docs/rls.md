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
- ストアはオファーを登録可能 (`INSERT`): CHECK `(auth.uid() = store_id)`
- ストアは自分のオファーを削除可能 (`DELETE`): USING `(auth.uid() = store_id)`
- ストアまたはタレントは自分のオファーを閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- ストアは自分のオファーを更新可能 (`UPDATE`): USING `(auth.uid() = store_id)`

### payments
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- ストアは支払いを登録可能 (`INSERT`): CHECK `(auth.uid() = ( SELECT invoices.store_id FROM invoices WHERE (invoices.offer_id = payments.offer_id)))`
- ストアは自分の支払いを削除可能 (`DELETE`): USING `(auth.uid() = ( SELECT invoices.store_id FROM invoices WHERE (invoices.offer_id = payments.offer_id)))`
- ストアは自分の支払いを閲覧可能 (`SELECT`): USING `(auth.uid() = ( SELECT invoices.store_id FROM invoices WHERE (invoices.offer_id = payments.offer_id)))`
- ストアは支払いを更新可能 (`UPDATE`): USING `(auth.uid() = ( SELECT invoices.store_id FROM invoices WHERE (invoices.offer_id = payments.offer_id)))`

### reviews
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- ストアは自分のオファーにレビューを追加可能 (`INSERT`): CHECK `((auth.uid() = store_id) AND (offer_id IN ( SELECT offers.id FROM offers WHERE (offers.store_id = auth.uid()))))`
- 関連するユーザーのみレビューを閲覧可能 (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`

### schedules
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- ユーザーは自分のスケジュールを登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
- ユーザーは自分のスケジュールを閲覧可能 (`SELECT`): USING `(auth.uid() = user_id)`
- ユーザーは自分のスケジュールを更新可能 (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### stores
- 認証済みユーザーは読み書き可能 (`*`): USING `true`, CHECK `true`
- 認証済みユーザーはストアを登録可能 (`INSERT`): CHECK `(auth.uid() = user_id)`
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
