/**
 * 任务编辑弹窗
 * 模态框形式编辑已有任务的标题、描述和截止日期
 */

"use client";

import type { FormEvent } from "react";
import type { Task } from "@/types/database";

/** 编辑表单的数据结构 */
export type TaskEditorForm = {
  title: string;
  description: string;
  dueDate: string;
};

type TaskEditorProps = {
  task: Task;                  // 当前正在编辑的任务
  form: TaskEditorForm;        // 表单值
  isOpen: boolean;             // 是否显示弹窗
  isSaving: boolean;           // 是否正在保存
  onChange: (field: keyof TaskEditorForm, value: string) => void; // 字段变更
  onSubmit: (event: FormEvent<HTMLFormElement>) => void; // 提交保存
  onClose: () => void;         // 关闭弹窗
};

/**
 * 任务编辑弹窗组件
 * 点击遮罩层或取消按钮可关闭
 */
export function TaskEditor({
  task,
  form,
  isOpen,
  isSaving,
  onChange,
  onSubmit,
  onClose,
}: TaskEditorProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1a14]/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-[30px] border border-[#dbe0d4] bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(28,45,36,0.32)] backdrop-blur sm:p-7"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7b877c]">
              编辑任务
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#17211b]">
              修改内容
            </h2>
          </div>
          <button
            className="rounded-full p-2 text-[#7b877c] transition hover:bg-[#f3f5ef]"
            onClick={onClose}
            type="button"
            aria-label="关闭"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-[#2c342d]">
            标题
            <input
              className="rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3 outline-none transition focus:border-[#1b4332] focus:bg-white"
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="任务标题"
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

          <div className="mt-2 flex gap-3">
            <button
              className="flex-1 rounded-[18px] border border-[#ced4c8] bg-[#fbfbf8] px-4 py-3.5 font-medium text-[#2c342d] transition hover:bg-[#eef2ea]"
              onClick={onClose}
              type="button"
            >
              取消
            </button>
            <button
              className="flex-1 rounded-[18px] bg-[#1b4332] px-4 py-3.5 font-medium text-white transition hover:bg-[#163629] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving || !form.title.trim()}
              type="submit"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
