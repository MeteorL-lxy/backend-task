/**
 * 批量操作浮动工具栏
 * 当有任务被选中时，在页面底部固定显示，提供批量删除和状态变更操作
 */

"use client";

interface BatchToolbarProps {
  /** 已选中任务数量 */
  selectedCount: number;
  /** 批量删除回调 */
  onDelete: () => void;
  /** 标记为已完成回调 */
  onMarkDone: () => void;
  /** 标记为待办回调 */
  onMarkTodo: () => void;
  /** 取消选择回调 */
  onClear: () => void;
}

export function BatchToolbar({
  selectedCount,
  onDelete,
  onMarkDone,
  onMarkTodo,
  onClear,
}: BatchToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-surface-raised px-5 py-3 shadow-lg dark:shadow-black/30">
      <span className="text-sm font-medium text-text-secondary">
        已选 {selectedCount} 项
      </span>
      <button
        onClick={onMarkDone}
        className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm transition-colors hover:bg-surface-raised dark:hover:bg-surface-raised"
        type="button"
      >
        标记完成
      </button>
      <button
        onClick={onMarkTodo}
        className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm transition-colors hover:bg-surface-raised dark:hover:bg-surface-raised"
        type="button"
      >
        标记待办
      </button>
      <button
        onClick={onDelete}
        className="rounded-full border border-red-300 bg-surface px-4 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
        type="button"
      >
        删除
      </button>
      <button
        onClick={onClear}
        className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-raised dark:hover:bg-surface-raised"
        type="button"
      >
        取消
      </button>
    </div>
  );
}
