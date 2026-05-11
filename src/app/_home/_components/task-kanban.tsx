/**
 * 看板视图组件
 * 三列布局（待办/进行中/已完成），支持拖拽移动任务
 */

"use client";

import { useState } from "react";
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
    <div
      className="cursor-grab rounded-[18px] border border-[#e4e7df] bg-[linear-gradient(180deg,_#fffef9,_#fbfaf5)] p-4 shadow-sm transition hover:border-[#cfd9cf] active:cursor-grabbing"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-medium ${
              task.status === "done" ? "text-[#738073] line-through" : "text-[#1f2921]"
            }`}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#586356]">
              {task.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#7c866f]">
            <span
              className={`rounded-full px-3 py-1 ${TASK_STATUS_META[task.status].colorClass}`}
            >
              {TASK_STATUS_META[task.status].label}
            </span>
            {task.due_date ? (
              <span className="rounded-full bg-[#f4eadb] px-3 py-1 text-[#94653a]">
                截止 {task.due_date}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            className="rounded-full border border-[#d9ddd4] bg-[#f7f5ef] px-3 py-1.5 text-xs font-medium text-[#344238] transition hover:bg-white"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            type="button"
          >
            编辑
          </button>
          <button
            className="rounded-full border border-[#e0d5d0] px-3 py-1.5 text-xs font-medium text-[#8a2f25] transition hover:bg-[#fff0ee]"
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
    </div>
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
      ? "bg-[#eef2ea] text-[#4a6b50]"
      : status === "in_progress"
        ? "bg-[#e8f0fc] text-[#4a6fa5]"
        : "bg-[#f4eadb] text-[#94653a]";

  return (
    <div
      className={`flex flex-col rounded-[24px] border border-[#e4e7df] bg-[#fafaf6] p-4 transition ${
        isOver ? "border-[#1b4332] ring-1 ring-[#1b4332]/20" : ""
      }`}
      ref={setNodeRef}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${headerColor}`}
        >
          {title}
        </span>
        <span className="text-sm font-medium text-[#7b877c]">
          {columnTasks.length}
        </span>
      </div>
      <div className="flex min-h-[200px] flex-col gap-3">
        <SortableContext
          items={columnTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {columnTasks.map((task) => (
            <KanbanCard
              key={task.id}
              onDelete={onDelete}
              onEdit={onEdit}
              task={task}
            />
          ))}
        </SortableContext>
        {columnTasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-[14px] border border-dashed border-[#d4d9cf] py-6 text-center text-sm text-[#9da899]">
            拖拽任务到此处
          </div>
        ) : null}
      </div>
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

