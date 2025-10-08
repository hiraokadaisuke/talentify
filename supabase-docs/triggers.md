## トリガー一覧

| トリガー名 | テーブル | タイミング | イベント | 関数 |
|------------|----------|-----------|---------|------|
| set_updated_at_companies | companies | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_invoices | invoices | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_notifications | notifications | BEFORE | UPDATE | update_updated_at_column |
| set_updated_at_on_notifications | notifications | BEFORE | UPDATE | update_updated_at_column |
| set_participants_key | message_threads | BEFORE | INSERT OR UPDATE | normalize_participants_key |
| set_updated_at_offers | offers | BEFORE | UPDATE | update_updated_at_column |
| trg_notify_talent_on_offer_created | offers | AFTER | INSERT | notify_talent_on_offer_created |
| trg_create_payment_on_offer_confirmed | offers | AFTER | UPDATE | create_payment_on_offer_confirmed |
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
| enforce_bucket_name_length_trigger | storage.buckets | BEFORE | INSERT OR UPDATE | storage.enforce_bucket_name_length |
| objects_delete_delete_prefix | storage.objects | AFTER | DELETE | storage.delete_prefix_hierarchy_trigger |
| objects_insert_create_prefix | storage.objects | BEFORE | INSERT | storage.objects_insert_prefix_trigger |
| objects_update_create_prefix | storage.objects | BEFORE | UPDATE | storage.objects_update_prefix_trigger |
| update_objects_updated_at | storage.objects | BEFORE | UPDATE | storage.update_updated_at_column |
| prefixes_create_hierarchy | storage.prefixes | BEFORE | INSERT | storage.prefixes_insert_trigger |
| prefixes_delete_hierarchy | storage.prefixes | AFTER | DELETE | storage.delete_prefix_hierarchy_trigger |

```
drop trigger if exists trg_create_payment_on_offer_confirmed on public.offers;
create trigger trg_create_payment_on_offer_confirmed
after update of status on public.offers
for each row
when (old.status is distinct from new.status)
execute function public.create_payment_on_offer_confirmed();
```
