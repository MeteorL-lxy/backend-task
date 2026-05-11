/**
 * 启用 tasks 表的 Supabase Realtime
 * 让前端可以通过 WebSocket 实时感知多标签页的数据变更
 */

-- 将 tasks 表添加到 supabase_realtime publication（如果不存在）
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end
$$;
