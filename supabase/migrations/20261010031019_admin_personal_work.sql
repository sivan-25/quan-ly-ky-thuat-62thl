-- Personal Admin work journal is deliberately independent of project_snapshots.
-- Visible to Admin users; only the creator may modify or remove an entry.
create table if not exists public.admin_personal_tasks (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(btrim(title)) between 1 and 500),
 task_type text not null default 'Hằng ngày' check (task_type in ('Hằng ngày','Bảo trì','Sự cố')),
 priority text not null default 'Trung bình' check (priority in ('Thấp','Trung bình','Cao','Khẩn cấp')),
 start_date date not null,
 end_date date not null,
 assignee text not null default 'Văn' check (assignee = 'Văn'),
 status text not null default 'Đang thực hiện' check (status in ('Đang thực hiện','Chờ xử lý','Hoàn thành')),
 notes text not null default '' check (char_length(notes) <= 2000),
 image_paths jsonb not null default '[]'::jsonb check (jsonb_typeof(image_paths) = 'array'),
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint admin_personal_task_date_order check (end_date >= start_date)
);
create index if not exists admin_personal_tasks_created_at_idx on public.admin_personal_tasks (created_at desc);
create index if not exists admin_personal_tasks_creator_idx on public.admin_personal_tasks (created_by);
alter table public.admin_personal_tasks enable row level security;
revoke all on public.admin_personal_tasks from anon;
grant select,insert,update,delete on public.admin_personal_tasks to authenticated;
create policy "admin_personal_task_read" on public.admin_personal_tasks
 for select to authenticated using ((select private.is_qlkt_admin()));
create policy "admin_personal_task_insert" on public.admin_personal_tasks
 for insert to authenticated with check ((select private.is_qlkt_admin()) and created_by=(select auth.uid()));
create policy "admin_personal_task_update" on public.admin_personal_tasks
 for update to authenticated
 using ((select private.is_qlkt_admin()) and created_by=(select auth.uid()))
 with check ((select private.is_qlkt_admin()) and created_by=(select auth.uid()));
create policy "admin_personal_task_delete" on public.admin_personal_tasks
 for delete to authenticated using ((select private.is_qlkt_admin()) and created_by=(select auth.uid()));
create or replace function private.touch_admin_personal_task()
 returns trigger language plpgsql set search_path = '' as $func$
 begin new.updated_at=now();return new;end $func$;
create trigger admin_personal_task_touch before update on public.admin_personal_tasks
 for each row execute function private.touch_admin_personal_task();
