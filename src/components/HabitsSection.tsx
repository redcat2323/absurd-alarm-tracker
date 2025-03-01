
import { HabitList } from "@/components/HabitList";
import { AddHabitForm } from "@/components/AddHabitForm";
import { useHabits } from "@/hooks/useHabits";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationMessage } from "@/components/CelebrationMessage";
import { useEffect, useRef } from "react";
import { checkAndResetHabits } from "@/utils/habitReset";
import { useAchievements } from "@/hooks/useAchievements";

interface HabitsSectionProps {
  userId: string;
}

export const HabitsSection = ({ userId }: HabitsSectionProps) => {
  const { habits, customHabits, toggleHabit, deleteHabit, refetchCustomHabits } = useHabits(userId);
  const { 
    checkAndCelebrate, 
    showCelebration, 
    setShowCelebration,
    celebrationType,
    celebrationMessage,
    celebrate 
  } = useCelebration();
  const { 
    achievements, 
    unlockAchievement, 
    userAchievements,
    syncAllAchievements 
  } = useAchievements(userId);
  
  // Add a ref to track which achievements we've checked in this session
  const checkedAchievementsRef = useRef<Set<number>>(new Set());
  // Add a ref to track if we've synced achievements
  const hasInitialSyncRef = useRef(false);

  useEffect(() => {
    checkAndResetHabits(userId);
    
    const interval = setInterval(() => {
      checkAndResetHabits(userId);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [userId]);

  // Add a new effect to sync achievements once when component loads
  useEffect(() => {
    if (
      userId && 
      achievements && 
      achievements.length > 0 && 
      !hasInitialSyncRef.current
    ) {
      // Only sync once per session
      hasInitialSyncRef.current = true;
      // Use a small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        syncAllAchievements();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [userId, achievements, syncAllAchievements]);

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
      // Skip if we've already checked this achievement in the current session
      if (checkedAchievementsRef.current.has(achievement.id)) {
        continue;
      }
      
      // Check if achievement is not already unlocked
      const isUnlocked = userAchievements?.some(
        ua => ua.achievement_id === achievement.id
      );

      if (!isUnlocked && habit.completed_days >= achievement.requirement_value) {
        // Mark as checked in this session
        checkedAchievementsRef.current.add(achievement.id);
        await unlockAchievement(achievement.id);
        celebrate("achievement", `Conquista desbloqueada: ${achievement.title}`);
      }
    }

    // Check streak achievements
    const streakAchievements = achievements.filter(a => a.type === 'streak');
    for (const achievement of streakAchievements) {
      // Skip if we've already checked this achievement in the current session
      if (checkedAchievementsRef.current.has(achievement.id)) {
        continue;
      }
      
      // Check if achievement is not already unlocked
      const isUnlocked = userAchievements?.some(
        ua => ua.achievement_id === achievement.id
      );

      if (!isUnlocked && habit.completed_days >= achievement.requirement_value) {
        // Mark as checked in this session
        checkedAchievementsRef.current.add(achievement.id);
        await unlockAchievement(achievement.id);
        celebrate("milestone", `Marco alcançado: ${achievement.title}`);
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
        type={celebrationType}
        message={celebrationMessage}
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
