/**
 * [INPUT]: 周日期, 日历任务数据, 拖放回调, 点击添加回调
 * [OUTPUT]: 周日历组件 - Google Calendar 风格纵向时间轴
 * [POS]: 首页核心组件，展示和编辑一周的任务安排
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/components/.folder.md 的描述是否仍然准确。
 */

'use client';

import { useState, useCallback } from 'react';
import type { CalendarTask, GoalCategory, TaskDefinition } from '@/types/goals';
import { GOALS } from '@/core/goals';

interface WeekCalendarProps {
  weekDates: Date[];
  tasks: CalendarTask[];
  onTaskAdd: (task: Omit<CalendarTask, 'id'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<CalendarTask>) => void;
  onTaskRemove: (taskId: string) => void;
  // Mobile click-to-add mode
  selectedTask?: TaskDefinition | null;
  onCellClick?: (dayIndex: number, hour: number) => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00 (reduced to show more per screen)
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeekCalendar({
  weekDates,
  tasks,
  onTaskAdd,
  onTaskUpdate,
  onTaskRemove,
  selectedTask,
  onCellClick,
}: WeekCalendarProps) {
  const [dragOverCell, setDragOverCell] = useState<{ day: number; hour: number } | null>(null);
  const hasSelectedTask = selectedTask !== null && selectedTask !== undefined;

  const handleDragOver = useCallback((e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    setDragOverCell({ day: dayIndex, hour });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverCell(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    setDragOverCell(null);

    const taskData = e.dataTransfer.getData('application/json');
    if (taskData) {
      const { taskId, category, name, duration } = JSON.parse(taskData);
      onTaskAdd({
        taskId,
        category,
        name,
        dayIndex,
        startHour: hour,
        duration,
      });
    }
  }, [onTaskAdd]);

  const getTasksForCell = (dayIndex: number, hour: number) => {
    return tasks.filter(
      (task) =>
        task.dayIndex === dayIndex &&
        task.startHour <= hour &&
        task.startHour + task.duration > hour
    );
  };

  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };

  // Handle cell click for mobile click-to-add mode
  const handleCellClick = useCallback((dayIndex: number, hour: number) => {
    if (onCellClick) {
      onCellClick(dayIndex, hour);
    }
  }, [onCellClick]);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded overflow-hidden flex flex-col md:h-full">
      {/* Art strip at top */}
      <div className="art-strip flex-shrink-0" />

      {/* Mobile: show full calendar, Desktop: scrollable within container */}
      <div className="md:flex-1 md:overflow-auto overflow-x-auto">
        <div className="min-w-[500px] md:min-w-0">
          {/* Header Row */}
          <div className="grid grid-cols-[40px_repeat(7,minmax(60px,1fr))] md:grid-cols-[50px_repeat(7,1fr)] border-b border-[var(--color-border)] flex-shrink-0 sticky top-0 z-20 bg-white">
            <div className="p-1 md:p-2 bg-[var(--color-bg-secondary)]" />
            {weekDates.map((date, index) => (
              <div
                key={index}
                className="p-1 md:p-2 text-center bg-[var(--color-bg-secondary)] border-l border-[var(--color-border-subtle)]"
              >
                <div className="text-[10px] md:text-xs text-[var(--color-text-muted)] tracking-wider">
                  {DAY_NAMES[index]}
                </div>
                <div className="text-xs md:text-sm font-medium mt-0.5">
                  {formatDate(date)}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[40px_repeat(7,minmax(60px,1fr))] md:grid-cols-[50px_repeat(7,1fr)]"
            >
              {/* Time Label */}
              <div className="calendar-time border-b border-[var(--color-border-subtle)] h-12 md:h-12 text-[10px] md:text-xs">
                {hour}:00
              </div>

              {/* Day Cells */}
              {weekDates.map((_, dayIndex) => {
                const cellTasks = getTasksForCell(dayIndex, hour);
                const isDropTarget =
                  dragOverCell?.day === dayIndex && dragOverCell?.hour === hour;

                return (
                  <div
                    key={dayIndex}
                    className={`
                      border-l border-b border-[var(--color-border-subtle)] h-12 relative
                      ${isDropTarget ? 'bg-blue-50' : ''}
                      ${hasSelectedTask ? 'cursor-pointer hover:bg-blue-50/50' : ''}
                    `}
                    onDragOver={(e) => handleDragOver(e, dayIndex, hour)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dayIndex, hour)}
                    onClick={() => handleCellClick(dayIndex, hour)}
                  >
                    {cellTasks.map((task) => {
                      // 只在任务开始的小时渲染
                      if (task.startHour !== hour) return null;

                      const heightPx = task.duration * 48; // 48px per hour (h-12 = 3rem = 48px)

                      return (
                        <div
                          key={task.id}
                          className={`task-block ${task.category} absolute inset-x-0.5 md:inset-x-1 z-10`}
                          style={{
                            top: 0,
                            height: `${heightPx - 4}px`,
                            borderLeftColor: GOALS[task.category].color,
                          }}
                          title={`${task.name} (${task.duration}h)`}
                        >
                          <div className="truncate text-[10px] md:text-xs">
                            {task.name}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskRemove(task.id);
                            }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center text-xs rounded-full bg-red-100 md:bg-transparent text-red-500 md:text-gray-400 md:opacity-0 md:hover:opacity-100 md:hover:text-red-500 md:hover:bg-red-50 transition-all"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Art strip at bottom */}
      <div className="art-strip flex-shrink-0" />
    </div>
  );
}
