import { supabase } from "@/integrations/supabase/client";

export const resetAnnualProgress = async (userId: string) => {
  try {
    // Reset default habits progress
    await supabase
      .from('default_habit_completions')
      .update({
        completed_days: 0,
        progress: 0,
        completed: false
      })
      .eq('user_id', userId);

    // Reset custom habits progress
    await supabase
      .from('custom_habits')
      .update({
        completed_days: 0,
        progress: 0,
        completed: false
      })
      .eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('Error resetting annual progress:', error);
    return false;
  }
};

export const shouldResetProgress = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);
  
  // Check if we're in the first hour of the year
  const isFirstHourOfYear = now.getTime() - startOfYear.getTime() < 3600000;
  
  // Get stored last reset year from localStorage
  const lastResetYear = localStorage.getItem('lastHabitResetYear');
  const currentYear = now.getFullYear().toString();
  
  // If it's the first hour of the year and we haven't reset yet for this year
  if (isFirstHourOfYear && lastResetYear !== currentYear) {
    localStorage.setItem('lastHabitResetYear', currentYear);
    return true;
  }
  
  return false;
};