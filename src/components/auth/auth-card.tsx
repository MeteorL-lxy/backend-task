/**
 * 认证卡片
 * 未登录状态下展示的登录/注册表单
 */

import type { FormEvent } from "react";
import type { AuthFormState, AuthMode } from "@/types/workspace";

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
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] border border-[#dbe0d4] bg-white/92 p-6 shadow-[0_30px_80px_-48px_rgba(28,45,36,0.28)] backdrop-blur sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7b877c]">
              账号
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#17211b]">
              {authMode === "sign-in" ? "登录" : "注册"}
            </h2>
          </div>
          <div className="rounded-full border border-[#dde2d8] bg-[#f6f7f3] p-1">
            <div className="flex gap-1">
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  authMode === "sign-in"
                    ? "bg-[#17211b] text-white"
                    : "text-[#657064]"
                }`}
                onClick={() => onAuthModeChange("sign-in")}
                type="button"
              >
                登录
              </button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  authMode === "sign-up"
                    ? "bg-[#17211b] text-white"
                    : "text-[#657064]"
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
            <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
              昵称
              <input
                className="rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
                onChange={(event) => onChange("nickname", event.target.value)}
                placeholder="给自己起个名字"
                value={authForm.nickname}
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
            邮箱
            <input
              className="rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="请输入邮箱地址"
              required
              type="email"
              value={authForm.email}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
            密码
            <input
              className="rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
              minLength={6}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="至少 6 位"
              required
              type="password"
              value={authForm.password}
            />
          </label>

          <button
            className="mt-2 rounded-[18px] bg-[#1b4332] px-4 py-3.5 font-medium text-white transition hover:bg-[#163629] disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </section>
  );
}
