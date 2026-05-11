/**
 * 根布局（Root Layout）
 * 所有页面共享的外层结构，负责：
 * 1. 服务端获取当前用户，避免客户端闪烁
 * 2. 注入 AuthProvider 提供全局认证状态
 */

import type { Metadata } from "next";
import type { User } from "@supabase/supabase-js";
import { AuthProvider } from "@/app/auth-provider";
import { getServerSupabaseClient } from "@/api/supabase/server";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "任务工作台",
  description: "基于 Supabase 的任务管理工作台。",
};

/**
 * 根布局组件
 * 在服务端预取用户数据，通过 props 传给 AuthProvider 作为初始值
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser: User | null = null;

  try {
    // 服务端获取当前登录用户，用于 SSR 时避免闪烁
    const supabase = await getServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    initialUser = user;
  } catch {
    initialUser = null;
  }

  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
