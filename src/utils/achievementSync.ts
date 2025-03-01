
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Achievement } from "@/types/achievements";

/**
 * Synchronizes achievement unlocks based on user's habit history since January 1st
 */
export const syncAchievementsWithHistory = async (
  userId: string,
  achievements: Achievement[],
  unlockAchievement: (achievementId: number) => Promise<void>
) => {
  if (!userId || !achievements || !unlockAchievement) return;

  const currentDate = new Date();
  const startOfYear = `${currentDate.getFullYear()}-01-01`;
  
  try {
    // 1. Fetch all habit completions for the user since January 1st
    const { data: habitCompletions, error: completionsError } = await supabase
      .from('habit_daily_completions')
      .select('*')
      .eq('user_id', userId)
      .gte('completion_date', startOfYear);
    
    if (completionsError) throw completionsError;
    
    // 2. Fetch default habit completions for additional data (streak info)
    const { data: defaultHabitStats, error: defaultHabitsError } = await supabase
      .from('default_habit_completions')
      .select('*')
      .eq('user_id', userId);
      
    if (defaultHabitsError) throw defaultHabitsError;
    
    // 3. Fetch custom habits for additional data (streak info)
    const { data: customHabits, error: customHabitsError } = await supabase
      .from('custom_habits')
      .select('*')
      .eq('user_id', userId);
      
    if (customHabitsError) throw customHabitsError;
    
    // 4. Check streak achievements
    const streakAchievements = achievements.filter(a => a.type === 'streak');
    
    // Combine all habits with their completion days
    const allHabits = [
      ...(defaultHabitStats || []).map(h => ({ 
        id: h.habit_id, 
        completed_days: h.completed_days || 0,
        isCustom: false
      })),
      ...(customHabits || []).map(h => ({ 
        id: h.id, 
        completed_days: h.completed_days || 0,
        isCustom: true
      }))
    ];
    
    // Check and unlock streak achievements
    for (const habit of allHabits) {
      for (const achievement of streakAchievements) {
        if (habit.completed_days >= achievement.requirement_value) {
          await unlockAchievement(achievement.id);
        }
      }
    }
    
    // 5. Check category-specific achievements
    const categoryAchievements = achievements.filter(a => a.type === 'category');
    
    // Group completions by habit
    const habitCompletionCount: Record<string, number> = {};
    
    habitCompletions?.forEach(completion => {
      const key = `${completion.habit_id}-${completion.is_custom_habit}`;
      habitCompletionCount[key] = (habitCompletionCount[key] || 0) + 1;
    });
    
    // Match habit titles with their IDs for category achievements
    const defaultHabitTitles = [
      { id: 1, title: "Tocar o Terror na Terra - 4h59" },
      { id: 2, title: "Banho Natural" },
      { id: 3, title: "Devocional - Boot Diário" },
      { id: 4, title: "Leitura Diária" },
      { id: 5, title: "Exercício Diário" },
    ];
    
    // Check category achievements for default habits
    for (const habit of defaultHabitTitles) {
      const habitCompletions = habitCompletionCount[`${habit.id}-false`] || 0;
      
      for (const achievement of categoryAchievements) {
        if (achievement.category === habit.title && 
            habitCompletions >= achievement.requirement_value) {
          await unlockAchievement(achievement.id);
        }
      }
    }
    
    // Check category achievements for custom habits
    for (const habit of customHabits || []) {
      const habitCompletions = habitCompletionCount[`${habit.id}-true`] || 0;
      
      for (const achievement of categoryAchievements) {
        if (achievement.category === habit.title && 
            habitCompletions >= achievement.requirement_value) {
          await unlockAchievement(achievement.id);
        }
      }
    }
    
    // 6. Check seasonal achievements
    const seasonalAchievements = achievements.filter(a => a.type === 'seasonal');
    const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
    const currentDay = currentDate.getDate();
    
    for (const achievement of seasonalAchievements) {
      // If it's a seasonal achievement for a current or past month this year, unlock it
      if (achievement.requirement_value <= currentMonth) {
        const dayRequirement = achievement.category ? parseInt(achievement.category, 10) : null;
        
        // If day is specified and we haven't reached that day yet in the current month, skip
        if (dayRequirement && 
            achievement.requirement_value === currentMonth && 
            dayRequirement > currentDay) {
          continue;
        }
        
        await unlockAchievement(achievement.id);
      }
    }
    
    console.log("Achievement synchronization completed successfully");
    
  } catch (error) {
    console.error("Error synchronizing achievements:", error);
  }
};
