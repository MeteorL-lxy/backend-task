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
