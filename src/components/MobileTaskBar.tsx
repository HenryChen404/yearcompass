/**
 * [INPUT]: TASKS 配置, selectedTask 状态, onSelect 回调
 * [OUTPUT]: 移动端底部任务选择栏 - 点击选中后点击日历添加
 * [POS]: 移动端专用组件，替代拖拽交互
 *
 * [PROTOCOL]:
 * 1. 一旦本文件逻辑变更，必须同步更新此 Header。
 * 2. 更新后必须上浮检查 /src/components/.folder.md 的描述是否仍然准确。
 */

'use client';

import { TASKS, GOALS, GOAL_CATEGORIES } from '@/core/goals';
import type { TaskDefinition, GoalCategory } from '@/types/goals';

interface TaskProgress {
  completed: number;
  target: number;
}

interface MobileTaskBarProps {
  taskProgress: Record<string, TaskProgress>;
  selectedTask: TaskDefinition | null;
  onSelectTask: (task: TaskDefinition | null) => void;
}

export function MobileTaskBar({ taskProgress, selectedTask, onSelectTask }: MobileTaskBarProps) {
  // Group tasks by category
  const tasksByCategory = GOAL_CATEGORIES.reduce((acc, category) => {
    acc[category] = TASKS.filter((task) => task.category === category);
    return acc;
  }, {} as Record<GoalCategory, TaskDefinition[]>);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] shadow-lg z-50">
      {/* Selected task indicator */}
      {selectedTask && (
        <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <span className="text-small text-blue-700">
            点击日历添加: <strong>{selectedTask.nameShort}</strong>
          </span>
          <button
            onClick={() => onSelectTask(null)}
            className="text-tiny text-blue-500 hover:text-blue-700"
          >
            取消
          </button>
        </div>
      )}

      {/* Task buttons - horizontal scroll */}
      <div className="p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {GOAL_CATEGORIES.map((category) => {
            const goal = GOALS[category];
            const categoryTasks = tasksByCategory[category];

            return categoryTasks.map((task) => {
              const progress = taskProgress[task.id] || {
                completed: 0,
                target: task.weeklyTarget,
              };
              const isComplete = progress.completed >= progress.target;
              const isSelected = selectedTask?.id === task.id;

              return (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(isSelected ? null : task)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all
                    ${isSelected
                      ? 'border-2 shadow-md'
                      : 'border-[var(--color-border)]'
                    }
                    ${isComplete ? 'opacity-50' : ''}
                  `}
                  style={{
                    borderColor: isSelected ? goal.color : undefined,
                    backgroundColor: isSelected ? `${goal.color}10` : 'white',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: goal.color }}
                  />
                  <span className="text-small whitespace-nowrap">{task.nameShort}</span>
                  <span className="text-tiny text-[var(--color-text-muted)]">
                    {progress.completed}/{progress.target}
                  </span>
                </button>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
