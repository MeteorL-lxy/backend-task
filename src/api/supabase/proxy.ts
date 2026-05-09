/**
 * Next.js Proxy（中间件）
 * 每个请求都会经过此处，用于刷新 Supabase 认证会话
 * 确保浏览器 cookie 中的 access_token / refresh_token 保持最新
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * 刷新当前请求的 Supabase 会话
 * 通过调用 supabase.auth.getUser() 触发令牌自动刷新机制
 * @param request - Next.js 请求对象
 * @returns 包含更新后 cookie 的响应对象
 */
export async function updateSession(request: NextRequest) {
  if (!supabaseUrl || !supabasePublishableKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        /** 读取请求中的 cookie */
        getAll() {
          return request.cookies.getAll();
        },
        /** 将 Supabase 设置的新 cookie 同步到响应中 */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 触发会话刷新：Supabase 会自动检查令牌是否过期并进行刷新
  await supabase.auth.getUser();

  return response;
}
