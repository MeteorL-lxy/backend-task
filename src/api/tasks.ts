/**
 * 任务（Task）相关 API
 * 封装 public.tasks 表的 CRUD 操作
 */

import { getSupabaseClient } from "@/api/supabase/client";
import type { Task } from "@/types/database";

/**
 * 获取当前登录用户的所有任务
 * 按创建时间倒序排列（最新的排在最前面）
 * @returns 任务数组
 */
export async function fetchTasks() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

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
  const { error } = await supabase
    .from("tasks")
    .update({
      is_done: !task.is_done,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task.id);

  if (error) {
    throw error;
  }
}

/**
 * 编辑任务内容（标题、描述、截止日期）
 * @param taskId - 任务 UUID
 * @param input - 需要更新的字段
 */
export async function updateTask(
  taskId: string,
  input: { title?: string; description?: string; dueDate?: string | null },
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title?.trim(),
      description: input.description?.trim() || null,
      due_date: input.dueDate || null,
      updated_at: new Date().toISOString(),
    })
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
