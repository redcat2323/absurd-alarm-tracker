import { HabitList } from "@/components/HabitList";
import { AddHabitForm } from "@/components/AddHabitForm";
import { useHabits } from "@/hooks/useHabits";
import { useCelebration } from "@/hooks/useCelebration";

interface HabitsSectionProps {
  userId: string;
}

export const HabitsSection = ({ userId }: HabitsSectionProps) => {
  const { habits, customHabits, toggleHabit, deleteHabit, refetchCustomHabits } = useHabits(userId);
  const { checkAndCelebrate } = useCelebration();

  const handleToggleHabit = async (id: number, isCustom?: boolean) => {
    checkAndCelebrate(id, isCustom, habits, customHabits);
    await toggleHabit(id, isCustom);
  };

  return (
    <div className="space-y-4">
      <HabitList
        habits={habits}
        customHabits={customHabits || []}
        onToggleHabit={handleToggleHabit}
        onDeleteHabit={deleteHabit}
      />
      
      <AddHabitForm 
        userId={userId}
        onHabitAdded={refetchCustomHabits}
      />
    </div>
  );
};