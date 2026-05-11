/**
 * 状态提示条
 * 根据消息类型展示不同颜色的提示信息
 */

import type { MessageTone } from "@/types/workspace";

type StatusBannerProps = {
  message: string;   // 提示文本
  tone: MessageTone; // 提示类型：neutral / success / error
};

/**
 * 全局消息提示组件
 * 无消息时返回 null 不占用布局空间
 */
export function StatusBanner({ message, tone }: StatusBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <section
      className={`rounded-[22px] border px-5 py-4 text-sm ${
        tone === "error"
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
          : tone === "success"
            ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
            : "border-border bg-surface text-text-secondary"
      }`}
    >
      {message}
    </section>
  );
}
