
import { useState, useEffect } from "react";
import { formatInTimeZone } from 'date-fns-tz';
import { startOfWeek, parseISO, endOfWeek, addWeeks } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

const TIMEZONE = 'America/Sao_Paulo';

export const useWeeklyBook = () => {
  const [book, setBook] = useState<WeeklyBook | null>(null);
  const [upcomingBooks, setUpcomingBooks] = useState<WeeklyBook[]>([]);

  const fetchBooks = async () => {
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

      // Encontra o sábado da semana atual
      const weekEnd = formatInTimeZone(
        endOfWeek(brazilianDateObj, { weekStartsOn: 0 }),
        TIMEZONE,
        'yyyy-MM-dd'
      );
      
      console.log('Data de início da semana (domingo):', weekStart);
      console.log('Data de fim da semana (sábado):', weekEnd);
      
      // Busca o livro atual
      const { data: currentBook, error: currentError } = await supabase
        .from("weekly_books")
        .select()
        .eq("week_start", weekStart)
        .maybeSingle();

      if (currentError) {
        console.error('Erro ao buscar livro da semana:', currentError);
        return;
      }

      setBook(currentBook);

      // Busca os próximos 2 livros
      const nextWeekStart = formatInTimeZone(
        addWeeks(parseISO(weekStart), 1),
        TIMEZONE,
        'yyyy-MM-dd'
      );

      const thirdWeekStart = formatInTimeZone(
        addWeeks(parseISO(weekStart), 2),
        TIMEZONE,
        'yyyy-MM-dd'
      );

      const { data: upcomingBooksData, error: upcomingError } = await supabase
        .from("weekly_books")
        .select()
        .in("week_start", [nextWeekStart, thirdWeekStart])
        .order('week_start', { ascending: true });

      if (upcomingError) {
        console.error('Erro ao buscar próximos livros:', upcomingError);
        return;
      }

      console.log('Próximos livros encontrados:', upcomingBooksData);
      setUpcomingBooks(upcomingBooksData || []);

    } catch (error) {
      console.error('Erro ao processar datas:', error);
    }
  };

  useEffect(() => {
    fetchBooks();

    // Atualiza à meia-noite para caso mude a semana
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchBooks();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { book, upcomingBooks };
};
