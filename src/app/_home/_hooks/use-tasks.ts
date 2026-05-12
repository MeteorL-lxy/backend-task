/**
 * 任务管理子 Hook
 * 封装任务列表的增删改查、筛选排序、Realtime 同步等逻辑
 * 从 use-home-screen 拆分而来，仅关注任务相关的状态与副作用
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Task } from "@/types/database";
import type { TaskFormState } from "@/types/workspace";
import {
  createTask,
  fetchTasks,
  removeTask,
  removeTasksBatch,
  updateTaskStatus,
  updateTaskStatusById,
  updateTaskStatusBatch,
} from "@/api/tasks";
import { getSupabaseClient, hasSupabaseConfig } from "@/api/supabase/client";
import type { StatusMessageHandle } from "@/app/_home/_hooks/use-status-message";
import { getErrorMessage } from "@/utils/workspace";
import { validateForm, hasErrors, type FieldErrors } from "@/lib/validation";
import { taskFormSchema } from "@/lib/form-schemas";

/** 任务创建表单默认值 */
const defaultTaskForm: TaskFormState = {
  title: "",
  description: "",
  dueDate: "",
};

/** useTasks 的参数接口 */
export interface UseTasksOptions {
  /** 当前登录用户 */
  user: User | null;
  /** 状态消息操作对象 */
  message: StatusMessageHandle;
}

/** useTasks 返回值的接口类型 */
export type UseTasksHandle = {
  /** 全部任务列表 */
  tasks: Task[];
  /** 设置任务列表（供编辑器 hook 和聚合层使用） */
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  /** 任务创建表单状态 */
  taskForm: TaskFormState;
  /** 更新任务创建表单 */
  setTaskForm: React.Dispatch<React.SetStateAction<TaskFormState>>;
  /** 任务是否正在加载 */
  isTaskLoading: boolean;
  /** 筛选状态：全部 / 进行中 / 已完成 */
  filterStatus: "all" | "active" | "completed";
  /** 设置筛选状态（同时清空选择） */
  setFilterStatus: (status: "all" | "active" | "completed") => void;
  /** 排序方式 */
  sortBy: "createdAtDesc" | "createdAtAsc" | "dueDateAsc" | "dueDateDesc";
  /** 设置排序方式（同时清空选择） */
  setSortBy: (sort: "createdAtDesc" | "createdAtAsc" | "dueDateAsc" | "dueDateDesc") => void;
  /** 视图模式：列表 / 看板 */
  viewMode: "list" | "kanban";
  /** 设置视图模式 */
  setViewMode: React.Dispatch<React.SetStateAction<"list" | "kanban">>;
  /** 根据筛选和排序条件过滤后的任务列表 */
  filteredTasks: Task[];
  /** 已完成任务数量 */
  completedCount: number;
  /** 任务完成百分比（0-100） */
  taskProgress: number;
  /** 提交新任务 */
  submitTask: () => Promise<void>;
  /** 切换任务完成状态（乐观更新） */
  toggleTask: (task: Task) => Promise<void>;
  /** 删除任务（乐观更新） */
  deleteTask: (taskId: string) => Promise<void>;
  /** 重新加载任务列表 */
  reloadTasks: () => Promise<void>;
  /** 看板拖拽后更新任务状态 */
  handleKanbanDrop: (taskId: string, newStatus: Task["status"]) => Promise<void>;
  /** 任务创建表单的字段级错误 */
  taskErrors: FieldErrors<"title">;
  /** 当前选中的任务 ID 集合 */
  selectedIds: Set<string>;
  /** 选择/取消选择单个任务 */
  selectTask: (taskId: string, checked: boolean) => void;
  /** 全选/取消全选（基于当前筛选结果） */
  selectAll: (checked: boolean) => void;
  /** 清空选择 */
  clearSelection: () => void;
  /** 批量删除（乐观更新） */
  batchDelete: () => Promise<void>;
  /** 批量更新状态（乐观更新） */
  batchSetStatus: (status: Task["status"]) => Promise<void>;
};

/**
 * 任务管理 Hook
 * 管理任务的增删改查、筛选排序及 Supabase Realtime 实时同步
 * @param options - 用户信息与消息操作对象
 * @returns 任务相关的全部状态与操作方法
 */
