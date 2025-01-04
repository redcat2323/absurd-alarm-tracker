import { supabase } from "@/integrations/supabase/client";

export const checkAndResetHabits = async (userId: string) => {
  // Verifica se já passou da meia-noite desde a última verificação
  const now = new Date();
  const lastCheck = localStorage.getItem('lastHabitCheck');
  const currentDay = now.toISOString().split('T')[0];
  
  if (lastCheck !== currentDay) {
    console.log('Resetando hábitos para o novo dia:', currentDay);
    
    // Atualiza hábitos padrão
    await supabase
      .from('default_habit_completions')
      .update({ completed: false })
      .eq('user_id', userId);

    // Atualiza hábitos personalizados
    await supabase
      .from('custom_habits')
      .update({ completed: false })
      .eq('user_id', userId);

    // Atualiza o timestamp da última verificação
    localStorage.setItem('lastHabitCheck', currentDay);
  }
};