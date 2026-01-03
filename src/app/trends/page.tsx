/**
 * [INPUT]: useTrendData Hook, Recharts 图表库, GOALS 配置
 * [OUTPUT]: 趋势图页面 - 全屏布局展示目标进度趋势（真实数据）
 * [POS]: App Router 趋势路由，展示目标进度的时间趋势
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/app/.folder.md 的描述是否仍然准确。
 */

'use client';

import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { GOALS, getCurrentWeek, GOAL_CATEGORIES } from '@/core/goals';
import { useTrendData, calculateChartPadding } from '@/hooks/useTrendData';
import type { GoalCategory } from '@/types/goals';

// 印象派画作 URLs
const ARTWORK_URLS = {
  monet: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
  renoir: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg/1280px-Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg',
};

export default function TrendsPage() {
  const { year, week, totalWeeks } = getCurrentWeek();
  const { data: trendData, hasData, hasCategoryData, currentWeek } = useTrendData(12);
  const padding = calculateChartPadding(trendData.length);

  const goalColors: Record<GoalCategory, string> = {
    work: GOALS.work.color,
    build: GOALS.build.color,
    health: GOALS.health.color,
    relationships: GOALS.relationships.color,
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Header with artwork - Responsive */}
      <header className="flex-shrink-0 relative h-20 md:h-32 overflow-hidden">
        <img
          src={ARTWORK_URLS.monet}
          alt="Monet - Water Lilies"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/90" />
        <div className="absolute inset-0 flex items-end justify-between px-4 md:px-6 pb-2 md:pb-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/"
              className="text-display text-base md:text-xl hover:opacity-70 transition-opacity"
            >
              YEARCOMPASS
            </Link>
            <span className="hidden md:inline text-body-sm text-[var(--color-text-secondary)]">/ Trends</span>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <span className="text-xs md:text-body-sm font-mono text-[var(--color-text-secondary)]">
              W{week}/{totalWeeks}
            </span>
            <Link
              href="/"
              className="text-xs md:text-body-sm text-[var(--color-accent-primary)] hover:underline"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-3 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg md:text-headline mb-1">Progress Trends</h2>
            <p className="text-xs md:text-caption text-[var(--color-text-secondary)]">
              {hasData
                ? `W${trendData[0]?.week || 1} - W${trendData[trendData.length - 1]?.week} 目标完成趋势`
                : '开始在日历中添加任务来查看趋势'}
            </p>
          </div>

          {/* Combined Chart */}
          <section className="card p-3 md:p-6 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2">
              <h3 className="text-label text-[var(--color-text-primary)]">
                ALL GOALS OVERVIEW
              </h3>
              {/* Legend - horizontal scroll on mobile */}
              <div className="flex flex-wrap gap-3 md:gap-6">
                {GOAL_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center gap-1 md:gap-2">
                    <div
                      className="w-2 md:w-3 h-[2px]"
                      style={{ backgroundColor: goalColors[category] }}
                    />
                    <span className="text-[10px] md:text-small text-[var(--color-text-secondary)]">
                      {GOALS[category].nameEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[200px] md:h-[280px]">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ left: padding.left, right: padding.right }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="weekLabel"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: 4,
                      }}
                      labelStyle={{ color: '#1A1A1A' }}
                    />
                    {GOAL_CATEGORIES.map((category) => (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stroke={goalColors[category]}
                        strokeWidth={2}
                        dot={false}
                        name={GOALS[category].name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                  暂无趋势数据
                </div>
              )}
            </div>
          </section>

          {/* Individual Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {GOAL_CATEGORIES.map((category) => {
              const latestValue = trendData.length > 0
                ? trendData[trendData.length - 1][category]
                : 0;

              return (
                <section key={category} className="card p-3 md:p-5">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <div
                        className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full"
                        style={{ backgroundColor: goalColors[category] }}
                      />
                      <h3 className="text-sm md:text-label text-[var(--color-text-primary)]">
                        {GOALS[category].nameEn}
                      </h3>
                    </div>
                    <span
                      className="text-sm md:text-subhead font-mono"
                      style={{ color: goalColors[category] }}
                    >
                      {latestValue}%
                    </span>
                  </div>

                  <div className="h-[80px] md:h-[120px]">
                    {hasCategoryData[category] ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={trendData}
                          margin={{ left: padding.left, right: padding.right }}
                        >
                          <defs>
                            <linearGradient id={`gradient-${category}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={goalColors[category]} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={goalColors[category]} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="weekLabel"
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            width={30}
                            hide
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey={category}
                            stroke={goalColors[category]}
                            strokeWidth={2}
                            fill={`url(#gradient-${category})`}
                            name={GOALS[category].name}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div
                          className="w-full h-[1px] opacity-30"
                          style={{
                            backgroundImage: `repeating-linear-gradient(to right, ${goalColors[category]} 0, ${goalColors[category]} 4px, transparent 4px, transparent 8px)`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Goal Objective - hidden on mobile to save space */}
                  <div className="hidden md:block mt-3 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-small text-[var(--color-text-secondary)] leading-relaxed">
                      {GOALS[category].objective}
                    </p>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom artwork strip - hidden on mobile */}
      <div className="hidden md:block flex-shrink-0 h-12 overflow-hidden opacity-30">
        <img
          src={ARTWORK_URLS.renoir}
          alt="Renoir - Luncheon of the Boating Party"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
