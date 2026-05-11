/**
 * 任务创建表单
 * 侧边栏中的快速创建任务入口
 */

import type { FormEvent } from "react";
import { motion } from "framer-motion";
import type { TaskFormState } from "@/types/workspace";
import { slideInRightVariants } from "@/lib/animations";

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
    <motion.form
      animate="visible"
      className="rounded-[30px] border border-border bg-surface-raised p-6 shadow-[0_26px_80px_-54px_rgba(28,45,36,0.32)] dark:shadow-[0_26px_80px_-54px_rgba(0,0,0,0.5)]"
      initial="hidden"
      onSubmit={onSubmit}
      variants={slideInRightVariants}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-text-muted">
            快速创建
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
            新增任务
          </h2>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
          标题
          <input
            className="rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
            maxLength={120}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="例如：完成本周复盘"
            required
            value={form.title}
          />
          <span className="self-end text-xs text-text-muted">
            {form.title.length}/120
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
          描述
          <textarea
            className="min-h-24 rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
            maxLength={500}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="可选，最多 500 字"
            value={form.description}
          />
          <span className="self-end text-xs text-text-muted">
            {form.description.length}/500
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-text-primary">
          截止日期
          <input
            className="rounded-[18px] border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent focus:bg-surface-raised"
            min={new Date().toISOString().split("T")[0]}
            onChange={(event) => onChange("dueDate", event.target.value)}
            type="date"
            value={form.dueDate}
          />
        </label>
        <button
          className="rounded-[18px] bg-accent px-4 py-3.5 font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isTaskLoading}
          type="submit"
        >
          {isTaskLoading ? "保存中..." : "保存任务"}
        </button>
      </div>
    </motion.form>
  );
}
