-- 为任务表增加状态字段，支持看板视图的三列：待办/进行中/已完成

-- 新增状态字段，默认值为 todo（待办）
alter table public.tasks add column if not exists status text not null default 'todo';

-- 将现有数据迁移到新字段
-- is_done = true 的任务标记为 done（已完成）
-- is_done = false 的任务保持 todo（待办）
update public.tasks set status = 'done' where is_done = true;

-- 为状态字段创建索引，提升按状态查询的性能
create index if not exists tasks_status_idx on public.tasks(status);

