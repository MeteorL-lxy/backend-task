/**
 * 状态消息管理子 Hook
 * 封装 message + messageTone 状态，提供快捷操作方法
 * 供聚合 Hook 与其他子 Hook 共享消息提示能力
 */

"use client";

import { useState } from "react";
import type { MessageTone } from "@/types/workspace";

/** useStatusMessage 返回值的接口类型 */
export type StatusMessageHandle = {
  /** 当前消息文本 */
  message: string;
  /** 当前消息类型 */
  messageTone: MessageTone;
  /** 显示成功消息 */
  showSuccess: (msg: string) => void;
  /** 显示错误消息 */
  showError: (msg: string) => void;
  /** 显示中性消息（如退出登录提示） */
  showNeutral: (msg: string) => void;
  /** 清空消息 */
  clear: () => void;
};

/**
 * 状态消息管理 Hook
 * 统一管理消息文本和类型的显示与清空
 * @returns 消息状态与操作方法
 */
export function useStatusMessage(): StatusMessageHandle {
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<MessageTone>("neutral");

  /** 显示成功消息 */
  function showSuccess(msg: string) {
    setMessage(msg);
    setMessageTone("success");
  }

  /** 显示错误消息 */
  function showError(msg: string) {
    setMessage(msg);
    setMessageTone("error");
  }

  /** 显示中性消息（如退出登录提示） */
  function showNeutral(msg: string) {
    setMessage(msg);
    setMessageTone("neutral");
  }

  /** 清空消息 */
  function clear() {
    setMessage("");
  }

  return { message, messageTone, showSuccess, showError, showNeutral, clear };
}
