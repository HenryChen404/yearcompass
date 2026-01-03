/**
 * [INPUT]: None - 纯类型定义
 * [OUTPUT]: Goal, WeeklyRecord, GoalProgress 类型
 * [POS]: 类型层基础，定义所有数据结构
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/types/.folder.md 的描述是否仍然准确。
 */

/** 目标类别 */
export type GoalCategory = 'work' | 'build' | 'health' | 'relationships';

/** 单个目标的定义 */
export interface Goal {
  id: GoalCategory;
  name: string;
  nameEn: string;
  subtitle?: string;        // 副标题（如 "Plaud", "副业/创业"）
  objective: string;        // 年度目标（简短版）
  objectiveDetail?: string; // 目标详细说明
  metrics: string[];        // 关键指标
  actions: string[];        // 具体动作
  timeSlots?: string;       // 固定时间安排
  color: string;            // 主题色
}

/** 周记录的单个指标 */
export interface WeeklyMetric {
  key: string;
  label: string;
  value: number;
  target?: number;
  unit?: string;
}

/** 一周的完整记录 */
export interface WeeklyRecord {
  id: string;
  year: number;
  week: number;             // 1-52
  date: string;             // ISO date string
  goals: {
    [key in GoalCategory]: {
      metrics: WeeklyMetric[];
      note?: string;
    };
  };
  reflection?: {
    bottleneck: string;     // 本周最大瓶颈
    nextWeekFocus: string;  // 下周只改1件事
  };
  createdAt: string;
  updatedAt: string;
}

/** 目标进度计算结果 */
export interface GoalProgress {
  category: GoalCategory;
  currentValue: number;
  targetValue: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  weeklyChange: number;
}

/** 当前周信息 */
export interface CurrentWeek {
  year: number;
  week: number;
  totalWeeks: number;
  dayOfWeek: number;
}

/** 预定义任务模板 */
export interface TaskDefinition {
  id: string;
  name: string;
  nameShort: string;
  category: GoalCategory;
  defaultDuration: number;  // 默认时长（小时）
  weeklyTarget: number;     // 每周目标次数
}

/** 日历中的任务实例 */
export interface CalendarTask {
  id: string;
  taskId: string;           // 关联的 TaskDefinition id
  category: GoalCategory;
  name: string;
  dayIndex: number;         // 0-6 (周一到周日)
  startHour: number;        // 开始小时 (0-23)
  duration: number;         // 持续时长（小时）
}

/** 一周的日历数据 */
export interface WeekCalendar {
  year: number;
  week: number;
  tasks: CalendarTask[];
}
