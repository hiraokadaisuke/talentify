# Migration Notes

Supabase 側で手動適用したスキーマ調整やデータ移行クエリを記録します。運用チームは変更が必要になった場合、ここに追記して履歴を一元管理してください。

## Role 値のリネーム: `performer` → `talent`
- **背景**: 旧システムで `talents.role` に `performer` という値を保存していたが、フロントエンド・ビジネス用語を `talent` に統一したため既存データを更新する必要があった。
- **適用手順**: Supabase SQL エディタで以下を実行。

```sql
UPDATE talents
SET role = 'talent'
WHERE role = 'performer';
```

- **備考**: 将来的に追加のロールが必要になった場合は ENUM 定義を更新した上で、ここに移行クエリを残す。
