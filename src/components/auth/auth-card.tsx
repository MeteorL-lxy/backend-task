/**
 * 认证卡片
 * 未登录状态下展示的登录/注册表单
 */

import type { FormEvent } from "react";
import { motion } from "framer-motion";
import type { AuthFormState, AuthMode } from "@/types/workspace";
import { modalVariants, overlayVariants } from "@/lib/animations";

type AuthCardProps = {
  authForm: AuthFormState;      // 表单当前值
  authMode: AuthMode;           // 当前模式：登录 或 注册
  isAuthLoading: boolean;       // 提交中状态
  onAuthModeChange: (mode: AuthMode) => void; // 切换登录/注册模式
  onChange: (field: keyof AuthFormState, value: string) => void; // 字段变更
  onSubmit: (event: FormEvent<HTMLFormElement>) => void; // 表单提交
  configReady: boolean;         // Supabase 配置是否就绪
};

/**
 * 登录/注册卡片组件
 * 支持在登录和注册两种模式之间切换
 */
export function AuthCard({
  authForm,
  authMode,
  isAuthLoading,
  onAuthModeChange,
  onChange,
  onSubmit,
  configReady,
}: AuthCardProps) {
  return (
    <motion.section
      animate="visible"
      className="flex min-h-[70vh] items-center justify-center"
      initial="hidden"
      variants={overlayVariants}
    >
      <motion.div
        animate="visible"
        className="w-full max-w-md rounded-[32px] border border-border bg-surface-raised p-6 shadow-[0_30px_80px_-48px_rgba(28,45,36,0.28)] backdrop-blur dark:shadow-[0_30px_80px_-48px_rgba(0,0,0,0.5)] sm:p-7"
        initial="hidden"
        variants={modalVariants}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-text-muted">
              账号
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
              {authMode === "sign-in" ? "登录" : "注册"}
            </h2>
          </div>
          <div className="rounded-full border border-border bg-surface p-1">
            <div className="flex gap-1">
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  authMode === "sign-in"
                    ? "bg-text-primary text-white"
                    : "text-text-muted"
                }`}
                onClick={() => onAuthModeChange("sign-in")}
                type="button"
              >
                登录
              </button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  authMode === "sign-up"
                    ? "bg-text-primary text-white"
                    : "text-text-muted"
                }`}
                onClick={() => onAuthModeChange("sign-up")}
                type="button"
              >
                注册
              </button>
            </div>
          </div>
        </div>

        <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit}>
          {authMode === "sign-up" ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
              昵称
              <input
                className="rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
                maxLength={30}
                onChange={(event) => onChange("nickname", event.target.value)}
                placeholder="给自己起个名字"
                value={authForm.nickname}
              />
              <span className="self-end text-xs text-text-muted">
                {authForm.nickname.length}/30
              </span>
            </label>
          ) : null}

          <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
            邮箱
            <input
              className="rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="请输入邮箱地址"
              required
              type="email"
              value={authForm.email}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
            密码
            <input
              className="rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
              minLength={6}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="至少 6 位"
              required
              type="password"
              value={authForm.password}
            />
          </label>

          <button
            className="mt-2 rounded-[18px] bg-accent px-4 py-3.5 font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isAuthLoading || !configReady}
            type="submit"
          >
            {isAuthLoading
              ? "处理中..."
              : authMode === "sign-in"
                ? "登录"
                : "创建账号"}
          </button>
        </form>
      </motion.div>
    </motion.section>
  );
}