export function useTasks({ user, message }: UseTasksOptions): UseTasksHandle {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskForm, setTaskForm] = useState<TaskFormState>(defaultTaskForm);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [taskErrors, setTaskErrors] = useState<FieldErrors<"title">>({});
  // 筛选条件：全部 / 进行中 / 已完成
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  // 排序方式
  const [sortBy, setSortBy] = useState<"createdAtDesc" | "createdAtAsc" | "dueDateAsc" | "dueDateDesc">("createdAtDesc");
  // 视图模式：列表 / 看板
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  // 多选状态：用 Set 管理，与 DOM 挂载/卸载无关
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // 保存 Realtime 频道引用，用于组件卸载时取消订阅
  const realtimeChannelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>["channel"]> | null>(null);

  // 已完成任务数量（记忆化，避免每次渲染都重新计算）
  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === "done").length,
    [tasks],
  );

  // 任务完成百分比（0-100）
  const taskProgress =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  // 根据筛选和排序条件计算最终展示的任务列表
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // 按状态筛选
    if (filterStatus === "active") {
      result = result.filter((t) => t.status !== "done");
    } else if (filterStatus === "completed") {
      result = result.filter((t) => t.status === "done");
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case "createdAtAsc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "dueDateAsc": {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        case "dueDateDesc": {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        }
        case "createdAtDesc":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [tasks, filterStatus, sortBy]);

  /**
   * 用户登录后加载任务列表
   * 当 user 变化时自动触发（登录/退出）
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    let isActive = true; // 用于防止组件卸载后仍然设置状态

    async function loadTasks() {
      setIsTaskLoading(true);

      try {
        const nextTasks = await fetchTasks();
        if (!isActive) return;
        setTasks(nextTasks);
      } catch (error) {
        if (!isActive) return;
        message.showError(getErrorMessage(error, "加载任务失败。"));
      } finally {
        if (isActive) setIsTaskLoading(false);
      }
    }

    void loadTasks();

    return () => {
      isActive = false;
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Supabase Realtime 订阅
   * 监听当前用户的 tasks 表变更，自动同步到本地状态
   * 支持多标签页实时感知其他标签页的改动
   */
  useEffect(() => {
    if (!user || !hasSupabaseConfig()) {
      return;
    }

    const supabase = getSupabaseClient();

    // 取消旧的订阅（防止重复）
    if (realtimeChannelRef.current) {
      void supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`tasks:user:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newTask = payload.new as Task;
          // 避免当前标签页自己触发的写操作重复追加（乐观更新已处理）
          setTasks((prev) => {
            if (prev.some((t) => t.id === newTask.id)) return prev;
            return [newTask, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedTask = payload.new as Task;
          setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setTasks((prev) => prev.filter((t) => t.id !== deletedId));
          // 被删除的任务从选中集合中移除
          setSelectedIds((prev) => {
            if (prev.has(deletedId)) {
              const next = new Set(prev);
              next.delete(deletedId);
              return next;
            }
            return prev;
          });
        },
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [user]);

  /** 重新加载任务列表 */
  async function reloadTasks() {
    setIsTaskLoading(true);

    try {
      const nextTasks = await fetchTasks();
      setTasks(nextTasks);
    } catch (error) {
      message.showError(getErrorMessage(error, "加载任务失败。"));
    } finally {
      setIsTaskLoading(false);
    }
  }

  /** 提交新任务 */
  async function submitTask() {
    // 表单验证
    const errors = validateForm(taskForm, taskFormSchema);
    if (hasErrors(errors)) {
      setTaskErrors(errors);
      return;
    }
    setTaskErrors({});

    if (!user || !taskForm.title.trim()) {
      return;
    }

    setIsTaskLoading(true);
    message.clear();

    try {
      await createTask(user.id, taskForm);
      setTaskForm(defaultTaskForm);
      message.showSuccess("任务已保存。");
      await reloadTasks();
    } catch (error) {
      message.showError(getErrorMessage(error, "保存任务失败。"));
    } finally {
      setIsTaskLoading(false);
    }
  }

  /** 切换任务完成状态（乐观更新） */
  async function toggleTask(task: Task) {
    try {
      await updateTaskStatus(task);
      // 先更新本地状态，无需等待接口返回
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id
            ? { ...currentTask, status: currentTask.status === "done" ? "todo" : "done" }
            : currentTask,
        ),
      );
    } catch (error) {
      message.showError(getErrorMessage(error, "更新任务失败。"));
    }
  }

  /** 删除任务（乐观更新） */
  async function deleteTask(taskId: string) {
    try {
      await removeTask(taskId);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    } catch (error) {
      message.showError(getErrorMessage(error, "删除任务失败。"));
    }
  }

  /** 选择/取消选择单个任务 */
  const selectTask = (taskId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  };

  /** 全选/取消全选（基于当前筛选结果） */
  const selectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filteredTasks.map((t) => t.id)) : new Set());
  };

  /** 清空选择 */
  const clearSelection = () => setSelectedIds(new Set());

  /** 批量删除（乐观更新） */
  async function batchDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setTasks((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    clearSelection();
    try {
      await removeTasksBatch(ids);
      message.showSuccess(`已删除 ${ids.length} 条任务`);
    } catch (error) {
      message.showError(getErrorMessage(error, "批量删除失败。"));
      await reloadTasks();
    }
  }

  /** 批量更新状态（乐观更新） */
  async function batchSetStatus(status: Task["status"]) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setTasks((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, status } : t)),
    );
    clearSelection();
    try {
      await updateTaskStatusBatch(ids, status);
      message.showSuccess(`已更新 ${ids.length} 条任务`);
    } catch (error) {
      message.showError(getErrorMessage(error, "批量更新失败。"));
      await reloadTasks();
    }
  }

  /** 更新筛选状态（同时清空选择） */
  const updateFilterStatus = (status: typeof filterStatus) => {
    setFilterStatus(status);
    setSelectedIds(new Set());
  };

  /** 更新排序方式（同时清空选择） */
  const updateSortBy = (sort: typeof sortBy) => {
    setSortBy(sort);
    setSelectedIds(new Set());
  };

  /** 看板拖拽后更新任务状态 */
  async function handleKanbanDrop(taskId: string, newStatus: Task["status"]) {
    // 乐观更新：先改本地状态
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus }
          : t,
      ),
    );
    try {
      await updateTaskStatusById(taskId, newStatus);
    } catch {
      // 失败则回滚：重新拉取
      await reloadTasks();
    }
  }

  return {
    tasks,
    setTasks,
    taskForm,
    setTaskForm,
    isTaskLoading,
    filterStatus,
    setFilterStatus: updateFilterStatus,
    sortBy,
    setSortBy: updateSortBy,
    viewMode,
    setViewMode,
    filteredTasks,
    completedCount,
    taskProgress,
    submitTask,
    toggleTask,
    deleteTask,
    reloadTasks,
    handleKanbanDrop,
    taskErrors,
    selectedIds,
    selectTask,
    selectAll,
    clearSelection,
    batchDelete,
    batchSetStatus,
  };
}
