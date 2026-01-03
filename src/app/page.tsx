/**
 * [INPUT]: GOALS, TASKS 配置, 日历状态
 * [OUTPUT]: 首页 - 顶栏目标 + 三栏内容（趋势 + 日历 + 任务）
 * [POS]: App Router 首页，年度目标追踪的主入口
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/app/.folder.md 的描述是否仍然准确。
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { GoalsHeader } from '@/components/GoalsHeader';
import { TrendsSidebar } from '@/components/TrendsSidebar';
import { WeekCalendar } from '@/components/WeekCalendar';
import { TaskSidebar } from '@/components/TaskSidebar';
import { getCurrentWeek, getWeekDates, TASKS } from '@/core/goals';
import type { CalendarTask, GoalCategory } from '@/types/goals';

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// localStorage key
const STORAGE_KEY = 'yearcompass-calendar-tasks';

// 从 localStorage 加载数据
const loadFromStorage = (): Record<string, CalendarTask[]> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// 保存到 localStorage
const saveToStorage = (data: Record<string, CalendarTask[]>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 忽略存储错误
  }
};

export default function HomePage() {
  const currentWeekInfo = getCurrentWeek();
  const [selectedYear, setSelectedYear] = useState(currentWeekInfo.year);
  const [selectedWeek, setSelectedWeek] = useState(currentWeekInfo.week);
  const totalWeeks = currentWeekInfo.totalWeeks;

  const weekDates = useMemo(() => getWeekDates(selectedYear, selectedWeek), [selectedYear, selectedWeek]);
  const weekKey = `${selectedYear}-W${selectedWeek}`;

  // 生成周选项列表
  const weekOptions = useMemo(() => {
    const options = [];
    for (let w = 1; w <= totalWeeks; w++) {
      const dates = getWeekDates(selectedYear, w);
      const startDate = dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDate = dates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      options.push({
        week: w,
        label: `Week ${w}: ${startDate} - ${endDate}`,
      });
    }
    return options;
  }, [selectedYear, totalWeeks]);

  // 处理周切换
  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(Number(e.target.value));
  };

  // 快速导航按钮
  const goToPrevWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    }
  };

  const goToNextWeek = () => {
    if (selectedWeek < totalWeeks) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  const goToCurrentWeek = () => {
    setSelectedYear(currentWeekInfo.year);
    setSelectedWeek(currentWeekInfo.week);
  };

  // 日历任务状态
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载当前周的任务
  useEffect(() => {
    const allData = loadFromStorage();
    const weekTasks = allData[weekKey] || [];
    setCalendarTasks(weekTasks);
    setIsLoaded(true);
  }, [weekKey]);

  // 保存到 localStorage 并通知其他组件
  useEffect(() => {
    if (!isLoaded) return;
    const allData = loadFromStorage();
    allData[weekKey] = calendarTasks;
    saveToStorage(allData);
    // 触发自定义事件通知 Trends 组件更新
    window.dispatchEvent(new CustomEvent('yearcompass-data-update'));
  }, [calendarTasks, weekKey, isLoaded]);

  // 计算每个任务的完成进度
  const taskProgress = useMemo(() => {
    const progress: Record<string, { completed: number; target: number }> = {};

    TASKS.forEach((task) => {
      const completedCount = calendarTasks.filter(
        (ct) => ct.taskId === task.id
      ).length;
      progress[task.id] = {
        completed: completedCount,
        target: task.weeklyTarget,
      };
    });

    return progress;
  }, [calendarTasks]);

  // 计算每个目标的完成进度
  const goalProgress = useMemo(() => {
    const progress: Record<GoalCategory, { completed: number; target: number }> = {
      work: { completed: 0, target: 0 },
      build: { completed: 0, target: 0 },
      health: { completed: 0, target: 0 },
      relationships: { completed: 0, target: 0 },
    };

    TASKS.forEach((task) => {
      const taskProg = taskProgress[task.id];
      progress[task.category].completed += taskProg.completed;
      progress[task.category].target += taskProg.target;
    });

    return progress;
  }, [taskProgress]);

  // 添加任务到日历
  const handleTaskAdd = useCallback((task: Omit<CalendarTask, 'id'>) => {
    const newTask: CalendarTask = {
      ...task,
      id: generateId(),
    };
    setCalendarTasks((prev) => [...prev, newTask]);
  }, []);

  // 更新日历任务
  const handleTaskUpdate = useCallback(
    (taskId: string, updates: Partial<CalendarTask>) => {
      setCalendarTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
    },
    []
  );

  // 删除日历任务
  const handleTaskRemove = useCallback((taskId: string) => {
    setCalendarTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--color-bg-secondary)]">
      {/* Top Header - Goals */}
      <GoalsHeader progress={goalProgress} />

      {/* Main Content Area - Three Columns with gaps (60vh) */}
      <div className="h-[60vh] flex overflow-hidden p-4 gap-4">
        {/* Left Sidebar - Trends */}
        <div className="flex-shrink-0">
          <TrendsSidebar progress={goalProgress} />
        </div>

        {/* Center - Calendar */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white rounded-lg shadow-sm">
          {/* Week Header with Navigation - h-16 to align with sidebars */}
          <div className="flex-shrink-0 h-16 border-b border-[var(--color-border)] px-4 flex items-center">
            <div className="flex items-center justify-between w-full">
              {/* Left: Week Selector */}
              <div className="flex items-center gap-2">
                {/* Prev Button */}
                <button
                  onClick={goToPrevWeek}
                  disabled={selectedWeek <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous week"
                >
                  <span className="text-sm">‹</span>
                </button>

                {/* Week Dropdown */}
                <select
                  value={selectedWeek}
                  onChange={handleWeekChange}
                  className="text-label text-[var(--color-text-primary)] bg-transparent border border-[var(--color-border)] rounded px-2 py-1 cursor-pointer hover:border-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                >
                  {weekOptions.map((option) => (
                    <option key={option.week} value={option.week}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Next Button */}
                <button
                  onClick={goToNextWeek}
                  disabled={selectedWeek >= totalWeeks}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next week"
                >
                  <span className="text-sm">›</span>
                </button>

                {/* Today Button */}
                {(selectedWeek !== currentWeekInfo.week || selectedYear !== currentWeekInfo.year) && (
                  <button
                    onClick={goToCurrentWeek}
                    className="ml-2 text-tiny text-[var(--color-accent-primary)] hover:underline"
                  >
                    Today
                  </button>
                )}
              </div>

              {/* Right: Year and Progress */}
              <div className="flex items-center gap-3">
                <span className="text-small text-[var(--color-text-secondary)]">
                  {selectedYear}
                </span>
                <span className="text-small font-mono text-[var(--color-text-muted)]">
                  {selectedWeek} / {totalWeeks}
                </span>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex-1 overflow-auto p-4">
            <WeekCalendar
              weekDates={weekDates}
              tasks={calendarTasks}
              onTaskAdd={handleTaskAdd}
              onTaskUpdate={handleTaskUpdate}
              onTaskRemove={handleTaskRemove}
            />
          </div>
        </main>

        {/* Right Sidebar - Tasks */}
        <div className="flex-shrink-0">
          <TaskSidebar taskProgress={taskProgress} />
        </div>
      </div>
    </div>
  );
}
