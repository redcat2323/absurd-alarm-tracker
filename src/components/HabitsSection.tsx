import { HabitList } from "@/components/HabitList";
import { AddHabitForm } from "@/components/AddHabitForm";
import { useHabits } from "@/hooks/useHabits";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationMessage } from "@/components/CelebrationMessage";
import { CustomHabit } from "@/types/habits";

interface HabitsSectionProps {
  userId: string;
}

export const HabitsSection = ({ userId }: HabitsSectionProps) => {
  const { habits, customHabits, toggleHabit, deleteHabit, refetchCustomHabits } = useHabits(userId);
  const { checkAndCelebrate, showCelebration, setShowCelebration } = useCelebration();

  const handleToggleHabit = async (id: number, isCustom?: boolean) => {
    checkAndCelebrate(id, isCustom, habits, customHabits as CustomHabit[]);
    await toggleHabit(id, isCustom);
  };

  const handleHabitAdded = async () => {
    await refetchCustomHabits();
  };

  return (
    <div className="space-y-4">
      <CelebrationMessage 
        show={showCelebration} 
        onClose={() => setShowCelebration(false)} 
      />
      
      <HabitList
        habits={habits}
        customHabits={customHabits as CustomHabit[]}
        onToggleHabit={handleToggleHabit}
        onDeleteHabit={deleteHabit}
      />
      
      <AddHabitForm 
        userId={userId}
        onHabitAdded={handleHabitAdded}
      />
    </div>
  );
};