-- Private storage for performer-supplied estimate PDFs.
-- Client roles receive no storage.objects policy for this bucket; reads/writes
-- are performed by authenticated application APIs using the server service role.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'invoices',
  'invoices',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
