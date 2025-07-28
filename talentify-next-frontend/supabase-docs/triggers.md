## トリガー一覧

| トリガー名 | テーブル | タイミング | イベント | 関数 |
|------------|----------|-----------|---------|------|
| set_updated_at_companies | companies | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_invoices | invoices | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_notifications | notifications | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_offers | offers | BEFORE | UPDATE | update_updated_at_column |
| trigger_notify_talent_on_offer_created | offers | AFTER | INSERT | notify_talent_on_offer_created |
| set_updated_at_payments | payments | BEFORE | UPDATE | update_updated_at_column |
| trigger_notify_talent_on_payment_created | payments | AFTER | INSERT | notify_talent_on_payment_created |
| set_updated_at_reviews | reviews | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_schedules | schedules | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_stores | stores | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at | talents | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_talents | talents | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_visits | visits | BEFORE | UPDATE | update_updated_at_column |
