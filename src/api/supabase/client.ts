/**
 * 浏览器端 Supabase 客户端（单例模式）
 * 用于在 Client Components 中与 Supabase 交互
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// 从环境变量读取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 单例客户端实例，避免重复创建
let client: SupabaseClient<Database> | null = null;

/**
 * 检查 Supabase 环境变量是否已配置
 * @returns true 表示 URL 和密钥都已设置
 */
export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

/**
 * 获取浏览器端 Supabase 客户端实例（单例）
 * 首次调用时创建，后续调用返回同一实例
 * @returns 带类型约束的 Supabase 客户端
 */
export function getSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("缺少 Supabase 环境变量配置。");
  }

  if (!client) {
    client = createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
  }

  return client;
}
