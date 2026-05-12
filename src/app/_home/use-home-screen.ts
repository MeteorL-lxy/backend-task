/**
 * 首页（工作台）聚合 Hook
 * 组合三个子 Hook（状态消息、任务管理、任务编辑器）
 * 并保留认证与档案初始化逻辑
 */

"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/app/auth-provider";
import type { Profile } from "@/types/database";
import type { AuthFormState, AuthMode } from "@/types/workspace";
import { signIn, signOut, signUp } from "@/api/auth";
import { ensureProfile, fetchProfile } from "@/api/profile";
import { getErrorMessage, readNicknameFromUser } from "@/utils/workspace";
import { useStatusMessage } from "@/app/_home/_hooks/use-status-message";
import { useTasks } from "@/app/_home/_hooks/use-tasks";
import { useTaskEditor } from "@/app/_home/_hooks/use-task-editor";
import { validateForm, hasErrors, type FieldErrors } from "@/lib/validation";
import { authSignInSchema, authSignUpSchema } from "@/lib/form-schemas";

/** 认证表单默认值 */
const defaultAuthForm: AuthFormState = {
  email: "",
  password: "",
  nickname: "",
};

/**
 * 首页状态管理 Hook（聚合层）
 * 组合子 Hook 并补充认证与档案逻辑，返回值与重构前完全一致
 * @returns 首页所需的全部状态与操作方法
 */
export function useHomeScreen() {
  const { isAuthReady, user } = useAuthSession();

  // ── 认证状态 ──
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [authForm, setAuthForm] = useState<AuthFormState>(defaultAuthForm);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authErrors, setAuthErrors] = useState<FieldErrors<"email" | "password" | "nickname">>({});

  // ── 档案状态 ──
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // ── 子 Hook 组合 ──
  const statusMessage = useStatusMessage();
  const tasksHook = useTasks({ user, message: statusMessage });
  const editorHook = useTaskEditor({
    tasks: tasksHook.tasks,
    setTasks: tasksHook.setTasks,
    message: statusMessage,
  });

  // 展示名称优先级：档案昵称 > 认证元数据昵称 > 邮箱前缀
  const displayName =
    profile?.nickname || readNicknameFromUser(user) || user?.email?.split("@")[0] || null;

  /**
   * 用户登录后初始化档案
   * 自动创建/同步用户档案，任务加载由 useTasks 内部 Effect 独立处理
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    const currentUser = user;
    let isActive = true; // 用于防止组件卸载后仍然设置状态

    async function bootstrapProfile() {
      setIsProfileLoading(true);
      statusMessage.clear();
      setProfile(null);

      try {
        const ensuredProfile = await ensureProfile(currentUser);
        const nextProfile = ensuredProfile
          ? ensuredProfile
          : await fetchProfile(currentUser.id);

        if (!isActive) return;
        setProfile(nextProfile);
      } catch (error) {
        if (!isActive) return;
        statusMessage.showError(getErrorMessage(error, "加载档案失败。"));
      } finally {
        if (isActive) setIsProfileLoading(false);
      }
    }

    void bootstrapProfile();

    return () => {
      isActive = false;
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 提交登录或注册表单 */
  async function submitAuth() {
    // 表单验证
    const schema = authMode === "sign-up" ? authSignUpSchema : authSignInSchema;
    const errors = validateForm(authForm, schema);
    if (hasErrors(errors)) {
      setAuthErrors(errors);
      return;
    }
    setAuthErrors({});

    setIsAuthLoading(true);
    statusMessage.clear();

    try {
      if (authMode === "sign-in") {
        const { error } = await signIn(authForm.email, authForm.password);
        if (error) {
          throw error;
        }

        statusMessage.showSuccess("欢迎回来，已经登录。");
      } else {
        const { error } = await signUp(
          authForm.email,
          authForm.password,
          authForm.nickname.trim(),
        );
        if (error) {
          throw error;
        }

        statusMessage.showSuccess("账号已创建。");
      }

      setAuthForm((current) => ({
        ...current,
        password: "",
        nickname: "",
      }));
    } catch (error) {
      statusMessage.showError(getErrorMessage(error, "操作失败，请稍后再试。"));
    } finally {
      setIsAuthLoading(false);
    }
  }

  /** 退出登录并清空本地状态 */
  async function logout() {
    await signOut();
    setProfile(null);
    tasksHook.setTasks([]);
    statusMessage.showNeutral("你已退出当前账号。");
  }

  // 返回值与重构前完全一致的 key 列表
  return {
    authMode,
    authForm,
    authErrors,
    completedCount: tasksHook.completedCount,
    displayName,
    isAuthLoading,
    isAuthReady,
    isProfileLoading,
    isTaskLoading: tasksHook.isTaskLoading,
    message: statusMessage.message,
    messageTone: statusMessage.messageTone,
    profile,
    setAuthForm,
    setAuthMode,
    setTaskForm: tasksHook.setTaskForm,
    submitAuth,
    submitTask: tasksHook.submitTask,
    taskForm: tasksHook.taskForm,
    taskProgress: tasksHook.taskProgress,
    tasks: tasksHook.tasks,
    toggleTask: tasksHook.toggleTask,
    deleteTask: tasksHook.deleteTask,
    reloadTasks: tasksHook.reloadTasks,
    user,
    logout,
    taskErrors: tasksHook.taskErrors,
    editErrors: editorHook.editErrors,
    editingTask: editorHook.editingTask,
    editForm: editorHook.editForm,
    isEditSaving: editorHook.isEditSaving,
    setEditForm: editorHook.setEditForm,
    openEditor: editorHook.openEditor,
    closeEditor: editorHook.closeEditor,
    submitEdit: editorHook.submitEdit,
    filterStatus: tasksHook.filterStatus,
    setFilterStatus: tasksHook.setFilterStatus,
    sortBy: tasksHook.sortBy,
    setSortBy: tasksHook.setSortBy,
    filteredTasks: tasksHook.filteredTasks,
    viewMode: tasksHook.viewMode,
    setViewMode: tasksHook.setViewMode,
    handleKanbanDrop: tasksHook.handleKanbanDrop,
    selectedIds: tasksHook.selectedIds,
    selectTask: tasksHook.selectTask,
    selectAll: tasksHook.selectAll,
    clearSelection: tasksHook.clearSelection,
    batchDelete: tasksHook.batchDelete,
    batchSetStatus: tasksHook.batchSetStatus,
  };
}
