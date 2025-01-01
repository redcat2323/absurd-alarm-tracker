import { supabase } from "@/integrations/supabase/client";

export const fetchDefaultHabitCompletions = async (userId: string) => {
  console.log('Fetching default habit completions for user:', userId);
  const { data, error } = await supabase
    .from('default_habit_completions')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching default habits:', error);
    throw error;
  }
  
  console.log('Fetched default habit completions:', data);
  return data || [];
};

export const fetchCustomHabits = async (userId: string) => {
  console.log('Fetching custom habits for user:', userId);
  const { data, error } = await supabase
    .from('custom_habits')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching custom habits:', error);
    throw error;
  }
  
  console.log('Fetched custom habits:', data);
  return data || [];
};

export const updateDefaultHabit = async (
  userId: string,
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  console.log('Updating default habit:', { userId, habitId, completed, completedDays, progress });
  
  // Primeiro, verificamos se já existe um registro
  const { data: existingData, error: fetchError } = await supabase
    .from('default_habit_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing habit:', fetchError);
    throw fetchError;
  }

  let result;
  if (!existingData) {
    // Se não existe, inserimos um novo registro
    result = await supabase
      .from('default_habit_completions')
      .insert([{
        user_id: userId,
        habit_id: habitId,
        completed,
        completed_days: completedDays,
        progress
      }]);
  } else {
    // Se existe, atualizamos o registro existente
    result = await supabase
      .from('default_habit_completions')
      .update({
        completed,
        completed_days: completedDays,
        progress
      })
      .eq('user_id', userId)
      .eq('habit_id', habitId);
  }

  if (result.error) {
    console.error('Error updating default habit:', result.error);
    throw result.error;
  }

  return result.data;
};

export const updateCustomHabit = async (
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  console.log('Updating custom habit:', { habitId, completed, completedDays, progress });
  const { data, error } = await supabase
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

  console.log('Custom habit updated successfully:', data);
  return data;
};

export const deleteCustomHabit = async (habitId: number) => {
  console.log('Deleting custom habit:', habitId);
  const { error } = await supabase
    .from('custom_habits')
    .delete()
    .eq('id', habitId);

  if (error) {
    console.error('Error deleting custom habit:', error);
    throw error;
  }
};