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
      className="rounded-[30px] border border-[#dbe0d4] bg-white/90 p-6 shadow-[0_26px_80px_-54px_rgba(28,45,36,0.32)]"
      onSubmit={onSubmit}
    >
      <div className="mb-6 border-b border-[#e4e7df] pb-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7b877c]">
          资料设置
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#17211b]">
          基础资料
        </h2>
        <p className="mt-2 text-sm text-[#677367]">
          管理公开显示名称、头像地址和简介。
        </p>
      </div>

      <div className="grid gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
          昵称
          <input
            className="rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
            onChange={(event) => onChange("nickname", event.target.value)}
            placeholder="显示名称"
            value={form.nickname}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
          头像地址
          <input
            className="rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
            onChange={(event) => onChange("avatarUrl", event.target.value)}
            placeholder="请输入头像图片地址"
            type="url"
            value={form.avatarUrl}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
          简介
          <textarea
            className="min-h-28 rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
            onChange={(event) => onChange("bio", event.target.value)}
            placeholder="写一点你的角色或职责"
            value={form.bio}
          />
        </label>
        <button
          className="rounded-[18px] bg-[#1b4332] px-4 py-3.5 font-medium text-white transition hover:bg-[#163629] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "保存中..." : "保存设置"}
        </button>
      </div>
    </form>
  );
}
