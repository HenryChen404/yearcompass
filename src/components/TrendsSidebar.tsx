/**
 * [INPUT]: GOALS 配置, 进度数据
 * [OUTPUT]: 左侧趋势图栏组件 - 迷你趋势图展示
 * [POS]: 首页核心组件，左侧显示进度趋势
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/components/.folder.md 的描述是否仍然准确。
 */

'use client';

import Link from 'next/link';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from 'recharts';
import { GOALS, GOAL_CATEGORIES } from '@/core/goals';
import type { GoalCategory } from '@/types/goals';

interface ProgressData {
  completed: number;
  target: number;
}

interface TrendsSidebarProps {
  progress: Record<GoalCategory, ProgressData>;
}

// 梵高杏花 - Almond Blossoms
const ARTWORK_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/68/Vincent_van_Gogh_-_Almond_blossom_-_Google_Art_Project.jpg';

// Mock 趋势数据 - 最近8周
const generateMiniTrendData = () => {
  const data = [];
  for (let week = 1; week <= 8; week++) {
    data.push({
      week,
      work: Math.floor(40 + Math.random() * 40 + week * 3),
      build: Math.floor(20 + Math.random() * 30 + week * 2),
      health: Math.floor(50 + Math.random() * 35 + week * 3),
      relationships: Math.floor(60 + Math.random() * 25 + week * 1.5),
    });
  }
  return data;
};

const TREND_DATA = generateMiniTrendData();

export function TrendsSidebar({ progress }: TrendsSidebarProps) {
  return (
    <aside className="w-48 flex-shrink-0 bg-white rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header with Artwork Background */}
      <div className="flex-shrink-0 relative h-16 overflow-hidden">
        <img
          src={ARTWORK_URL}
          alt="Van Gogh - Almond Blossoms"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col justify-center px-4">
          <h3 className="text-label text-white tracking-wider">
            TRENDS
          </h3>
          <p className="text-tiny text-white/80 mt-0.5">
            最近 8 周趋势
          </p>
        </div>
      </div>

      {/* Mini Charts */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {GOAL_CATEGORIES.map((category, index) => {
          const goal = GOALS[category];
          const prog = progress[category];
          const percentage = prog.target > 0
            ? Math.round((prog.completed / prog.target) * 100)
            : 0;
          const isLast = index === GOAL_CATEGORIES.length - 1;

          return (
            <div key={category}>
              <div
                className="p-2 rounded border border-[var(--color-border)] hover:shadow-sm transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="text-tiny font-medium tracking-wider text-[var(--color-text-secondary)]">
                      {goal.nameEn}
                    </span>
                  </div>
                  <span
                    className="text-small font-mono"
                    style={{ color: goal.color }}
                  >
                    {percentage}%
                  </span>
                </div>

                {/* Mini Chart */}
                <div className="h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TREND_DATA}>
                      <defs>
                        <linearGradient id={`mini-gradient-${category}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={goal.color} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={goal.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis domain={[0, 100]} hide />
                      <Area
                        type="monotone"
                        dataKey={category}
                        stroke={goal.color}
                        strokeWidth={1.5}
                        fill={`url(#mini-gradient-${category})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* View Full Trends Link - After last card */}
              {isLast && (
                <Link
                  href="/trends"
                  className="text-small text-[var(--color-accent-primary)] hover:underline flex items-center gap-1 mt-3 px-1"
                >
                  View Full Trends →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom quote */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-[var(--color-border-subtle)]">
        <p className="text-tiny text-[var(--color-text-muted)] italic text-center">
          "I dream my painting..."
        </p>
      </div>
    </aside>
  );
}
