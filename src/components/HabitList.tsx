import { HabitCard } from "@/components/HabitCard";
import { Book, Droplets, Moon, Sun, Timer, Plus } from "lucide-react";
import { CustomHabit } from "@/types/habits";

interface Habit {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  completedDays: number;
}

interface HabitListProps {
  habits: Habit[];
  customHabits: CustomHabit[];
  onToggleHabit: (id: number, isCustom?: boolean) => Promise<void>;
}

export const HabitList = ({ habits, customHabits, onToggleHabit }: HabitListProps) => {
  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          title={habit.title}
          icon={habit.icon}
          completed={habit.completed}
          progress={habit.progress}
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
          onClick={() => onToggleHabit(habit.id, true)}
        />
      ))}
    </div>
  );
};