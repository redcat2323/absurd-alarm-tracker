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
  return now.getMonth() === 0 && now.getDate() === 1;
};