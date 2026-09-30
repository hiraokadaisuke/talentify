do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'talents'
      and column_name = 'phone'
  ) then
    update public.users u
    set phone = coalesce(u.phone, t.phone),
        updated_at = now()
    from public.talents t
    where t.user_id = u.auth_user_id
      and t.phone is not null
      and btrim(t.phone) <> ''
      and (u.phone is null or btrim(u.phone) = '');

    alter table public.talents drop column phone;
  end if;
end
$$;
