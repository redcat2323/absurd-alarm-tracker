import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const wasHabitCompletedToday = async (habitId: number, isCustom: boolean) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const table = isCustom ? 'custom_habits' : 'default_habit_completions';
  const idField = isCustom ? 'id' : 'habit_id';

  const { data, error } = await supabase
    .from(table)
    .select('updated_at, completed')
    .eq(idField, habitId)
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

export const toggleDefaultHabit = async (
  userId: string,
  habitId: number,
  currentCompleted: boolean,
  currentCompletedDays: number
) => {
  // Se estiver tentando marcar como concluído, verifica primeiro
  if (!currentCompleted) {
    const alreadyCompletedToday = await wasHabitCompletedToday(habitId, false);
    if (alreadyCompletedToday) {
      toast({
        title: "Hábito já concluído",
        description: "Este hábito já foi concluído hoje. Volte amanhã!",
        variant: "destructive",
      });
      return null;
    }
  }

  const newCompletedDays = currentCompleted ? 
    currentCompletedDays - 1 : 
    currentCompletedDays + 1;
  
  const newProgress = (newCompletedDays / 365) * 100;

  const { data, error } = await supabase
    .from('default_habit_completions')
    .upsert({
      user_id: userId,
      habit_id: habitId,
      completed: !currentCompleted,
      completed_days: newCompletedDays,
      progress: newProgress,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const toggleCustomHabit = async (
  habitId: number,
  currentCompleted: boolean,
  currentCompletedDays: number
) => {
  // Se estiver tentando marcar como concluído, verifica primeiro
  if (!currentCompleted) {
    const alreadyCompletedToday = await wasHabitCompletedToday(habitId, true);
    if (alreadyCompletedToday) {
      toast({
        title: "Hábito já concluído",
        description: "Este hábito já foi concluído hoje. Volte amanhã!",
        variant: "destructive",
      });
      return null;
    }
  }

  const newCompletedDays = currentCompleted ? 
    currentCompletedDays - 1 : 
    currentCompletedDays + 1;
  
  const newProgress = (newCompletedDays / 365) * 100;

  const { data, error } = await supabase
    .from('custom_habits')
    .update({
      completed: !currentCompleted,
      completed_days: newCompletedDays,
      progress: newProgress,
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