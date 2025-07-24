## RLSポリシー（例）

### stores（SELECT）
- 条件: user_id = auth.uid()

### talents（SELECT）
- 条件: id = current_user_id

### offers（INSERT）
- 条件: store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())