/**
 * 看板视图组件
 * 三列布局（待办/进行中/已完成），支持拖拽移动任务
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/database";
import { TASK_STATUS_META } from "@/types/workspace";
import { kanbanCardVariants, kanbanColumnVariants } from "@/lib/animations";

type TaskKanbanProps = {
  tasks: Task[];               // 任务列表
  onDrop: (taskId: string, newStatus: Task["status"]) => void; // 拖拽后更新状态
  onEdit: (task: Task) => void; // 打开编辑弹窗
  onDelete: (taskId: string) => void; // 删除任务
};

/**
 * 单条可拖拽任务卡片
 */
function KanbanCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "card", status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      className="cursor-grab rounded-[18px] border border-border bg-surface-raised p-4 shadow-sm transition hover:border-border active:cursor-grabbing"
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      ref={setNodeRef}
      style={style}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-medium ${
              task.status === "done" ? "text-text-muted line-through" : "text-text-primary"
            }`}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
              {task.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
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
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-raised"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            type="button"
          >
            编辑
          </button>
          <button
            className="rounded-full border border-red-900/10 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-500/10 dark:border-red-400/20 dark:text-red-400"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task.id);
            }}
            type="button"
          >
            删除
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 单列看板（可放置区域）
 */
function KanbanColumn({
  status,
  title,
  tasks,
  onEdit,
  onDelete,
}: {
  status: Task["status"];
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column" },
  });

  const columnTasks = tasks.filter((t) => t.status === status);

  // 列头颜色
  const headerColor =
    status === "done"
      ? "column-header-done"
      : status === "in_progress"
        ? "column-header-in-progress"
        : "column-header-todo";

  return (
    <div
      className={`flex flex-col rounded-[24px] border border-border bg-surface p-4 transition ${
        isOver ? "border-accent ring-1 ring-accent/20" : ""
      }`}
      ref={setNodeRef}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${headerColor}`}
        >
          {title}
        </span>
        <span className="text-sm font-medium text-text-muted">
          {columnTasks.length}
        </span>
      </div>
      <motion.div
        animate="visible"
        className="flex min-h-[200px] flex-col gap-3"
        initial="hidden"
        variants={kanbanColumnVariants}
      >
        <SortableContext
          items={columnTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {columnTasks.map((task) => (
            <motion.div key={task.id} variants={kanbanCardVariants}>
              <KanbanCard
                onDelete={onDelete}
                onEdit={onEdit}
                task={task}
              />
            </motion.div>
          ))}
        </SortableContext>
        {columnTasks.length === 0 ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-1 items-center justify-center rounded-[14px] border border-dashed border-border py-6 text-center text-sm text-text-muted"
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            拖拽任务到此处
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}

/**
 * 看板视图主组件
 * 包含 DndContext 和三个状态列
 */
export function TaskKanban({ tasks, onDrop, onEdit, onDelete }: TaskKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // 使用指针传感器，避免与滚动/点击冲突
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;

    // 判断放置目标是列还是卡片，正确获取目标状态
    const overData = over.data.current as
      | { type: string; status?: Task["status"] }
      | undefined;
    let newStatus: Task["status"];
    if (overData?.type === "column") {
      newStatus = over.id as Task["status"];
    } else if (overData?.type === "card" && overData.status) {
      newStatus = overData.status;
    } else {
      return;
    }

    // 找到当前任务，状态无变化则不处理
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    onDrop(taskId, newStatus);
  };

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        <KanbanColumn
          onDelete={onDelete}
          onEdit={onEdit}
          status="todo"
          tasks={tasks}
          title="待办"
        />
        <KanbanColumn
          onDelete={onDelete}
          onEdit={onEdit}
          status="in_progress"
          tasks={tasks}
          title="进行中"
        />
        <KanbanColumn
          onDelete={onDelete}
          onEdit={onEdit}
          status="done"
          tasks={tasks}
          title="已完成"
        />
      </div>
    </DndContext>
  );
}

