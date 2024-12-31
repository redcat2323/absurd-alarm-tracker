import { HabitCard } from "@/components/HabitCard";
import { Plus } from "lucide-react";
import { CustomHabit, DefaultHabit } from "@/types/habits";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, memo, useMemo } from 'react';

interface HabitListProps {
  habits: DefaultHabit[];
  customHabits: CustomHabit[];
  onToggleHabit: (id: number, isCustom?: boolean) => Promise<void>;
  onDeleteHabit: (id: number) => Promise<void>;
}

const MemoizedHabitCard = memo(HabitCard);

export const HabitList = ({ 
  habits = [], 
  customHabits = [], 
  onToggleHabit, 
  onDeleteHabit 
}: HabitListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const allHabits = useMemo(() => [
    ...(habits || []).map(habit => ({ ...habit, isCustom: false })),
    ...(customHabits || []).map(habit => ({ 
      ...habit, 
      isCustom: true,
      icon: <Plus className="w-6 h-6" />,
      completedDays: habit.completed_days
    }))
  ], [habits, customHabits]);

  const virtualizer = useVirtualizer({
    count: allHabits.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  return (
    <div 
      ref={parentRef} 
      className="space-y-4 max-h-[800px] overflow-auto"
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const habit = allHabits[virtualItem.index];
        return (
          <div
            key={`${habit.isCustom ? 'custom-' : ''}${habit.id}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MemoizedHabitCard
              title={habit.title}
              icon={habit.icon}
              completed={habit.completed}
              progress={habit.progress}
              completedDays={habit.isCustom ? habit.completed_days : habit.completedDays}
              onClick={() => onToggleHabit(habit.id, habit.isCustom)}
              onDelete={habit.isCustom ? () => onDeleteHabit(habit.id) : undefined}
              isCustom={habit.isCustom}
            />
          </div>
        );
      })}
    </div>
  );
};