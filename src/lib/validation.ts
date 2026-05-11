/**
 * 统一表单验证工具库
 * 提供字段级验证规则、表单级批量校验与错误映射
 */

/** 验证规则定义 */
export type ValidationRule = {
  /** 校验函数，返回 true 表示通过 */
  validate: (value: string) => boolean;
  /** 校验失败时的错误提示 */
  message: string;
};

/** 字段错误映射（key 为字段名，value 为错误信息） */
export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

/** 内置验证器集合 */
export const validators = {
  /** 必填校验 */
  required: (msg?: string): ValidationRule => ({
    validate: (v) => v.trim().length > 0,
    message: msg || "此字段为必填项",
  }),
  /** 最大长度校验 */
  maxLength: (max: number, msg?: string): ValidationRule => ({
    validate: (v) => v.length <= max,
    message: msg || `最多 ${max} 个字符`,
  }),
  /** 最小长度校验 */
  minLength: (min: number, msg?: string): ValidationRule => ({
    validate: (v) => v.length >= min,
    message: msg || `至少 ${min} 个字符`,
  }),
  /** 邮箱格式校验 */
  email: (msg?: string): ValidationRule => ({
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: msg || "请输入有效的邮箱地址",
  }),
  /** URL 格式校验（空值跳过） */
  url: (msg?: string): ValidationRule => ({
    validate: (v) => !v || /^https?:\/\/.+\..+/.test(v),
    message: msg || "请输入有效的 URL",
  }),
  /** 密码强度校验（至少 6 位，非纯空格） */
  password: (msg?: string): ValidationRule => ({
    validate: (v) => v.length >= 6 && !/^\s+$/.test(v),
    message: msg || "密码至少 6 位，且不能为纯空格",
  }),
};

/**
 * 验证单个字段
 * 按规则顺序依次校验，首个失败即返回错误信息
 * @param value - 字段当前值
 * @param rules - 该字段的验证规则数组
 * @returns 错误信息字符串，通过则返回 null
 */
export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (!rule.validate(value)) return rule.message;
  }
  return null;
}

/**
 * 验证表单所有字段
 * @param values - 表单值对象
 * @param schema - 各字段的验证规则映射
 * @returns 字段错误映射，仅包含校验失败的字段
 */
export function validateForm<T extends Record<string, string>>(
  values: T,
  schema: Partial<Record<keyof T, ValidationRule[]>>
): FieldErrors<Extract<keyof T, string>> {
  const errors: FieldErrors<Extract<keyof T, string>> = {};
  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(values[field] || "", rules as ValidationRule[]);
    if (error) errors[field as Extract<keyof T, string>] = error;
  }
  return errors;
}

/**
 * 判断是否存在校验错误
 * @param errors - 字段错误映射
 * @returns 任意字段存在错误时返回 true
 */
export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
