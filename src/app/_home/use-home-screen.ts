/**
 * 首页（工作台）的业务逻辑 Hook
 * 管理认证、任务、个人档案的全部状态与副作用
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/app/auth-provider";
import type { Profile, Task } from "@/types/database";
import {
  signIn,
  signOut,
  signUp,
} from "@/api/auth";
import { ensureProfile, fetchProfile } from "@/api/profile";
import {
  createTask,
  fetchTasks,
  removeTask,
  updateTask,
  updateTaskStatus,
} from "@/api/tasks";
import type {
  AuthFormState,
  AuthMode,
  MessageTone,
  TaskFormState,
} from "@/types/workspace";
import type { TaskEditorForm } from "@/app/_home/_components/task-editor";
import { getErrorMessage, readNicknameFromUser } from "@/utils/workspace";

/** 认证表单默认值 */
const defaultAuthForm: AuthFormState = {
  email: "",
  password: "",
  nickname: "",
};

/** 任务创建表单默认值 */
const defaultTaskForm: TaskFormState = {
  title: "",
  description: "",
  dueDate: "",
};

/** 任务编辑表单默认值 */
const defaultEditForm: TaskEditorForm = {
  title: "",
  description: "",
  dueDate: "",
};

/**
 * 首页状态管理 Hook
 * @returns 首页所需的全部状态与操作方法
 */
export function useHomeScreen() {
  const { isAuthReady, user } = useAuthSession();
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [authForm, setAuthForm] = useState<AuthFormState>(defaultAuthForm);
  const [taskForm, setTaskForm] = useState<TaskFormState>(defaultTaskForm);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<MessageTone>("neutral");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<TaskEditorForm>(defaultEditForm);
  const [isEditSaving, setIsEditSaving] = useState(false);

  // 已完成任务数量（记忆化，避免每次渲染都重新计算）
  const completedCount = useMemo(
    () => tasks.filter((task) => task.is_done).length,
    [tasks],
  );

  // 任务完成百分比（0-100）
  const taskProgress =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  // 展示名称优先级：档案昵称 > 认证元数据昵称 > 邮箱前缀
  const displayName =
    profile?.nickname || readNicknameFromUser(user) || user?.email?.split("@")[0] || null;

  /**
   * 用户登录后初始化数据
   * 自动创建/同步用户档案，并加载任务列表
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    let isActive = true; // 用于防止组件卸载后仍然设置状态

    async function bootstrap() {
      setIsProfileLoading(true);
      setMessage("");
      setProfile(null);
      setTasks([]);

      try {
        // 确保档案存在，然后并行加载档案和任务
        const ensuredProfile = await ensureProfile(currentUser);
        const [nextProfile, nextTasks] = await Promise.all([
          ensuredProfile ? Promise.resolve(ensuredProfile) : fetchProfile(currentUser.id),
          fetchTasks(),
        ]);

        if (!isActive) {
          return;
        }

        setProfile(nextProfile);
        setTasks(nextTasks);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMessage(getErrorMessage(error, "加载工作台失败。"));
        setMessageTone("error");
      } finally {
        if (isActive) {
          setIsProfileLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, [user]);

  /** 重新加载任务列表 */
  async function reloadTasks() {
    setIsTaskLoading(true);

    try {
      const nextTasks = await fetchTasks();
      setTasks(nextTasks);
    } catch (error) {
      setMessage(getErrorMessage(error, "加载任务失败。"));
      setMessageTone("error");
    } finally {
      setIsTaskLoading(false);
    }
  }

  /** 提交登录或注册表单 */
  async function submitAuth() {
    setIsAuthLoading(true);
    setMessage("");

    try {
      if (authMode === "sign-in") {
        const { error } = await signIn(authForm.email, authForm.password);
        if (error) {
          throw error;
        }

        setMessage("欢迎回来，已经登录。");
      } else {
        const { error } = await signUp(
          authForm.email,
          authForm.password,
          authForm.nickname.trim(),
        );
        if (error) {
          throw error;
        }

        setMessage("账号已创建。");
      }

      setMessageTone("success");
      setAuthForm((current) => ({
        ...current,
        password: "",
        nickname: "",
      }));
    } catch (error) {
      setMessage(getErrorMessage(error, "操作失败，请稍后再试。"));
      setMessageTone("error");
    } finally {
      setIsAuthLoading(false);
    }
  }

  /** 退出登录并清空本地状态 */
  async function logout() {
    await signOut();
    setProfile(null);
    setTasks([]);
    setMessage("你已退出当前账号。");
    setMessageTone("neutral");
  }

  /** 提交新任务 */
  async function submitTask() {
    if (!user || !taskForm.title.trim()) {
      return;
    }

    setIsTaskLoading(true);
    setMessage("");

    try {
      await createTask(user.id, taskForm);
      setTaskForm(defaultTaskForm);
      setMessage("任务已保存。");
      setMessageTone("success");
      await reloadTasks();
    } catch (error) {
      setMessage(getErrorMessage(error, "保存任务失败。"));
      setMessageTone("error");
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
            ? { ...currentTask, is_done: !currentTask.is_done }
            : currentTask,
        ),
      );
    } catch (error) {
      setMessage(getErrorMessage(error, "更新任务失败。"));
      setMessageTone("error");
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
      setMessage(getErrorMessage(error, "删除任务失败。"));
      setMessageTone("error");
    }
  }

  /** 打开任务编辑器，并填充当前任务数据 */
  function openEditor(task: Task) {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description ?? "",
      dueDate: task.due_date ?? "",
    });
  }

  /** 关闭编辑器并重置表单 */
  function closeEditor() {
    setEditingTask(null);
    setEditForm(defaultEditForm);
  }

  /** 提交任务编辑（乐观更新） */
  async function submitEdit() {
    if (!editingTask || !editForm.title.trim()) {
      return;
    }

    setIsEditSaving(true);
    setMessage("");

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
      setMessage("任务已更新。");
      setMessageTone("success");
      closeEditor();
    } catch (error) {
      setMessage(getErrorMessage(error, "更新任务失败。"));
      setMessageTone("error");
    } finally {
      setIsEditSaving(false);
    }
  }

  return {
    authMode,
    authForm,
    completedCount,
    displayName,
    isAuthLoading,
    isAuthReady,
    isProfileLoading,
    isTaskLoading,
    message,
    messageTone,
    profile,
    setAuthForm,
    setAuthMode,
    setTaskForm,
    submitAuth,
    submitTask,
    taskForm,
    taskProgress,
    tasks,
    toggleTask,
    deleteTask,
    reloadTasks,
    user,
    logout,
    editingTask,
    editForm,
    isEditSaving,
    setEditForm,
    openEditor,
    closeEditor,
    submitEdit,
  };
}
