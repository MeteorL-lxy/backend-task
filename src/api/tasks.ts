/**
 * 任务（Task）相关 API
 * 封装 public.tasks 表的 CRUD 操作
 */

import { getSupabaseClient } from "@/api/supabase/client";
import type { Task } from "@/types/database";

/**
 * 更新任务的看板状态（拖拽后调用）
 * @param taskId - 任务 UUID
 * @param status - 目标状态
 */
export async function updateTaskStatusById(
  taskId: string,
  status: Task["status"],
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}

/**
 * 获取当前登录用户的所有任务
 * 按创建时间倒序排列（最新的排在最前面）
 * @param options - 可选分页参数（limit/offset），不传则加载全部
 * @returns 任务数组
 */
export async function fetchTasks(options?: { limit?: number; offset?: number }) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.limit) {
    const offset = options.offset ?? 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * 创建新任务
 * @param userId - 任务所属用户的 UUID
 * @param input - 任务表单数据（标题、描述、截止日期）
 */
export async function createTask(
  userId: string,
  input: { title: string; description: string; dueDate: string },
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("tasks").insert({
    user_id: userId,
    title: input.title.trim(),
    description: input.description.trim() || null,
    status: "todo",
    due_date: input.dueDate || null,
  });

  if (error) {
    throw error;
  }
}

/**
 * 切换任务的完成状态（已完成 ↔ 进行中）
 * @param task - 需要切换状态的任务对象
 */
export async function updateTaskStatus(task: Task) {
  const supabase = getSupabaseClient();
  const nextStatus = task.status === "done" ? "todo" : "done";
  const { error } = await supabase
    .from("tasks")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task.id);

  if (error) {
    throw error;
  }
}

/**
 * 编辑任务内容（标题、描述、截止日期、状态）
 * @param taskId - 任务 UUID
 * @param input - 需要更新的字段
 */
export async function updateTask(
  taskId: string,
  input: { title?: string; description?: string; dueDate?: string | null; status?: Task["status"] },
) {
  const supabase = getSupabaseClient();
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.description !== undefined) updateData.description = input.description.trim() || null;
  if (input.dueDate !== undefined) updateData.due_date = input.dueDate || null;
  if (input.status !== undefined) {
    updateData.status = input.status;
  }

  const { error } = await supabase
    .from("tasks")
    .update(updateData as object)
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}

/**
 * 删除指定任务
 * @param taskId - 需要删除的任务 UUID
 */
export async function removeTask(taskId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw error;
  }
}

/**
 * 批量删除任务
 * @param taskIds - 需要删除的任务 UUID 数组
 */
export async function removeTasksBatch(taskIds: string[]) {
  if (taskIds.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .in("id", taskIds);
  if (error) throw error;
}

/**
 * 批量更新任务状态
 * @param taskIds - 需要更新的任务 UUID 数组
 * @param newStatus - 目标状态
 */
export async function updateTaskStatusBatch(
  taskIds: string[],
  newStatus: "todo" | "in_progress" | "done",
) {
  if (taskIds.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .in("id", taskIds);
  if (error) throw error;
}
