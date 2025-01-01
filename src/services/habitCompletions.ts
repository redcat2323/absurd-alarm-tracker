import { supabase } from "@/integrations/supabase/client";

export const checkDailyCompletion = async (userId: string, habitId: number, isCustom: boolean) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingCompletion } = await supabase
    .from('habit_daily_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('is_custom_habit', isCustom)
    .eq('completion_date', today)
    .maybeSingle();

  return existingCompletion;
};

export const recordDailyCompletion = async (userId: string, habitId: number, isCustom: boolean) => {
  const { error } = await supabase
    .from('habit_daily_completions')
    .insert([{
      user_id: userId,
      habit_id: habitId,
      is_custom_habit: isCustom
    }]);

  if (error) throw error;
};