/**
 * 服务端 Supabase 客户端
 * 用于在 Server Components / Server Actions 中与 Supabase 交互
 * 支持读取和设置认证相关的 cookie
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * 创建服务端 Supabase 客户端
 * 每次调用都新建实例，因为 Server Components 是无状态的
 * @returns 绑定当前请求 cookie 的 Supabase 服务端客户端
 */
export async function getServerSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("缺少 Supabase 环境变量配置。");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      /** 读取当前请求中的所有 cookie */
      getAll() {
        return cookieStore.getAll();
      },
      /** 设置 Supabase 返回的认证 cookie */
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components 渲染期间只读 cookie；写入由 proxy 中间件处理
        }
      },
    },
  });
}
