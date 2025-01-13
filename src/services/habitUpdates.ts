import { supabase } from "@/integrations/supabase/client";
import { calculateAnnualProgress } from "@/utils/habitCalculations";
import { CustomHabit, DefaultHabit } from "@/types/habits";

export const updateCustomHabit = async (
  habit: CustomHabit,
  newCompleted: boolean
) => {
  const newCompletedDays = newCompleted ? 
    habit.completed_days + 1 : 
    habit.completed_days - 1;
  
  const newProgress = calculateAnnualProgress(newCompletedDays);

  const { error } = await supabase
    .from('custom_habits')
    .update({
      completed: newCompleted,
      completed_days: newCompletedDays,
      progress: newProgress
    })
    .eq('id', habit.id);

  if (error) throw error;
};

export const updateDefaultHabit = async (
  userId: string,
  habit: DefaultHabit,
  newCompleted: boolean
) => {
  const newCompletedDays = newCompleted ? 
    habit.completed_days + 1 : 
    habit.completed_days - 1;
  
  const newProgress = calculateAnnualProgress(newCompletedDays);

  const { error } = await supabase
    .from('default_habit_completions')
    .upsert({
      user_id: userId,
      habit_id: habit.id,
      completed: newCompleted,
      completed_days: newCompletedDays,
      progress: newProgress
    }, {
      onConflict: 'user_id,habit_id'
    });

  if (error) throw error;
};