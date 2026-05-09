/**
 * 任务列表面板
 * 展示当前用户的所有任务，支持切换状态、编辑和删除
 */

import type { Task } from "@/types/database";

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
    <div className="rounded-[30px] border border-[#dbe0d4] bg-white/90 p-6 shadow-[0_26px_80px_-54px_rgba(28,45,36,0.32)]">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e4e7df] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7b877c]">
            任务概览
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#17211b]">
            我的任务
          </h2>
          <p className="mt-2 text-sm text-[#677367]">
            {completedCount}/{tasks.length} 已完成
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* 状态筛选 */}
          <div className="flex rounded-full border border-[#d9ddd4] bg-[#f7f5ef] p-1">
            {([
              { key: "all", label: "全部" },
              { key: "active", label: "进行中" },
              { key: "completed", label: "已完成" },
            ] as const).map((item) => (
              <button
                key={item.key}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  filterStatus === item.key
                    ? "bg-[#1b4332] text-white"
                    : "text-[#657064] hover:text-[#1b4332]"
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
            className="rounded-full border border-[#d9ddd4] bg-[#f7f5ef] px-3 py-1.5 text-sm font-medium text-[#344238] outline-none transition focus:border-[#1b4332]"
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
            className="rounded-full border border-[#cfd5cc] px-4 py-2 text-sm font-medium text-[#344238] transition hover:bg-[#f3f5ef]"
            onClick={onRefresh}
            type="button"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 加载中且无数据时 */}
      {isTaskLoading && tasks.length === 0 ? (
        <p className="rounded-[22px] bg-[#f7f7f2] p-4 text-sm text-[#677367]">
          正在读取数据库...
        </p>
      ) : null}

      {/* 空状态 */}
      {!isTaskLoading && tasks.length === 0 ? (
        <p className="rounded-[22px] bg-[#f7f7f2] p-4 text-sm text-[#677367]">
          还没有任务。左侧新增一个，开始安排今天的事项。
        </p>
      ) : null}

      {/* 任务卡片列表 */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <article
            className="rounded-[24px] border border-[#e4e7df] bg-[linear-gradient(180deg,_#fffef9,_#fbfaf5)] p-5 transition hover:border-[#cfd9cf]"
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
                      task.is_done ? "bg-[#6f8d79]" : "bg-[#d8b367]"
                    }`}
                  />
                  <h3
                    className={`text-lg font-medium ${
                      task.is_done ? "text-[#738073] line-through" : "text-[#1f2921]"
                    }`}
                  >
                    {task.title}
                  </h3>
                </div>
                {task.description ? (
                  <p className="mt-3 text-sm leading-6 text-[#586356]">
                    {task.description}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#7c866f]">
                  <span className="rounded-full bg-[#eef2ea] px-3 py-1">
                    {task.is_done ? "已完成" : "进行中"}
                  </span>
                  {task.due_date ? (
                    <span className="rounded-full bg-[#f4eadb] px-3 py-1 text-[#94653a]">
                      截止 {task.due_date}
                    </span>
                  ) : null}
                </div>
              </button>
              <div className="flex flex-col gap-2">
                <button
                  className="rounded-full border border-[#d9ddd4] bg-[#f7f5ef] px-4 py-2 text-sm font-medium text-[#344238] transition hover:bg-white"
                  onClick={() => onEdit(task)}
                  type="button"
                >
                  编辑
                </button>
                <button
                  className="rounded-full border border-[#e0d5d0] px-4 py-2 text-sm font-medium text-[#8a2f25] transition hover:bg-[#fff0ee]"
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
