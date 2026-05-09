/**
 * 首页（工作台）页面组件
 * 未登录时展示认证卡片，登录后展示任务管理界面
 */

"use client";

import type { FormEvent } from "react";
import { hasSupabaseConfig } from "@/api/supabase/client";
import { ProfilePanel } from "@/app/_home/_components/profile-panel";
import { TaskBoard } from "@/app/_home/_components/task-board";
import { TaskComposer } from "@/app/_home/_components/task-composer";
import { TaskEditor } from "@/app/_home/_components/task-editor";
import { useHomeScreen } from "@/app/_home/use-home-screen";
import { AuthCard } from "@/components/auth/auth-card";
import { ConfigWarning } from "@/components/common/config-warning";
import { StatusBanner } from "@/components/common/status-banner";
import { WorkspaceHeader } from "@/layout/app-header";

// 提前检查 Supabase 配置是否就绪（模块级常量，避免每次渲染都判断）
const configReady = hasSupabaseConfig();

/**
 * 首页主组件
 * 根据用户登录状态渲染不同的界面区域
 */
export function HomeScreen() {
  const workspace = useHomeScreen();

  /** 认证表单提交 */
  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void workspace.submitAuth();
  }

  /** 创建任务表单提交 */
  function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void workspace.submitTask();
  }

  /** 编辑任务表单提交 */
  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void workspace.submitEdit();
  }

  // 认证配置存在但状态尚未恢复：展示加载占位
  if (configReady && !workspace.isAuthReady) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_rgba(247,244,236,0.95)_35%,_rgba(228,238,232,0.85)_72%,_rgba(236,230,218,0.95)_100%)] px-4 py-6 text-[#1d241f] sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center">
          <div className="w-full max-w-md rounded-[32px] border border-[#dbe0d4] bg-white/92 p-6 text-center shadow-[0_30px_80px_-48px_rgba(28,45,36,0.28)] backdrop-blur sm:p-7">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7b877c]">
              账号
            </p>
            <p className="mt-4 text-base text-[#4d584d]">正在恢复登录状态...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_rgba(247,244,236,0.95)_35%,_rgba(228,238,232,0.85)_72%,_rgba(236,230,218,0.95)_100%)] px-4 py-6 text-[#1d241f] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* 顶部导航栏 */}
        <WorkspaceHeader
          currentPath="/"
          displayName={workspace.displayName}
          isAuthenticated={Boolean(workspace.user)}
          onSignOut={() => void workspace.logout()}
          userEmail={workspace.user?.email ?? null}
        />

        {/* 缺少环境变量时的警告提示 */}
        {!configReady ? <ConfigWarning /> : null}

        {/* 全局消息提示条 */}
        <StatusBanner message={workspace.message} tone={workspace.messageTone} />

        {/* 未登录：展示认证卡片 */}
        {!workspace.user ? (
          <AuthCard
            authForm={workspace.authForm}
            authMode={workspace.authMode}
            configReady={configReady}
            isAuthLoading={workspace.isAuthLoading}
            onAuthModeChange={workspace.setAuthMode}
            onChange={(field, value) =>
              workspace.setAuthForm((current) => ({ ...current, [field]: value }))
            }
            onSubmit={handleAuthSubmit}
          />
        ) : (
          // 已登录：左侧边栏 + 右侧任务面板
          <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
            <aside className="grid gap-6">
              <ProfilePanel
                displayName={workspace.displayName}
                isProfileLoading={workspace.isProfileLoading}
                taskCount={workspace.tasks.length}
                taskProgress={workspace.taskProgress}
                userEmail={workspace.user.email ?? null}
              />
              <TaskComposer
                form={workspace.taskForm}
                isTaskLoading={workspace.isTaskLoading}
                onChange={(field, value) =>
                  workspace.setTaskForm((current) => ({ ...current, [field]: value }))
                }
                onSubmit={handleTaskSubmit}
              />
            </aside>

            <TaskBoard
              completedCount={workspace.completedCount}
              isTaskLoading={workspace.isTaskLoading}
              onDelete={(taskId) => void workspace.deleteTask(taskId)}
              onEdit={(task) => workspace.openEditor(task)}
              onRefresh={() => void workspace.reloadTasks()}
              onToggle={(task) => void workspace.toggleTask(task)}
              tasks={workspace.tasks}
            />

            {/* 任务编辑弹窗 */}
            {workspace.editingTask ? (
              <TaskEditor
                form={workspace.editForm}
                isOpen={Boolean(workspace.editingTask)}
                isSaving={workspace.isEditSaving}
                onChange={(field, value) =>
                  workspace.setEditForm((current) => ({ ...current, [field]: value }))
                }
                onClose={workspace.closeEditor}
                onSubmit={handleEditSubmit}
                task={workspace.editingTask}
              />
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
