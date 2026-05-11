/**
 * 各表单的验证规则配置
 * 集中管理认证、任务、设置等表单的字段校验规则
 */

import { validators, type ValidationRule } from "./validation";

/** 登录表单验证规则 */
export const authSignInSchema: Record<string, ValidationRule[]> = {
  email: [validators.required("请输入邮箱"), validators.email()],
  password: [validators.required("请输入密码"), validators.password()],
};

/** 注册表单验证规则 */
export const authSignUpSchema: Record<string, ValidationRule[]> = {
  ...authSignInSchema,
  nickname: [validators.maxLength(30, "昵称最多 30 个字符")],
};

/** 任务创建表单验证规则 */
export const taskFormSchema: Record<string, ValidationRule[]> = {
  title: [validators.required("请输入任务标题"), validators.maxLength(120)],
};

/** 任务编辑表单验证规则 */
export const taskEditSchema: Record<string, ValidationRule[]> = {
  title: [validators.required("请输入任务标题"), validators.maxLength(120)],
};

/** 设置表单验证规则 */
export const settingsFormSchema: Record<string, ValidationRule[]> = {
  nickname: [validators.maxLength(30, "昵称最多 30 个字符")],
  avatarUrl: [validators.url("请输入有效的头像 URL")],
  bio: [validators.maxLength(500, "简介最多 500 个字符")],
};
