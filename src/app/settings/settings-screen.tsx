/**
 * 设置页页面组件
 * 未登录时展示认证卡片，登录后展示个人资料编辑界面
 */

"use client";

import type { FormEvent } from "react";
import { hasSupabaseConfig } from "@/api/supabase/client";
import { AuthCard } from "@/components/auth/auth-card";
import { CommandPanel } from "@/components/common/command-panel";
import { ConfigWarning } from "@/components/common/config-warning";
import { StatusBanner } from "@/components/common/status-banner";
import { WorkspaceHeader } from "@/layout/app-header";
import { SettingsFormCard } from "@/app/settings/_components/settings-form-card";
import { SettingsSummaryCard } from "@/app/settings/_components/settings-summary-card";
import { useSettingsScreen } from "@/app/settings/use-settings-screen";

const configReady = hasSupabaseConfig();

/**
 * 设置页主组件
 */
export function SettingsScreen() {
  const settings = useSettingsScreen();

  /** 认证表单提交 */
  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void settings.submitAuth();
  }

  /** 设置表单提交 */
  function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void settings.saveSettings();
  }

  if (configReady && !settings.isAuthReady) {
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
        <WorkspaceHeader
          currentPath="/settings"
          displayName={settings.displayName}
          isAuthenticated={Boolean(settings.user)}
          onSignOut={() => void settings.logout()}
          userEmail={settings.user?.email ?? null}
        />

        {!configReady ? <ConfigWarning /> : null}

        <StatusBanner message={settings.message} tone={settings.messageTone} />

        {/* 全局命令面板（Cmd+K） */}
        <CommandPanel />

        {/* 未登录：展示认证卡片 */}
        {!settings.user ? (
          <AuthCard
            authForm={settings.authForm}
            authMode={settings.authMode}
            configReady={configReady}
            isAuthLoading={settings.isAuthLoading}
            onAuthModeChange={settings.setAuthMode}
            onChange={(field, value) =>
              settings.setAuthForm((current) => ({ ...current, [field]: value }))
            }
            onSubmit={handleAuthSubmit}
          />
        ) : (
          // 已登录：左侧资料预览 + 右侧编辑表单
          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <SettingsSummaryCard
              avatarUrl={settings.profile?.avatar_url ?? null}
              bio={settings.profile?.bio ?? null}
              displayName={settings.displayName}
              isProfileLoading={settings.isProfileLoading}
              userEmail={settings.user.email ?? null}
            />
            <SettingsFormCard
              form={settings.settingsForm}
              isSaving={settings.isSaving}
              onChange={(field, value) =>
                settings.setSettingsForm((current) => ({
                  ...current,
                  [field]: value,
                }))
              }
              onSubmit={handleSettingsSubmit}
            />
          </section>
        )}
      </div>
    </main>
  );
}
