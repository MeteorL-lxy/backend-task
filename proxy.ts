/**
 * Next.js Proxy（中间件）入口
 * 所有匹配的请求都会先经过此处刷新 Supabase 会话
 * matcher 排除了静态资源，避免不必要的处理开销
 */

import type { NextRequest } from "next/server";
import { updateSession } from "@/api/supabase/proxy";

/**
 * Proxy 处理函数
 * @param request - Next.js 请求对象
 * @returns 刷新会话后的响应
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

/** Proxy 匹配规则：排除静态文件和图片 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
