import { HabitCard } from "@/components/HabitCard";
import { Book, Droplets, Moon, Sun, Timer, Plus } from "lucide-react";
import { CustomHabit, DefaultHabit } from "@/types/habits";

interface HabitListProps {
  habits: DefaultHabit[];
  customHabits: CustomHabit[];
  onToggleHabit: (id: number, isCustom?: boolean) => Promise<void>;
  onDeleteHabit: (id: number) => Promise<void>;
}

export const HabitList = ({ habits, customHabits, onToggleHabit, onDeleteHabit }: HabitListProps) => {
  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          title={habit.title}
          icon={habit.icon}
          completed={habit.completed}
          progress={habit.progress}
          completedDays={habit.completedDays}
          onClick={() => onToggleHabit(habit.id)}
        />
      ))}
      
      {customHabits.map((habit) => (
        <HabitCard
          key={`custom-${habit.id}`}
          title={habit.title}
          icon={<Plus className="w-6 h-6" />}
          completed={habit.completed}
          progress={habit.progress}
          completedDays={habit.completed_days}
          onClick={() => onToggleHabit(habit.id, true)}
          onDelete={() => onDeleteHabit(habit.id)}
          isCustom
        />
      ))}
    </div>
  );
};