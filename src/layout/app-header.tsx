/**
 * 应用顶部导航栏
 * 包含标题、页面导航和用户信息/登出按钮
 */

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type WorkspaceHeaderProps = {
  displayName: string | null;     // 展示用的用户昵称
  userEmail: string | null;       // 用户邮箱
  isAuthenticated: boolean;       // 是否已登录
  onSignOut: () => void;          // 登出回调
  currentPath?: string;           // 当前页面路径，用于高亮导航
};

/**
 * 顶部导航组件
 * 左侧展示标题和导航链接，右侧根据登录状态展示用户信息或提示
 */
export function WorkspaceHeader({
  displayName,
  isAuthenticated,
  onSignOut,
  currentPath = "/",
}: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface-raised px-6 py-5 shadow-[0_30px_80px_-48px_rgba(40,62,54,0.45)] backdrop-blur dark:bg-surface lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-3">
        <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-muted">
          团队工作台
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          任务工作台
        </h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          <HeaderLink href="/" isActive={currentPath === "/"}>
            工作台
          </HeaderLink>
          <HeaderLink href="/settings" isActive={currentPath === "/settings"}>
            设置
          </HeaderLink>
        </nav>
      </div>
      {isAuthenticated ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="rounded-full border border-border bg-surface px-4 py-2 text-text-secondary">
            {displayName ? `${displayName}` : ""}
          </div>
          <ThemeToggle />
          <button
            className="rounded-full bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover"
            onClick={onSignOut}
            type="button"
          >
            退出登录
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary">
            安全访问
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-accent text-white"
          : "border border-border bg-surface text-text-secondary hover:bg-surface-raised"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}
