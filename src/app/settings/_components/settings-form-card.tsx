/**
 * 设置编辑表单
 * 用于修改昵称、头像地址和个人简介
 */

import type { FormEvent } from "react";

type SettingsFormCardProps = {
  form: {
    nickname: string;
    bio: string;
    avatarUrl: string;
  };
  isSaving: boolean; // 是否正在保存
  onChange: (field: "nickname" | "bio" | "avatarUrl", value: string) => void; // 字段变更
  onSubmit: (event: FormEvent<HTMLFormElement>) => void; // 表单提交
};

/**
 * 资料设置表单组件
 */
export function SettingsFormCard({
  form,
  isSaving,
  onChange,
  onSubmit,
}: SettingsFormCardProps) {
  return (
    <form
      className="rounded-[30px] border border-border bg-surface-raised p-6 shadow-[0_26px_80px_-54px_rgba(28,45,36,0.32)] dark:shadow-[0_26px_80px_-54px_rgba(0,0,0,0.5)]"
      onSubmit={onSubmit}
    >
      <div className="mb-6 border-b border-border pb-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-text-muted">
          资料设置
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          基础资料
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          管理公开显示名称、头像地址和简介。
        </p>
      </div>

      <div className="grid gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
          昵称
          <input
            className="rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
            onChange={(event) => onChange("nickname", event.target.value)}
            placeholder="显示名称"
            value={form.nickname}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
          头像地址
          <input
            className="rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
            onChange={(event) => onChange("avatarUrl", event.target.value)}
            placeholder="请输入头像图片地址"
            type="url"
            value={form.avatarUrl}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
          简介
          <textarea
            className="min-h-28 rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
            onChange={(event) => onChange("bio", event.target.value)}
            placeholder="写一点你的角色或职责"
            value={form.bio}
          />
        </label>
        <button
          className="rounded-[18px] bg-accent px-4 py-3.5 font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "保存中..." : "保存设置"}
        </button>
      </div>
    </form>
  );
}
