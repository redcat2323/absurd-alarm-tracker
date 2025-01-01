import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const resetDailyHabits = async (userId: string) => {
  try {
    // Reset default habits
    await supabase
      .from('default_habit_completions')
      .update({ completed: false })
      .eq('user_id', userId);

    // Reset custom habits
    await supabase
      .from('custom_habits')
      .update({ completed: false })
      .eq('user_id', userId);

  } catch (error) {
    console.error('Error resetting daily habits:', error);
  }
};

export const resetAnnualHabits = async (userId: string) => {
  try {
    // Reset default habits
    await supabase
      .from('default_habit_completions')
      .update({ 
        completed: false,
        completed_days: 0,
        progress: 0
      })
      .eq('user_id', userId);

    // Reset custom habits
    await supabase
      .from('custom_habits')
      .update({ 
        completed: false,
        completed_days: 0,
        progress: 0
      })
      .eq('user_id', userId);

    toast({
      title: "Novo Ano!",
      description: "Seus hábitos foram resetados para o novo ano.",
    });

    return true;
  } catch (error) {
    console.error('Error resetting annual habits:', error);
    return false;
  }
};

export const shouldResetAnnualProgress = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);
  
  // Check if we're in the first day of the year and haven't reset yet
  const isFirstDayOfYear = now.getMonth() === 0 && now.getDate() === 1;
  const lastResetYear = localStorage.getItem('lastHabitResetYear');
  const currentYear = now.getFullYear().toString();
  
  if (isFirstDayOfYear && lastResetYear !== currentYear) {
    localStorage.setItem('lastHabitResetYear', currentYear);
    return true;
  }
  
  return false;
};