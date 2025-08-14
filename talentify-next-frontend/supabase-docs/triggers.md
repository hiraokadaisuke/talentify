## トリガー一覧

| トリガー名 | テーブル | タイミング | イベント | 関数 |
|------------|----------|-----------|---------|------|
| set_updated_at_companies | companies | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_invoices | invoices | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_notifications | notifications | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_on_notifications | notifications | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_offers | offers | BEFORE | UPDATE | update_updated_at_column |
| trg_notify_talent_on_offer_created | offers | AFTER | INSERT | notify_talent_on_offer_created |
| trigger_notify_talent_on_offer_created | offers | AFTER | INSERT | notify_talent_on_offer_created |
| set_updated_at_payments | payments | BEFORE | UPDATE | update_updated_at_column |
| trigger_notify_talent_on_payment_created | payments | AFTER | INSERT | notify_talent_on_payment_created |
| set_updated_at_reviews | reviews | BEFORE | UPDATE | update_updated_at_column |
| trg_reviews_after_insert_notify | reviews | AFTER | INSERT | notify_review_received |
| trg_reviews_fill_and_validate | reviews | BEFORE | INSERT | reviews_fill_and_validate |
| trg_reviews_set_store_id | reviews | BEFORE | INSERT | set_review_store_id |
| trigger_notify_talent_on_review_created | reviews | AFTER | INSERT | notify_talent_on_review_created |
| trigger_set_offer_completed_on_review | reviews | AFTER | INSERT | handle_review_insert |
| set_updated_at_schedules | schedules | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_stores | stores | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at | talents | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_talents | talents | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_visits | visits | BEFORE | UPDATE | update_updated_at_column |
| tr_check_filters | realtime.subscription | BEFORE | INSERT OR UPDATE | realtime.subscription_check_filters |
| update_objects_updated_at | storage.objects | BEFORE | UPDATE | storage.update_updated_at_column |
