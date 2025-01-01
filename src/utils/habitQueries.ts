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

const wasHabitCompletedToday = async (habitId: number, userId: string, isCustom: boolean) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const table = isCustom ? 'custom_habits' : 'default_habit_completions';
  const idField = isCustom ? 'id' : 'habit_id';

  const { data, error } = await supabase
    .from(table)
    .select('updated_at, completed')
    .eq(idField, habitId)
    .eq(isCustom ? 'user_id' : 'user_id', userId)
    .eq('completed', true)
    .single();

  if (error) {
    console.error('Error checking habit completion:', error);
    return false;
  }

  if (!data?.updated_at) return false;

  const lastUpdate = new Date(data.updated_at);
  lastUpdate.setHours(0, 0, 0, 0);
  
  return lastUpdate.getTime() === today.getTime();
};

const isNewYear = () => {
  const now = new Date();
  return now.getMonth() === 0 && now.getDate() === 1;
};

export const updateDefaultHabit = async (
  userId: string,
  habitId: number,
  completed: boolean,
  completedDays: number,
  progress: number
) => {
  // Se for primeiro dia do ano, reseta a contagem
  if (isNewYear()) {
    completedDays = completed ? 1 : 0;
    progress = completed ? (1/365) * 100 : 0;
  }
  
  // Se estiver tentando marcar como concluído, verifica primeiro
  if (completed) {
    const alreadyCompletedToday = await wasHabitCompletedToday(habitId, userId, false);
    if (alreadyCompletedToday) {
      toast({
        title: "Hábito já concluído",
        description: "Este hábito já foi concluído hoje. Volte amanhã!",
        variant: "destructive",
      });
      return null;
    }
  }

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
  // Primeiro, busca o user_id do hábito
  const { data: habitData } = await supabase
    .from('custom_habits')
    .select('user_id, created_at')
    .eq('id', habitId)
    .single();

  if (!habitData) {
    throw new Error('Hábito não encontrado');
  }

  // Se for primeiro dia do ano, reseta a contagem
  if (isNewYear()) {
    completedDays = completed ? 1 : 0;
    progress = completed ? (1/365) * 100 : 0;
  }

  // Se estiver tentando marcar como concluído, verifica primeiro
  if (completed) {
    const alreadyCompletedToday = await wasHabitCompletedToday(habitId, habitData.user_id, true);
    if (alreadyCompletedToday) {
      toast({
        title: "Hábito já concluído",
        description: "Este hábito já foi concluído hoje. Volte amanhã!",
        variant: "destructive",
      });
      return null;
    }
  }

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