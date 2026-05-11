/**
 * 主题切换按钮
 * 在浅色 / 深色 / 系统 三种模式之间循环切换
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * 主题切换按钮组件
 * 防止 hydration 不匹配，在挂载前展示占位
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="h-9 w-9 rounded-full border border-border bg-surface"
        type="button"
      />
    );
  }

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const icon =
    theme === "dark" ? (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : theme === "light" ? (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );

  return (
    <button
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:bg-surface-raised hover:text-text-primary dark:bg-surface dark:text-text-secondary dark:hover:bg-surface-raised dark:hover:text-text-primary"
      onClick={cycle}
      title={`当前主题：${theme === "dark" ? "深色" : theme === "light" ? "浅色" : "系统"}`}
      type="button"
    >
      {icon}
    </button>
  );
}

