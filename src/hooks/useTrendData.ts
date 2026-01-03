/**
 * [INPUT]: localStorage 中的日历任务数据, TASKS 配置, 外部刷新触发
 * [OUTPUT]: 趋势数据数组，包含每周各目标完成百分比，分目标 hasData
 * [POS]: 核心 Hook，为 TrendsSidebar 和 trends 页面提供真实趋势数据
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/hooks/.folder.md 的描述是否仍然准确。
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { TASKS, getCurrentWeek, GOAL_CATEGORIES } from '@/core/goals';
import type { GoalCategory, CalendarTask } from '@/types/goals';

const STORAGE_KEY = 'yearcompass-calendar-tasks';

export interface WeekTrendData {
  week: number;
  weekLabel: string;
  work: number;
  build: number;
  health: number;
  relationships: number;
}

/**
 * 计算单周某目标的完成百分比
 */
function calculateCategoryProgress(
  tasks: CalendarTask[],
  category: GoalCategory
): number {
  // 获取该目标下所有任务的周目标总和
  const categoryTasks = TASKS.filter((t) => t.category === category);
  const totalTarget = categoryTasks.reduce((sum, t) => sum + t.weeklyTarget, 0);

  if (totalTarget === 0) return 0;

  // 统计该目标下完成的任务数量
  const completed = tasks.filter((t) => t.category === category).length;

  return Math.min(100, Math.round((completed / totalTarget) * 100));
}

/**
 * 趋势数据 Hook
 * @param maxWeeks 最多显示多少周的数据
 * @param refreshKey 外部触发刷新的 key（变化时重新加载数据）
 */
export function useTrendData(maxWeeks: number = 12, refreshKey?: number) {
  const [allData, setAllData] = useState<Record<string, CalendarTask[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [internalRefresh, setInternalRefresh] = useState(0);

  const { year, week: currentWeek } = getCurrentWeek();

  // 加载数据的函数
  const loadData = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setAllData(stored ? JSON.parse(stored) : {});
    } catch {
      setAllData({});
    }
    setIsLoaded(true);
  }, []);

  // 初始加载 + refreshKey 变化时重新加载
  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // 监听 storage 事件（跨标签页同步）和自定义事件（同页面同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadData();
      }
    };

    // 自定义事件用于同页面内的更新通知
    const handleCustomUpdate = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('yearcompass-data-update', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('yearcompass-data-update', handleCustomUpdate);
    };
  }, [loadData]);

  // 计算趋势数据 - 基于 localStorage 中实际存在数据的周
  const data = useMemo(() => {
    if (!isLoaded) return [];

    // 获取所有有数据的周（从 localStorage keys 中提取，过滤掉空数组）
    const weeksWithData = Object.keys(allData)
      .filter((key) => key.startsWith(`${year}-W`))
      .filter((key) => allData[key] && allData[key].length > 0) // 只保留有任务的周
      .map((key) => parseInt(key.split('-W')[1]))
      .filter((w) => !isNaN(w))
      .sort((a, b) => a - b)
      .slice(-maxWeeks); // 最多显示 maxWeeks 周

    const result: WeekTrendData[] = [];

    for (const w of weeksWithData) {
      const weekKey = `${year}-W${w}`;
      const weekTasks = allData[weekKey] || [];

      result.push({
        week: w,
        weekLabel: `W${w}`,
        work: calculateCategoryProgress(weekTasks, 'work'),
        build: calculateCategoryProgress(weekTasks, 'build'),
        health: calculateCategoryProgress(weekTasks, 'health'),
        relationships: calculateCategoryProgress(weekTasks, 'relationships'),
      });
    }

    return result;
  }, [allData, isLoaded, year, maxWeeks]);

  // 分目标检查是否有数据（某目标在任意周有 > 0 的值）
  const hasCategoryData = useMemo(() => {
    const result: Record<GoalCategory, boolean> = {
      work: false,
      build: false,
      health: false,
      relationships: false,
    };

    for (const category of GOAL_CATEGORIES) {
      result[category] = data.some((d) => d[category] > 0);
    }

    return result;
  }, [data]);

  // 全局检查是否有任何数据
  const hasData = useMemo(() => {
    return Object.values(hasCategoryData).some((v) => v);
  }, [hasCategoryData]);

  return {
    data,
    currentWeek,
    hasData,
    hasCategoryData,
    isLoaded,
  };
}

/**
 * 计算图表居中 padding（百分比）
 * 数据点少时增加两侧留白，使图表视觉居中
 */
export function calculateChartPadding(dataLength: number): {
  left: number;
  right: number;
} {
  if (dataLength === 0) return { left: 0, right: 0 };
  if (dataLength === 1) return { left: 50, right: 50 };
  if (dataLength === 2) return { left: 35, right: 35 };
  if (dataLength <= 4) return { left: 20, right: 20 };
  return { left: 10, right: 10 };
}
