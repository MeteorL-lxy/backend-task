-- 移除冗余的 is_done 列，统一使用 status 字段管理任务状态
-- 前置条件：所有代码已迁移到使用 status 字段
ALTER TABLE public.tasks DROP COLUMN IF EXISTS is_done;
