/**
 * 全局命令面板（Cmd+K）
 * 支持搜索任务、切换视图、页面导航
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/types/database";
import { TASK_STATUS_META } from "@/types/workspace";

type CommandPanelProps = {
  tasks?: Task[];                                // 当前用户的任务列表（可选，未传则不显示搜索）
  viewMode?: "list" | "kanban";                  // 当前视图模式（可选）
  onViewModeChange?: (mode: "list" | "kanban") => void; // 切换视图（可选）
  onEditTask?: (task: Task) => void;             // 打开任务编辑（可选）
};

/**
 * 命令面板组件
 * 快捷键：Cmd/Ctrl + K 打开，Escape 关闭
 */
export function CommandPanel({
  tasks = [],
  viewMode = "list",
  onViewModeChange,
  onEditTask,
}: CommandPanelProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 监听全局快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K 打开/关闭面板
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Cmd/Ctrl + , 直接跳转到设置页
      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        router.push("/settings");
      }
      // Escape 关闭面板
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // 打开时聚焦搜索框
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // 搜索结果
  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    // 匹配任务标题和描述
    const matchedTasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(trimmed) ||
        (t.description ?? "").toLowerCase().includes(trimmed),
    );

    return matchedTasks.map((task) => ({
      type: "task" as const,
      id: task.id,
      title: task.title,
      subtitle: TASK_STATUS_META[task.status].label,
      task,
    }));
  }, [query, tasks]);

  // 固定命令列表
  const commands = useMemo(() => {
    const list: Array<{
      type: "command";
      id: string;
      title: string;
      subtitle: string;
      icon: string;
      action: () => void;
    }> = [];

    // 视图切换（仅在传入回调时显示）
    if (onViewModeChange) {
      if (viewMode !== "list") {
        list.push({
          type: "command",
          id: "switch-list",
          title: "切换到列表视图",
          subtitle: "当前：看板",
          icon: "📋",
          action: () => {
            onViewModeChange("list");
            setIsOpen(false);
          },
        });
      }
      if (viewMode !== "kanban") {
        list.push({
          type: "command",
          id: "switch-kanban",
          title: "切换到看板视图",
          subtitle: "当前：列表",
          icon: "🗂️",
          action: () => {
            onViewModeChange("kanban");
            setIsOpen(false);
          },
        });
      }
    }

    // 页面导航
    list.push(
      {
        type: "command",
        id: "nav-home",
        title: "前往首页",
        subtitle: "工作台",
        icon: "🏠",
        action: () => {
          router.push("/");
          setIsOpen(false);
        },
      },
      {
        type: "command",
        id: "nav-settings",
        title: "前往设置",
        subtitle: "个人档案",
        icon: "⚙️",
        action: () => {
          router.push("/settings");
          setIsOpen(false);
        },
      },
    );

    return list;
  }, [viewMode, onViewModeChange, router]);

  // 合并结果：有搜索词时优先显示任务结果，否则显示命令
  const allItems = query.trim() ? results : commands;

  /**
   * 执行当前选中的项（Enter 时调用）
   */
  const executeSelectedItem = () => {
    const item = allItems[selectedIndex];
    if (!item) return;
    if ("action" in item) {
      item.action();
    } else if ("task" in item && onEditTask) {
      onEditTask(item.task);
      setIsOpen(false);
    }
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % allItems.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
          break;
        case "Enter":
          event.preventDefault();
          executeSelectedItem();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allItems, selectedIndex, executeSelectedItem]);

  // 结果变化时重置选中位置
  useEffect(() => {
    setSelectedIndex(0);
  }, [allItems.length]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-[#0f1a14]/40 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="presentation"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[24px] border border-[#dbe0d4] bg-white/95 shadow-[0_30px_80px_-48px_rgba(28,45,36,0.32)] backdrop-blur"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 搜索框 */}
        <div className="flex items-center gap-3 border-b border-[#e4e7df] px-5 py-4">
          <svg
            className="h-5 w-5 text-[#9da899]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            className="flex-1 bg-transparent text-base text-[#1f2921] outline-none placeholder:text-[#9da899]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索任务或执行命令..."
            ref={inputRef}
            type="text"
            value={query}
          />
          <kbd className="rounded-md border border-[#d4d9cf] bg-[#f7f5ef] px-2 py-1 text-xs font-medium text-[#7b877c]">
            ESC
          </kbd>
        </div>

        {/* 结果列表 */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#9da899]">
              {query.trim() ? "未找到匹配的任务" : "输入关键词搜索任务"}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {/* 分组标题 */}
              {query.trim() ? (
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9da899]">
                  任务 ({results.length})
                </div>
              ) : (
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9da899]">
                  快捷命令
                </div>
              )}

              {allItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const isCommand = "action" in item;

                return (
                  <button
                    className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-[#1b4332] text-white"
                        : "text-[#1f2921] hover:bg-[#f3f5ef]"
                    }`}
                    key={item.id}
                    onClick={() => {
                      if (isCommand) {
                        (item as typeof commands[0]).action();
                      } else if (onEditTask) {
                        onEditTask((item as typeof results[0]).task);
                        setIsOpen(false);
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    type="button"
                  >
                    {isCommand ? (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f3f5ef] text-lg">
                        {(item as typeof commands[0]).icon}
                      </span>
                    ) : (
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          (item as typeof results[0]).task.status === "done"
                            ? "bg-[#6f8d79]"
                            : (item as typeof results[0]).task.status === "in_progress"
                              ? "bg-[#4a6fa5]"
                              : "bg-[#d8b367]"
                        }`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p
                        className={`truncate text-xs ${
                          isSelected ? "text-white/70" : "text-[#7b877c]"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                    {isCommand ? (
                      <span
                        className={`shrink-0 text-xs ${
                          isSelected ? "text-white/60" : "text-[#9da899]"
                        }`}
                      >
                        命令
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="flex items-center gap-4 border-t border-[#e4e7df] px-5 py-2.5 text-xs text-[#9da899]">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[#d4d9cf] bg-[#f7f5ef] px-1.5 py-0.5 font-medium">
              ↵
            </kbd>
            执行
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[#d4d9cf] bg-[#f7f5ef] px-1.5 py-0.5 font-medium">
              ↑↓
            </kbd>
            选择
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[#d4d9cf] bg-[#f7f5ef] px-1.5 py-0.5 font-medium">
              esc
            </kbd>
            关闭
          </span>
        </div>
      </div>
    </div>
  );
}

