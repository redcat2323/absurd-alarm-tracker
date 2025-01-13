import { useState, useEffect } from "react";
import { formatInTimeZone } from 'date-fns-tz';
import { startOfWeek, parseISO } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

const TIMEZONE = 'America/Sao_Paulo';

export const useWeeklyBook = () => {
  const [book, setBook] = useState<WeeklyBook | null>(null);

  const fetchWeeklyBook = async () => {
    try {
      // Pega a data atual em UTC e converte para Brasília
      const now = new Date();
      const brazilianDate = formatInTimeZone(now, TIMEZONE, 'yyyy-MM-dd');
      console.log('Data atual (Brasília):', brazilianDate);
      
      // Converte a string da data para objeto Date
      const brazilianDateObj = parseISO(brazilianDate);
      
      // Encontra o domingo da semana atual
      const weekStart = formatInTimeZone(
        startOfWeek(brazilianDateObj, { weekStartsOn: 0 }),
        TIMEZONE,
        'yyyy-MM-dd'
      );
      
      console.log('Data de início da semana (domingo):', weekStart);
      
      // Busca o livro que tem week_start maior ou igual à data atual
      // e menor que a próxima semana
      const { data, error } = await supabase
        .from("weekly_books")
        .select()
        .gte("week_start", weekStart)
        .lt("week_start", formatInTimeZone(
          new Date(brazilianDateObj.getTime() + 7 * 24 * 60 * 60 * 1000),
          TIMEZONE,
          'yyyy-MM-dd'
        ))
        .order('week_start', { ascending: true })
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar livro da semana:', error);
        return;
      }

      console.log('Livro da semana encontrado:', data);
      setBook(data);
    } catch (error) {
      console.error('Erro ao processar datas:', error);
    }
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