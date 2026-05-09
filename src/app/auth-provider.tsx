/**
 * 认证上下文提供者
 * 全局管理用户的登录状态，支持服务端渲染的初始用户数据
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { subscribeToAuthChanges } from "@/api/auth";
import { hasSupabaseConfig } from "@/api/supabase/client";

/** 认证上下文的数据结构 */
type AuthSessionContextValue = {
  isAuthReady: boolean; // 认证状态是否已初始化
  user: User | null;    // 当前登录用户，未登录时为 null
};

// 创建 React Context，默认值为 null（用于检测是否在 Provider 外部使用）
const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser: User | null; // 服务端渲染时获取的初始用户
};

/**
 * 认证状态提供者
 * 监听 Supabase 认证状态变化，向下游组件提供 user 和 isAuthReady
 */
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const configReady = hasSupabaseConfig();
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAuthReady, setIsAuthReady] = useState(true);

  // 订阅 Supabase 认证状态变化
  useEffect(() => {
    if (!configReady) {
      return;
    }

    let isActive = true;

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      if (!isActive) {
        return;
      }

      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [configReady]);

  // 用 useMemo 避免每次渲染都创建新对象，减少下游重渲染
  const value = useMemo(
    () => ({
      isAuthReady,
      user,
    }),
    [isAuthReady, user],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

/**
 * 获取当前认证状态的 Hook
 * 必须在 AuthProvider 内部使用
 * @returns 当前用户的认证信息
 */
export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider.");
  }

  return context;
}
