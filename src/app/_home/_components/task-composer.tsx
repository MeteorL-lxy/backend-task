/**
 * 任务创建表单
 * 侧边栏中的快速创建任务入口
 */

import type { FormEvent } from "react";
import type { TaskFormState } from "@/types/workspace";

type TaskComposerProps = {
  form: TaskFormState;         // 表单当前值
  isTaskLoading: boolean;      // 提交中状态
  onChange: (field: keyof TaskFormState, value: string) => void; // 字段变更
  onSubmit: (event: FormEvent<HTMLFormElement>) => void; // 表单提交
};

/**
 * 快速创建任务组件
 * 包含标题、描述、截止日期三个字段
 */
export function TaskComposer({
  form,
  isTaskLoading,
  onChange,
  onSubmit,
}: TaskComposerProps) {
  return (
    <form
      className="rounded-[30px] border border-[#dbe0d4] bg-white/90 p-6 shadow-[0_26px_80px_-54px_rgba(28,45,36,0.32)]"
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7b877c]">
            快速创建
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#17211b]">
            新增任务
          </h2>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
          标题
          <input
            className="rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="例如：完成本周复盘"
            required
            value={form.title}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
          描述
          <textarea
            className="min-h-24 rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="可选"
            value={form.description}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
          截止日期
          <input
            className="rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
            onChange={(event) => onChange("dueDate", event.target.value)}
            type="date"
            value={form.dueDate}
          />
        </label>
        <button
          className="rounded-[18px] bg-[#1b4332] px-4 py-3.5 font-medium text-white transition hover:bg-[#163629] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isTaskLoading}
          type="submit"
        >
          {isTaskLoading ? "保存中..." : "保存任务"}
        </button>
      </div>
    </form>
  );
}
