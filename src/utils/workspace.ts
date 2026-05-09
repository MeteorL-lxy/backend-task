/**
 * 通用工具函数
 * 与用户数据解析、错误处理相关的辅助方法
 */

import type { User } from "@supabase/supabase-js";

/**
 * 从 Supabase 用户的元数据中提取昵称
 * @param user - Supabase 用户对象，可能为 null
 * @returns 有效的昵称字符串，或 null
 */
export function readNicknameFromUser(user: User | null) {
  const metadata = user?.user_metadata;
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const nickname = metadata.nickname;
  return typeof nickname === "string" && nickname.trim() ? nickname : null;
}

/**
 * 安全地提取错误消息
 * @param error - 未知的错误对象
 * @param fallback - 无法提取时的默认文案
 * @returns 用户友好的错误提示
 */
export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
