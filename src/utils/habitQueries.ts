import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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

const checkHabitCompletionForToday = async (userId: string, habitId: number, isCustom: boolean) => {
  const today = new Date().toISOString().split('T')[0];
  const table = isCustom ? 'custom_habits' : 'default_habit_completions';
  const idField = isCustom ? 'id' : 'habit_id';

  const { data, error } = await supabase
    .from(table)
    .select('completed, updated_at')
    .eq('user_id', userId)
    .eq(idField, habitId)
    .single();

  if (error) {
    console.error('Error checking habit completion:', error);
    return false;
  }

  if (!data) return false;

  // Se o hábito já foi completado hoje, não permitir nova marcação
  if (data.completed && data.updated_at?.startsWith(today)) {
    toast({
      title: "Hábito já concluído",
      description: "Este hábito já foi concluído hoje. Volte amanhã!",
      variant: "destructive",
    });
    return true;
  }

  return false;
};

export const updateDefaultHabit = async (
  userId: string,
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  console.log('Updating default habit:', { userId, habitId, completed, completedDays, progress });

  // Verificar se o hábito já foi completado hoje
  if (completed && await checkHabitCompletionForToday(userId, habitId, false)) {
    return null;
  }
  
  const { data: existingData, error: fetchError } = await supabase
    .from('default_habit_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking existing habit:', fetchError);
    throw fetchError;
  }

  const today = new Date().toISOString();

  let result;
  if (!existingData) {
    result = await supabase
      .from('default_habit_completions')
      .insert([{
        user_id: userId,
        habit_id: habitId,
        completed,
        completed_days: completedDays,
        progress,
        updated_at: today
      }])
      .select()
      .single();
  } else {
    result = await supabase
      .from('default_habit_completions')
      .update({
        completed,
        completed_days: completedDays,
        progress,
        updated_at: today
      })
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error updating default habit:', result.error);
    throw result.error;
  }

  console.log('Default habit updated successfully:', result.data);
  return result.data;
};

export const updateCustomHabit = async (
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  console.log('Updating custom habit:', { habitId, completed, completedDays, progress });

  // Verificar se o hábito já foi completado hoje
  const { data: habitData } = await supabase
    .from('custom_habits')
    .select('user_id')
    .eq('id', habitId)
    .single();

  if (completed && await checkHabitCompletionForToday(habitData.user_id, habitId, true)) {
    return null;
  }

  const today = new Date().toISOString();

  const { data, error } = await supabase
    .from('custom_habits')
    .update({
      completed,
      completed_days: completedDays,
      progress,
      updated_at: today
    })
    .eq('id', habitId)
    .select()
    .single();

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