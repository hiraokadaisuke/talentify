alter table public.notifications
  add column if not exists title text,
  add column if not exists body text;

update public.notifications
set title = coalesce(title, data->>'title', type::text)
where title is null;

alter table public.notifications
  alter column title set not null;
