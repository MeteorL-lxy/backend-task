/**
 * 字段错误提示组件
 * 显示在输入框下方，用于字段级输入验证错误
 */

"use client";

/** 字段错误提示 - 显示在输入框下方 */
export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
  );
}
