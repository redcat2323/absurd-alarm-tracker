import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateAnnualProgress } from "@/utils/habitProgress";

export const toggleDefaultHabit = async (
  userId: string,
  habitId: number,
  currentCompleted: boolean,
  currentCompletedDays: number
) => {
  const newCompletedDays = currentCompleted ? 
    currentCompletedDays - 1 : 
    currentCompletedDays + 1;
  
  const newProgress = calculateAnnualProgress(newCompletedDays);
  console.log('Updating default habit with:', { completed: !currentCompleted, completedDays: newCompletedDays, progress: newProgress });

  const result = await updateDefaultHabit(
    userId,
    habitId,
    !currentCompleted,
    newCompletedDays,
    newProgress
  );
  
  return result;
};

export const toggleCustomHabit = async (
  habitId: number,
  currentCompleted: boolean,
  currentCompletedDays: number
) => {
  const newCompletedDays = currentCompleted ? 
    currentCompletedDays - 1 : 
    currentCompletedDays + 1;
  
  const newProgress = calculateAnnualProgress(newCompletedDays);
  console.log('Updating custom habit with:', { completed: !currentCompleted, completedDays: newCompletedDays, progress: newProgress });

  const result = await updateCustomHabit(
    habitId,
    !currentCompleted,
    newCompletedDays,
    newProgress
  );
  
  return result;
};

export const updateDefaultHabit = async (
  userId: string,
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  const { data, error } = await supabase
    .from('default_habit_completions')
    .upsert({
      user_id: userId,
      habit_id: habitId,
      completed,
      completed_days: completedDays,
      progress,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCustomHabit = async (
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  const { data, error } = await supabase
    .from('custom_habits')
    .update({
      completed,
      completed_days: completedDays,
      progress,
      updated_at: new Date().toISOString()
    })
    .eq('id', habitId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCustomHabit = async (id: number) => {
  const { error } = await supabase
    .from('custom_habits')
    .delete()
    .eq('id', id);

  if (error) throw error;
};