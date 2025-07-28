## RLSポリシー一覧

### companies
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- company can insert self (`INSERT`): CHECK `(auth.uid() = user_id)`
- company can read self (`SELECT`): USING `(auth.uid() = user_id)`
- company can update self (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### invoices
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- store can insert invoices (`INSERT`): CHECK `(auth.uid() = store_id)`
- store or talent can view invoices (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- store can update invoices (`UPDATE`): USING `(auth.uid() = store_id)`

### messages
- user can view their own messages (`SELECT`): USING `((auth.uid() = sender_id) OR (auth.uid() = receiver_id))`

### notifications
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- only service role can insert notifications (`INSERT`): CHECK `true`
- only recipient can view notifications (`SELECT`): USING `(auth.uid() = user_id)`

### offers
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- store can insert offers (`INSERT`): CHECK `(auth.uid() = store_id)`
- store can delete their offers (`DELETE`): USING `(auth.uid() = store_id)`
- store or talent can view their offers (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- store can update their offers (`UPDATE`): USING `(auth.uid() = store_id)`

### payments
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- store can insert payments (`INSERT`): CHECK `(auth.uid() = ( SELECT invoices.store_id FROM invoices WHERE (invoices.offer_id = payments.offer_id)))`
- store can delete their payments (`DELETE`): USING `(auth.uid() = ( SELECT invoices.store_id FROM invoices WHERE (invoices.offer_id = payments.offer_id)))`
- store can view their payments (`SELECT`): USING `(auth.uid() = ( SELECT invoices.store_id FROM invoices WHERE (invoices.offer_id = payments.offer_id)))`
- store can update payments (`UPDATE`): USING `(auth.uid() = ( SELECT invoices.store_id FROM invoices WHERE (invoices.offer_id = payments.offer_id)))`

### reviews
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- store can insert reviews for own offer (`INSERT`): CHECK `((auth.uid() = store_id) AND (offer_id IN ( SELECT offers.id FROM offers WHERE (offers.store_id = auth.uid()))))`
- related users can read reviews (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`

### schedules
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- user can insert own schedules (`INSERT`): CHECK `(auth.uid() = user_id)`
- user can read own schedules (`SELECT`): USING `(auth.uid() = user_id)`
- user can update own schedules (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`

### stores
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- Allow authenticated insert (`INSERT`): CHECK `(auth.uid() = user_id)`
- Allow store owner insert (`INSERT`): CHECK `(auth.uid() = user_id)`
- Allow store owner read (`SELECT`): USING `(auth.uid() = user_id)`
- Allow store owner update (`UPDATE`): USING `(auth.uid() = user_id)`, CHECK `(auth.uid() = user_id)`
- Allow authenticated user to update own store (`UPDATE`): USING `(user_id = auth.uid())`

### talents
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- talent can insert self (`INSERT`): CHECK `(auth.uid() = user_id)`
- store can view completed public talents (`SELECT`): USING `(is_profile_complete = true)`
- talent can read self (`SELECT`): USING `(auth.uid() = user_id)`
- talent can update self (`UPDATE`): USING `(auth.uid() = user_id)`

### visits
- Authenticated read/write (`*`): USING `true`, CHECK `true`
- related users can view visits (`SELECT`): USING `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- store can update visits (`UPDATE`): USING `(auth.uid() = store_id)`
