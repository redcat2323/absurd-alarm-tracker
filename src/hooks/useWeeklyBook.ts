import { useState, useEffect } from "react";
import { formatInTimeZone } from 'date-fns-tz';
import { startOfWeek } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

const TIMEZONE = 'America/Sao_Paulo';

export const useWeeklyBook = () => {
  const [book, setBook] = useState<WeeklyBook | null>(null);

  const fetchWeeklyBook = async () => {
    const now = new Date();
    const brazilianDate = formatInTimeZone(now, TIMEZONE, 'yyyy-MM-dd');
    const weekStart = formatInTimeZone(
      startOfWeek(new Date(brazilianDate), { weekStartsOn: 0 }), 
      TIMEZONE, 
      'yyyy-MM-dd'
    );
    
    console.log('Data atual (Brasília):', brazilianDate);
    console.log('Início da semana (domingo):', weekStart);
    
    const { data, error } = await supabase
      .from("weekly_books")
      .select()
      .eq("week_start", weekStart)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar livro da semana:', error);
      return;
    }

    console.log('Livro da semana encontrado:', data);
    setBook(data);
  };

  useEffect(() => {
    fetchWeeklyBook();

    // Atualiza à meia-noite para caso mude a semana
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchWeeklyBook();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { book };
};