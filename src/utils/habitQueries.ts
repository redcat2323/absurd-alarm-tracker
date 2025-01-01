import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const fetchDefaultHabitCompletions = async (userId: string) => {
  const { data, error } = await supabase
    .from('default_habit_completions')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching default habits:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchCustomHabits = async (userId: string) => {
  const { data, error } = await supabase
    .from('custom_habits')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching custom habits:', error);
    throw error;
  }
  
  return data || [];
};

export const updateDefaultHabit = async (
  userId: string,
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  const { error } = await supabase
    .from('default_habit_completions')
    .upsert({
      user_id: userId,
      habit_id: habitId,
      completed,
      completed_days: completedDays,
      progress
    }, {
      onConflict: 'user_id,habit_id'
    });

  if (error) {
    console.error('Error updating default habit:', error);
    throw error;
  }
};

export const updateCustomHabit = async (
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  const { error } = await supabase
    .from('custom_habits')
    .update({
      completed,
      completed_days: completedDays,
      progress
    })
    .eq('id', habitId);

  if (error) {
    console.error('Error updating custom habit:', error);
    throw error;
  }
};

export const deleteCustomHabit = async (habitId: number) => {
  const { error } = await supabase
    .from('custom_habits')
    .delete()
    .eq('id', habitId);

  if (error) {
    console.error('Error deleting custom habit:', error);
    throw error;
  }
};