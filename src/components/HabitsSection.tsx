import { HabitList } from "@/components/HabitList";
import { AddHabitForm } from "@/components/AddHabitForm";
import { useHabits } from "@/hooks/useHabits";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationMessage } from "@/components/CelebrationMessage";
import { useEffect } from "react";
import { checkAndResetHabits } from "@/utils/habitReset";
import { useAchievements } from "@/hooks/useAchievements";

interface HabitsSectionProps {
  userId: string;
}

export const HabitsSection = ({ userId }: HabitsSectionProps) => {
  const { habits, customHabits, toggleHabit, deleteHabit, refetchCustomHabits } = useHabits(userId);
  const { checkAndCelebrate, showCelebration, setShowCelebration } = useCelebration();
  const { achievements, unlockAchievement } = useAchievements(userId);

  useEffect(() => {
    checkAndResetHabits(userId);
    
    const interval = setInterval(() => {
      checkAndResetHabits(userId);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const checkAchievements = async (habitId: number, isCustom: boolean) => {
    if (!achievements) return;

    const habit = isCustom 
      ? customHabits?.find(h => h.id === habitId)
      : habits.find(h => h.id === habitId);

    if (!habit) return;

    // Check category-specific achievements
    const categoryAchievements = achievements.filter(
      a => a.type === 'category' && a.category === habit.title
    );

    for (const achievement of categoryAchievements) {
      if (habit.completedDays >= achievement.requirement_value) {
        await unlockAchievement(achievement.id);
      }
    }

    // Check streak achievements
    const streakAchievements = achievements.filter(a => a.type === 'streak');
    for (const achievement of streakAchievements) {
      // Assuming consecutive days are tracked in completedDays
      if (habit.completedDays >= achievement.requirement_value) {
        await unlockAchievement(achievement.id);
      }
    }
  };

  const handleToggleHabit = async (id: number, isCustom?: boolean) => {
    checkAndCelebrate(id, isCustom, habits, customHabits);
    await toggleHabit(id, isCustom);
    await checkAchievements(id, isCustom || false);
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
        customHabits={customHabits || []}
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