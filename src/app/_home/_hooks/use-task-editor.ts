/**
 * 任务编辑器子 Hook
 * 封装任务编辑弹窗的状态与操作逻辑
 * 从 use-home-screen 拆分而来，仅关注编辑相关的状态与副作用
 */

"use client";

import { useState } from "react";
import type { Task } from "@/types/database";
import { updateTask } from "@/api/tasks";
import type { TaskEditorForm } from "@/app/_home/_components/task-editor";
import type { StatusMessageHandle } from "@/app/_home/_hooks/use-status-message";
import { getErrorMessage } from "@/utils/workspace";
import { validateForm, hasErrors, type FieldErrors } from "@/lib/validation";
import { taskEditSchema } from "@/lib/form-schemas";

/** 任务编辑表单默认值 */
const defaultEditForm: TaskEditorForm = {
  title: "",
  description: "",
  dueDate: "",
};

/** useTaskEditor 的参数接口 */
export interface UseTaskEditorOptions {
  /** 全部任务列表（供未来扩展校验使用） */
  tasks: Task[];
  /** 设置任务列表（用于乐观更新） */
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  /** 状态消息操作对象 */
  message: StatusMessageHandle;
}

/** useTaskEditor 返回值的接口类型 */
export type UseTaskEditorHandle = {
  /** 当前正在编辑的任务 */
  editingTask: Task | null;
  /** 编辑表单状态 */
  editForm: TaskEditorForm;
  /** 更新编辑表单 */
  setEditForm: React.Dispatch<React.SetStateAction<TaskEditorForm>>;
  /** 是否正在保存编辑 */
  isEditSaving: boolean;
  /** 打开任务编辑器，并填充当前任务数据 */
  openEditor: (task: Task) => void;
  /** 关闭编辑器并重置表单 */
  closeEditor: () => void;
  /** 提交任务编辑（乐观更新） */
  submitEdit: () => Promise<void>;
  /** 编辑表单的字段级错误 */
  editErrors: FieldErrors<"title">;
};

/**
 * 任务编辑器 Hook
 * 管理编辑弹窗的打开/关闭、表单状态和提交保存
 * @param options - 任务列表、setState 和消息操作对象
 * @returns 编辑器相关的全部状态与操作方法
 */
export function useTaskEditor({ setTasks, message }: UseTaskEditorOptions): UseTaskEditorHandle {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<TaskEditorForm>(defaultEditForm);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<FieldErrors<"title">>({});

  /** 打开任务编辑器，并填充当前任务数据 */
  function openEditor(task: Task) {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description ?? "",
      dueDate: task.due_date ?? "",
    });
    setEditErrors({});
  }

  /** 关闭编辑器并重置表单 */
  function closeEditor() {
    setEditingTask(null);
    setEditForm(defaultEditForm);
  }

  /** 提交任务编辑（乐观更新） */
  async function submitEdit() {
    // 表单验证
    const errors = validateForm(editForm, taskEditSchema);
    if (hasErrors(errors)) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    if (!editingTask || !editForm.title.trim()) {
      return;
    }

    setIsEditSaving(true);
    message.clear();

    try {
      await updateTask(editingTask.id, editForm);
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: editForm.title.trim(),
                description: editForm.description.trim() || null,
                due_date: editForm.dueDate || null,
                updated_at: new Date().toISOString(),
              }
            : task,
        ),
      );
      message.showSuccess("任务已更新。");
      closeEditor();
    } catch (error) {
      message.showError(getErrorMessage(error, "更新任务失败。"));
    } finally {
      setIsEditSaving(false);
    }
  }

  return {
    editingTask,
    editForm,
    setEditForm,
    isEditSaving,
    openEditor,
    closeEditor,
    submitEdit,
    editErrors,
  };
}
