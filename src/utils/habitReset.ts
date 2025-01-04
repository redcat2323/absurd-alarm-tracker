import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

export const checkAndResetHabits = async (userId: string) => {
  // Configura o fuso horário de São Paulo
  const timeZone = "America/Sao_Paulo";
  
  // Obtém a data atual no fuso horário de São Paulo
  const now = new Date();
  const spTime = zonedTimeToUtc(now, timeZone);
  
  const lastCheck = localStorage.getItem('lastHabitCheck');
  const currentDay = format(spTime, 'yyyy-MM-dd');
  
  if (lastCheck !== currentDay) {
    console.log('Resetando hábitos para o novo dia:', currentDay, '(Horário de São Paulo)');
    
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