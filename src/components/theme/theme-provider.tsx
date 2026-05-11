/**
 * 主题 Provider
 * 基于 next-themes 管理浅色/深色/系统主题切换
 */

"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * 主题 Provider 包装组件
 * attribute="class" 表示通过 html 元素的 class 控制 dark 模式
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}

