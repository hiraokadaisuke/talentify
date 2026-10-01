create policy "admin_users_deny_select"
on public.admin_users for select to anon, authenticated
using (false);

create policy "admin_users_deny_insert"
on public.admin_users for insert to anon, authenticated
with check (false);

create policy "admin_users_deny_update"
on public.admin_users for update to anon, authenticated
using (false) with check (false);

create policy "admin_users_deny_delete"
on public.admin_users for delete to anon, authenticated
using (false);

create policy "admin_audit_log_deny_select"
on public.admin_audit_log for select to anon, authenticated
using (false);

create policy "admin_audit_log_deny_insert"
on public.admin_audit_log for insert to anon, authenticated
with check (false);

create policy "admin_audit_log_deny_update"
on public.admin_audit_log for update to anon, authenticated
using (false) with check (false);

create policy "admin_audit_log_deny_delete"
on public.admin_audit_log for delete to anon, authenticated
using (false);
