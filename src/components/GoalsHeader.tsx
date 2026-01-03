/**
 * [INPUT]: GOALS 配置, 进度数据, BOTTOM_LINES
 * [OUTPUT]: 顶栏组件 - MET展览卡片风格，4个目标各配画作
 * [POS]: 首页核心组件，顶部目标概览
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/components/.folder.md 的描述是否仍然准确。
 */

'use client';

import { GOALS, GOAL_CATEGORIES, YEAR_THEME, BOTTOM_LINES } from '@/core/goals';
import type { GoalCategory } from '@/types/goals';

interface ProgressData {
  completed: number;
  target: number;
}

interface GoalsHeaderProps {
  progress: Record<GoalCategory, ProgressData>;
  showBrandBar?: boolean; // For mobile: brand bar is rendered separately
}

// 每个目标对应的画作 - MET展览风格 (使用 /thumb/ 格式确保可靠加载)
const GOAL_ARTWORKS: Record<GoalCategory, { url: string; title: string; artist: string }> = {
  work: {
    // 勤劳工作 - 播种者
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/The_Sower.jpg/800px-The_Sower.jpg',
    title: 'The Sower',
    artist: 'Vincent van Gogh',
  },
  build: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg/800px-Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg',
    title: 'The Milkmaid',
    artist: 'Johannes Vermeer',
  },
  health: {
    // 健康 - 德加的青年斯巴达人训练（身体训练与健康）
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Young_Spartans_National_Gallery_NG3860.jpg/1280px-Young_Spartans_National_Gallery_NG3860.jpg',
    title: 'Young Spartans Exercising',
    artist: 'Edgar Degas',
  },
  relationships: {
    // 人际关系 - 煎饼磨坊的舞会（社交聚会场景）
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg/800px-Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg',
    title: 'Bal du moulin de la Galette',
    artist: 'Pierre-Auguste Renoir',
  },
};

export function GoalsHeader({ progress, showBrandBar = true }: GoalsHeaderProps) {
  return (
    <header className="flex-shrink-0 bg-white flex flex-col">
      {/* Top Row - Branding (can be hidden on mobile when rendered separately) */}
      {showBrandBar && (
        <div className="px-4 md:px-6 pt-2 pb-1 md:pt-3 md:pb-2 border-b border-[var(--color-border)] flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-display text-sm md:text-lg tracking-[0.15em] leading-tight">YEARCOMPASS</h1>
              <p className="text-[10px] md:text-tiny text-[var(--color-text-secondary)]">{YEAR_THEME.title}</p>
            </div>
            {/* 2026 - Cowboy Bebop / Gundam inspired neon gradient */}
            <p
              className="text-display text-sm md:text-lg font-mono tracking-wider leading-tight bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent animate-pulse"
              style={{
                textShadow: '0 0 20px rgba(78, 205, 196, 0.3)',
              }}
            >
              {YEAR_THEME.year}
            </p>
          </div>
        </div>
      )}

      {/* Goals Row - MET Exhibition Card Style */}
      <div className="px-4 md:px-8 py-3">
        {/* Responsive grid: 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {GOAL_CATEGORIES.map((category) => {
            const goal = GOALS[category];
            const prog = progress[category];
            const artwork = GOAL_ARTWORKS[category];
            const percentage = prog.target > 0 ? Math.round((prog.completed / prog.target) * 100) : 0;

            return (
              <div key={category} className="group cursor-pointer flex flex-col">
                {/* Artwork Image - fixed aspect ratio for consistent sizing */}
                <div className="aspect-[4/3] overflow-hidden rounded-sm mb-1 md:mb-2 bg-[var(--color-bg-secondary)]">
                  <img
                    src={artwork.url}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      console.error(`Failed to load artwork: ${artwork.title}`, artwork.url);
                    }}
                  />
                </div>

                {/* Layer 1: Direction - 方向 */}
                <h3 className="flex-shrink-0 text-xs md:text-sm font-semibold text-black tracking-wide text-left">
                  {goal.nameEn}
                </h3>

                {/* Layer 2: Objective - 目标 (shown on both mobile and desktop) */}
                <p className="flex-shrink-0 text-[10px] md:text-xs text-black/90 leading-snug text-left line-clamp-2">
                  {goal.objective}
                </p>

                {/* Mobile: Progress bar */}
                <div className="md:hidden mt-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: goal.color
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-black/50 mt-0.5">
                    {prog.completed}/{prog.target}
                  </p>
                </div>

                {/* Desktop only: Metrics, Actions, Progress */}
                <p className="hidden md:block flex-shrink-0 text-[11px] text-black/70 leading-snug text-left mt-0.5">
                  指标: {goal.metrics[0]}
                </p>

                <p className="hidden md:block flex-shrink-0 text-[10px] text-black/50 leading-snug line-clamp-1 text-left">
                  动作: {goal.actions[0]}
                </p>

                <p className="hidden md:block flex-shrink-0 text-[10px] text-black/50 mt-0.5 text-left">
                  {prog.completed}/{prog.target}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Lines - Centered italic text (hidden on mobile) */}
      <div className="hidden md:block px-6 pb-2 flex-shrink-0">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {BOTTOM_LINES.map((line, i) => (
            <span
              key={i}
              className="text-tiny text-[var(--color-text-secondary)] italic flex items-center gap-1.5"
            >
              <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
              {line}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
