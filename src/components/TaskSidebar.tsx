/**
 * [INPUT]: TASKS 配置, GOALS 配置
 * [OUTPUT]: 右侧任务栏组件 - 可拖拽的任务列表
 * [POS]: 首页核心组件，提供可拖拽的任务模板
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/components/.folder.md 的描述是否仍然准确。
 */

'use client';

import { TASKS, GOALS, GOAL_CATEGORIES } from '@/core/goals';
import type { GoalCategory, TaskDefinition } from '@/types/goals';

// 梵高星空
const ARTWORK_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg';

interface TaskProgress {
  completed: number;
  target: number;
}

interface TaskSidebarProps {
  taskProgress: Record<string, TaskProgress>;
}


export function TaskSidebar({ taskProgress }: TaskSidebarProps) {
  const handleDragStart = (e: React.DragEvent, task: TaskDefinition) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        taskId: task.id,
        category: task.category,
        name: task.nameShort,
        duration: task.defaultDuration,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Group tasks by category
  const tasksByCategory = GOAL_CATEGORIES.reduce((acc, category) => {
    acc[category] = TASKS.filter((task) => task.category === category);
    return acc;
  }, {} as Record<GoalCategory, TaskDefinition[]>);

  return (
    <aside className="w-56 flex-shrink-0 bg-white rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header with Artwork Background */}
      <div className="flex-shrink-0 relative h-16 overflow-hidden">
        <img
          src={ARTWORK_URL}
          alt="Van Gogh - Starry Night"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 60%' }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col justify-center px-4">
          <h3 className="text-label text-white tracking-wider">
            TASKS
          </h3>
          <p className="text-tiny text-white/80 mt-0.5">
            拖拽到日历
          </p>
        </div>
      </div>


      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {GOAL_CATEGORIES.map((category) => {
          const goal = GOALS[category];
          const categoryTasks = tasksByCategory[category];

          if (categoryTasks.length === 0) return null;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: goal.color }}
                />
                <span className="text-small text-[var(--color-text-secondary)] font-medium">
                  {goal.name}
                </span>
              </div>

              <div className="space-y-1.5">
                {categoryTasks.map((task) => {
                  const progress = taskProgress[task.id] || {
                    completed: 0,
                    target: task.weeklyTarget,
                  };
                  const isComplete = progress.completed >= progress.target;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={`task-chip ${category} w-full justify-between ${
                        isComplete ? 'opacity-50' : ''
                      }`}
                    >
                      <span className="text-small">{task.nameShort}</span>
                      <span className="text-tiny opacity-70">
                        {progress.completed}/{progress.target}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom quote */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-[var(--color-border-subtle)]">
        <p className="text-tiny text-[var(--color-text-muted)] italic text-center">
          "See you, space cowboy..."
        </p>
      </div>
    </aside>
  );
}
