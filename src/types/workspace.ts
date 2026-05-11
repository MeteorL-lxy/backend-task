/**
 * 业务层通用类型定义
 * 与 UI 表单、状态管理相关的类型
 */

/** 认证模式：登录 或 注册 */
export type AuthMode = "sign-in" | "sign-up";

/** 消息提示类型：中性 / 成功 / 错误 */
export type MessageTone = "neutral" | "success" | "error";

/** 认证表单的状态结构 */
export type AuthFormState = {
  email: string;
  password: string;
  nickname: string;
};

/** 任务创建表单的状态结构 */
export type TaskFormState = {
  title: string;
  description: string;
  dueDate: string;
};

/** 任务状态的元数据映射（标签、颜色、圆点样式） */
export const TASK_STATUS_META = {
  todo: {
    label: "待办",
    colorClass: "bg-[#f4eadb] text-[#94653a]",
    dotClass: "bg-[#d8b367]",
  },
  in_progress: {
    label: "进行中",
    colorClass: "bg-[#e8f0fc] text-[#4a6fa5]",
    dotClass: "bg-[#4a6fa5]",
  },
  done: {
    label: "已完成",
    colorClass: "bg-[#eef2ea] text-[#4a6b50]",
    dotClass: "bg-[#6f8d79]",
  },
} as const;
