-- Explicitly deny browser roles access to public contact inquiry records.
-- Table grants are already revoked; these policies make the intent visible to RLS tooling.

drop policy if exists contact_inquiries_deny_select on public.contact_inquiries;
drop policy if exists contact_inquiries_deny_insert on public.contact_inquiries;
drop policy if exists contact_inquiries_deny_update on public.contact_inquiries;
drop policy if exists contact_inquiries_deny_delete on public.contact_inquiries;

create policy contact_inquiries_deny_select
on public.contact_inquiries
for select
to anon, authenticated
using (false);

create policy contact_inquiries_deny_insert
on public.contact_inquiries
for insert
to anon, authenticated
with check (false);

create policy contact_inquiries_deny_update
on public.contact_inquiries
for update
to anon, authenticated
using (false)
with check (false);

create policy contact_inquiries_deny_delete
on public.contact_inquiries
for delete
to anon, authenticated
using (false);
