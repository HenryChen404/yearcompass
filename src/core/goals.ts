/**
 * [INPUT]: Goal, Task 类型定义
 * [OUTPUT]: GOALS, TASKS 常量 - 年度目标和任务配置
 * [POS]: 核心业务数据，定义 Haonan 的 2026 年度计划
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/core/.folder.md 的描述是否仍然准确。
 */

import type { Goal, GoalCategory, TaskDefinition } from '@/types/goals';

/** 2026 年度主题 */
export const YEAR_THEME = {
  year: 2026,
  title: '专注 + 复利 + 身体修复',
};

/** 5 条年度底线 */
export const BOTTOM_LINES = [
  '不同时推进超过 2 个主项目（Work 1 个 + Build 1 个）',
  '不用"学习/证书/规划"替代"交付"',
  '不带着右肩/颈问题硬练硬扛；不连续久坐不动',
  '不让手机/信息流切碎注意力（工作日白天禁刷）',
  '不缺失复盘（每周一次，雷打不动）',
];

/** 4 个年度目标 - 更新配色为印象派色调 */
export const GOALS: Record<GoalCategory, Goal> = {
  work: {
    id: 'work',
    name: '工作',
    nameEn: 'WORK',
    subtitle: 'Plaud',
    objective: '交付 1 个能被数据证明有效的核心增量（你主导）',
    objectiveDetail: '在 Plaud 主导一个核心功能或增长方向，用数据验证其有效性。不是参与，而是主导；不是做完，而是做成。',
    metrics: [
      '你负责的 1 个核心指标连续 8 周改善',
      '（留存/转化/激活/付费/使用频次 任选其一）',
    ],
    actions: [
      '每周 2 次深度产出（2h）',
      '每周 ≥5 个用户触达（访谈/回访/可用性测试/用户群）',
    ],
    timeSlots: '周二/周四 9:00–11:00 深度产出',
    color: '#4A90A4', // Water Lilies blue
  },
  build: {
    id: 'build',
    name: '创造',
    nameEn: 'BUILD',
    subtitle: '副业/创业',
    objective: '做出 1 个可对外展示的 MVP，并获得真实反馈',
    objectiveDetail: '从 0 到 1 做一个自己的产品，不求完美，但求真实用户反馈。证明自己能独立 Ship，能触达真实市场。',
    metrics: [
      '10 个真实用户（或 3 个付费）',
      '每周一次发布/迭代持续 12 周',
    ],
    actions: [
      '每周 1 次 Ship（发布/迭代）',
      '每周 1 次增长实验（渠道只选 1 个：内容/SEO/社群/投放）',
    ],
    timeSlots: '周六 10:00–13:00 只做 Ship',
    color: '#E07B39', // Van Gogh orange
  },
  health: {
    id: 'health',
    name: '健康',
    nameEn: 'HEALTH',
    subtitle: '身体与精力',
    objective: '右肩/颈前伸问题明显改善，训练与久坐办公可持续',
    objectiveDetail: '修复身体的核心瓶颈（右肩/颈），让训练和工作都能可持续。不是追求极限，而是追求长期稳定输出的身体基础。',
    metrics: [
      '右肩不适自评（0–10）下降 ≥2',
      '颈左右旋转每侧提升 ≥10°（或明显更顺）',
    ],
    actions: [
      '力量训练 3 次/周（拉为主，全身）',
      '椭圆机 Zone2 2 次/周（20–40min）',
      '肩胛/颈部康复 10min/天（硬约束）',
    ],
    timeSlots: '周一/三/五 18:30–19:30 力量；每天睡前 10min 康复',
    color: '#7CB342', // Monet garden green
  },
  relationships: {
    id: 'relationships',
    name: '关系',
    nameEn: 'RELS',
    subtitle: '亲密关系 + 关键友谊',
    objective: '关系投入系统化、稳定增长',
    objectiveDetail: '把关系维护从"有空再说"变成"固定节奏"。亲密关系需要稳定投入，关键友谊需要主动约。',
    metrics: [
      '每周 1 次无手机高质量相处/深聊 ≥60min',
    ],
    actions: [
      '每周提前预约',
      '每月 1 次主动约关键朋友',
    ],
    timeSlots: '每周固定预约时间',
    color: '#D4A574', // Warm ochre
  },
};

/** 预定义任务 - 可拖拽到日历的任务块 */
export const TASKS: TaskDefinition[] = [
  // Work 任务
  {
    id: 'deep-work',
    name: '深度产出',
    nameShort: '深度产出',
    category: 'work',
    defaultDuration: 2, // 2小时
    weeklyTarget: 2,
  },
  {
    id: 'user-touchpoint',
    name: '用户触达',
    nameShort: '用户触达',
    category: 'work',
    defaultDuration: 1,
    weeklyTarget: 5,
  },
  // Build 任务
  {
    id: 'ship',
    name: 'Ship 发布',
    nameShort: 'Ship',
    category: 'build',
    defaultDuration: 3,
    weeklyTarget: 1,
  },
  {
    id: 'growth-experiment',
    name: '增长实验',
    nameShort: '增长实验',
    category: 'build',
    defaultDuration: 1,
    weeklyTarget: 1,
  },
  // Health 任务
  {
    id: 'strength-training',
    name: '力量训练',
    nameShort: '力量训练',
    category: 'health',
    defaultDuration: 1,
    weeklyTarget: 3,
  },
  {
    id: 'zone2-cardio',
    name: 'Zone2 有氧',
    nameShort: 'Zone2',
    category: 'health',
    defaultDuration: 0.5, // 30分钟
    weeklyTarget: 2,
  },
  {
    id: 'rehab',
    name: '肩颈康复',
    nameShort: '康复',
    category: 'health',
    defaultDuration: 0.17, // 10分钟
    weeklyTarget: 7, // 每天
  },
  // Relationships 任务
  {
    id: 'quality-time',
    name: '高质量相处',
    nameShort: '相处',
    category: 'relationships',
    defaultDuration: 1,
    weeklyTarget: 1,
  },
];

/** 获取当前周数 */
export function getCurrentWeek(): { year: number; week: number; totalWeeks: number } {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);

  return { year, week, totalWeeks: 52 };
}

/** 获取当前周的日期范围 */
export function getWeekDates(year: number, week: number): Date[] {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
  const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);
  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/** 目标分类列表 */
export const GOAL_CATEGORIES: GoalCategory[] = ['work', 'build', 'health', 'relationships'];
