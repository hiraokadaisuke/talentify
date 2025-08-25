# RPC: public.get_offer_store_names(_offer_ids uuid[])

## Purpose
RLSを維持したまま、呼び出しユーザーに関係するオファーの店舗名のみ取得する。

## Returns
- `offer_id uuid`
- `store_id uuid`
- `store_display_name text`

## Security
- `SECURITY DEFINER`
- `SET search_path=public`
- `GRANT EXECUTE ON FUNCTION public.get_offer_store_names(uuid[]) TO authenticated`

## Access Control
`EXISTS` 句で「タレント本人 or ストア本人」のみを許可。

## Sample
```sql
select * from public.get_offer_store_names(array['<offer-uuid-1>','<offer-uuid-2>']);
```

## Client Example (TS)
```ts
const { data, error } = await supabase.rpc("get_offer_store_names", { _offer_ids: offerIds });
```
