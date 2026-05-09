/**
 * 认证相关 API 封装
 * 提供登录、注册、登出及认证状态监听能力
 */

import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/api/supabase/client";

/**
 * 订阅 Supabase 认证状态变化
 * @param onChange - 认证状态变化时的回调函数，传入当前用户或 null
 * @returns 取消订阅的清理函数
 */
export function subscribeToAuthChanges(
  onChange: (user: User | null) => void,
) {
  const supabase = getSupabaseClient();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session?.user ?? null);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

/**
 * 使用邮箱和密码登录
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns Supabase 登录响应
 */
export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * 注册新账号
 * @param email - 用户邮箱
 * @param password - 登录密码（至少 6 位）
 * @param nickname - 用户昵称，未填写时默认使用邮箱前缀
 * @returns Supabase 注册响应
 */
export async function signUp(
  email: string,
  password: string,
  nickname: string,
) {
  const supabase = getSupabaseClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname: nickname || email.split("@")[0] || "新用户",
      },
    },
  });
}

/**
 * 退出当前登录账号
 * @returns Supabase 登出响应
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  return supabase.auth.signOut();
}

/**
 * 更新当前用户的认证元数据（昵称）
 * @param input - 包含 nickname 的对象
 * @returns Supabase 更新响应
 */
export async function updateAuthProfile(input: { nickname: string | null }) {
  const supabase = getSupabaseClient();
  return supabase.auth.updateUser({
    data: {
      nickname: input.nickname,
    },
  });
}
