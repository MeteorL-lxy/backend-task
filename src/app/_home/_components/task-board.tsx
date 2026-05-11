/**
 * 任务列表面板
 * 展示当前用户的所有任务，支持切换状态、编辑和删除
 */

import type { Task } from "@/types/database";
import { TASK_STATUS_META } from "@/types/workspace";

type TaskBoardProps = {
  tasks: Task[];               // 任务列表
  completedCount: number;      // 已完成任务数
  isTaskLoading: boolean;      // 是否正在加载任务
  onRefresh: () => void;       // 刷新任务列表
  onToggle: (task: Task) => void; // 切换任务完成状态
  onDelete: (taskId: string) => void; // 删除任务
  onEdit: (task: Task) => void; // 打开编辑弹窗
  filterStatus: "all" | "active" | "completed"; // 当前筛选条件
  onFilterChange: (status: "all" | "active" | "completed") => void; // 筛选变更
  sortBy: "createdAtDesc" | "createdAtAsc" | "dueDateAsc" | "dueDateDesc"; // 当前排序
  onSortChange: (sort: "createdAtDesc" | "createdAtAsc" | "dueDateAsc" | "dueDateDesc") => void; // 排序变更
};

/**
 * 任务看板组件
 * 顶部展示统计信息和筛选栏，下方以卡片形式列出所有任务
 */
export function TaskBoard({
  tasks,
  completedCount,
  isTaskLoading,
  onRefresh,
  onToggle,
  onDelete,
  onEdit,
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
}: TaskBoardProps) {
  return (
    <div className="rounded-[30px] border border-border bg-surface-raised p-6 shadow-[0_26px_80px_-54px_rgba(28,45,36,0.32)] dark:shadow-[0_26px_80px_-54px_rgba(0,0,0,0.5)]">
      <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-text-muted">
            任务概览
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
            我的任务
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {completedCount}/{tasks.length} 已完成
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* 状态筛选 */}
          <div className="flex rounded-full border border-border bg-surface p-1">
            {([
              { key: "all", label: "全部" },
              { key: "active", label: "进行中" },
              { key: "completed", label: "已完成" },
            ] as const).map((item) => (
              <button
                key={item.key}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  filterStatus === item.key
                    ? "bg-accent text-white"
                    : "text-text-muted hover:text-accent"
                }`}
                onClick={() => onFilterChange(item.key)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          {/* 排序方式 */}
          <select
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary outline-none transition focus:border-accent"
            onChange={(event) =>
              onSortChange(event.target.value as TaskBoardProps["sortBy"])
            }
            value={sortBy}
          >
            <option value="createdAtDesc">最新创建</option>
            <option value="createdAtAsc">最早创建</option>
            <option value="dueDateAsc">最近截止</option>
            <option value="dueDateDesc">最晚截止</option>
          </select>
          <button
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface"
            onClick={onRefresh}
            type="button"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 加载中且无数据时：骨架屏 */}
      {isTaskLoading && tasks.length === 0 ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="rounded-[24px] border border-border bg-surface p-5"
              key={index}
            >
              <div className="flex items-start gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-border" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-1/3 animate-pulse rounded-full bg-border" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-border" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-full bg-border" />
                    <div className="h-6 w-20 animate-pulse rounded-full bg-border" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* 空状态 */}
      {!isTaskLoading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-surface p-10 text-center">
          <svg
            className="h-12 w-12 text-text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75m3-.75h.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-4 text-base font-medium text-text-secondary">
            还没有任务
          </p>
          <p className="mt-1 text-sm text-text-muted">
            在左侧新建一个，开始安排今天的事项
          </p>
        </div>
      ) : null}

      {/* 任务卡片列表 */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <article
            className="rounded-[24px] border border-border bg-surface-raised p-5 transition hover:border-border"
            key={task.id}
          >
            <div className="flex items-start justify-between gap-4">
              <button
                className="flex-1 text-left"
                onClick={() => onToggle(task)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      TASK_STATUS_META[task.status].dotClass
                    }`}
                  />
                  <h3
                    className={`text-lg font-medium ${
                      task.is_done ? "text-text-muted line-through" : "text-text-primary"
                    }`}
                  >
                    {task.title}
                  </h3>
                </div>
                {task.description ? (
                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {task.description}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                  <span
                    className={`rounded-full px-3 py-1 ${TASK_STATUS_META[task.status].colorClass}`}
                  >
                    {TASK_STATUS_META[task.status].label}
                  </span>
                  {task.due_date ? (
                    <span className="whitespace-nowrap rounded-full px-3 py-1 due-date-tag">
                      截止 {task.due_date}
                    </span>
                  ) : null}
                </div>
              </button>
              <div className="flex flex-col gap-2">
                <button
                  className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-raised"
                  onClick={() => onEdit(task)}
                  type="button"
                >
                  编辑
                </button>
                <button
                  className="rounded-full border border-red-900/10 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-500/10 dark:border-red-400/20 dark:text-red-400"
                  onClick={() => onDelete(task.id)}
                  type="button"
                >
                  删除
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
