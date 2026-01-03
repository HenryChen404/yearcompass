/**
 * [INPUT]: 周日期, 日历任务数据, 拖放回调
 * [OUTPUT]: 周日历组件 - Google Calendar 风格纵向时间轴
 * [POS]: 首页核心组件，展示和编辑一周的任务安排
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/components/.folder.md 的描述是否仍然准确。
 */

'use client';

import { useState, useCallback } from 'react';
import type { CalendarTask, GoalCategory } from '@/types/goals';
import { GOALS } from '@/core/goals';

interface WeekCalendarProps {
  weekDates: Date[];
  tasks: CalendarTask[];
  onTaskAdd: (task: Omit<CalendarTask, 'id'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<CalendarTask>) => void;
  onTaskRemove: (taskId: string) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6:00 - 21:00
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeekCalendar({
  weekDates,
  tasks,
  onTaskAdd,
  onTaskUpdate,
  onTaskRemove,
}: WeekCalendarProps) {
  const [dragOverCell, setDragOverCell] = useState<{ day: number; hour: number } | null>(null);

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

  return (
    <div className="bg-white border border-[var(--color-border)] rounded overflow-hidden flex flex-col h-full">
      {/* Art strip at top */}
      <div className="art-strip flex-shrink-0" />

      {/* Header Row */}
      <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-[var(--color-border)] flex-shrink-0">
        <div className="p-2 bg-[var(--color-bg-secondary)]" />
        {weekDates.map((date, index) => (
          <div
            key={index}
            className="p-2 text-center bg-[var(--color-bg-secondary)] border-l border-[var(--color-border-subtle)]"
          >
            <div className="text-xs text-[var(--color-text-muted)] tracking-wider">
              {DAY_NAMES[index]}
            </div>
            <div className="text-sm font-medium mt-0.5">
              {formatDate(date)}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[50px_repeat(7,1fr)]"
          >
            {/* Time Label */}
            <div className="calendar-time border-b border-[var(--color-border-subtle)] h-12 text-xs">
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
                  `}
                  onDragOver={(e) => handleDragOver(e, dayIndex, hour)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dayIndex, hour)}
                >
                  {cellTasks.map((task) => {
                    // 只在任务开始的小时渲染
                    if (task.startHour !== hour) return null;

                    const heightPx = task.duration * 48; // 48px per hour

                    return (
                      <div
                        key={task.id}
                        className={`task-block ${task.category} absolute inset-x-1 z-10`}
                        style={{
                          top: 0,
                          height: `${heightPx - 4}px`,
                          borderLeftColor: GOALS[task.category].color,
                        }}
                        title={`${task.name} (${task.duration}h)`}
                      >
                        <div className="truncate text-xs">
                          {task.name}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskRemove(task.id);
                          }}
                          className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
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

      {/* Art strip at bottom */}
      <div className="art-strip flex-shrink-0" />
    </div>
  );
}
