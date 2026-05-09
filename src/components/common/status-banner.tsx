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
          ? "border-[#d9b0aa] bg-[#fff1ef] text-[#7a3027]"
          : tone === "success"
            ? "border-[#b8d1c4] bg-[#eff8f2] text-[#215441]"
            : "border-[#d8ded2] bg-white/85 text-[#556154]"
      }`}
    >
      {message}
    </section>
  );
}
