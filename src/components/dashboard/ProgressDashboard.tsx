
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressStats } from "./ProgressStats";
import { ProgressChart } from "./ProgressChart";
import { format, subDays, parseISO } from "date-fns";

interface ProgressDashboardProps {
  userId: string;
}

export const ProgressDashboard = ({ userId }: ProgressDashboardProps) => {
  // Buscar estatísticas gerais
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['progress-stats', userId],
    queryFn: async () => {
      // Buscar sequência atual
      const { data: currentStreak } = await supabase
        .from('habit_daily_completions')
        .select('completion_date')
        .eq('user_id', userId)
        .order('completion_date', { ascending: false });

      // Calcular sequência atual
      let streak = 0;
      if (currentStreak && currentStreak.length > 0) {
        const today = new Date();
        let currentDate = today;
        for (const completion of currentStreak) {
          const completionDate = new Date(completion.completion_date);
          if (format(completionDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')) {
            streak++;
            currentDate = subDays(currentDate, 1);
          } else {
            break;
          }
        }
      }

      // Calcular taxa de conclusão (últimos 30 dias)
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      // Buscar total de hábitos (padrão + customizados) atuais
      const { data: customHabits } = await supabase
        .from('custom_habits')
        .select('id')
        .eq('user_id', userId);
      
      const totalDefaultHabits = 5; // Número fixo de hábitos padrão
      const totalHabits = (customHabits?.length || 0) + totalDefaultHabits;
      
      // Buscar completions dos últimos 30 dias
      const { data: completions } = await supabase
        .from('habit_daily_completions')
        .select('completion_date, habit_id, is_custom_habit')
        .eq('user_id', userId)
        .gte('completion_date', thirtyDaysAgo)
        .order('completion_date', { ascending: false });

      // Agrupar completions por data
      const completionsByDate = completions?.reduce((acc, curr) => {
        const date = format(new Date(curr.completion_date), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = new Set();
        }
        // Use a unique identifier combining habit_id and is_custom_habit
        acc[date].add(`${curr.habit_id}-${curr.is_custom_habit}`);
        return acc;
      }, {} as Record<string, Set<string>>) || {};

      // Calcular taxa média de conclusão diária
      let totalCompletionRate = 0;
      let daysWithCompletions = 0;

      // Iterar pelos últimos 30 dias
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const completionsOnDay = completionsByDate[date]?.size || 0;
        
        if (completionsOnDay > 0) {
          // Calcular a taxa para este dia (limitada a 100%)
          const dayRate = Math.min((completionsOnDay / totalHabits) * 100, 100);
          totalCompletionRate += dayRate;
          daysWithCompletions++;
        }
      }

      // Calcular a média apenas para os dias em que houve completions
      const averageCompletionRate = daysWithCompletions > 0
        ? Math.round(totalCompletionRate / daysWithCompletions)
        : 0;

      return {
        currentStreak: streak,
        bestStreak: streak, // Por enquanto igual à sequência atual
        completionRate: averageCompletionRate,
        totalHabits: totalHabits,
      };
    },
  });

  // Buscar dados do gráfico (últimos 30 dias)
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['progress-chart', userId],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data: completions } = await supabase
        .from('habit_daily_completions')
        .select('completion_date, habit_id, is_custom_habit')
        .eq('user_id', userId)
        .gte('completion_date', thirtyDaysAgo)
        .order('completion_date', { ascending: true });

      // Agrupar completions por data, contando apenas completions únicas
      const groupedCompletions: Record<string, Set<string>> = {};
      
      completions?.forEach(completion => {
        const date = completion.completion_date;
        if (!groupedCompletions[date]) {
          groupedCompletions[date] = new Set();
        }
        // Usar um identificador único que combina o ID do hábito e se é personalizado
        groupedCompletions[date].add(`${completion.habit_id}-${completion.is_custom_habit}`);
      });

      // Converter para o formato esperado pelo gráfico
      const chartDataPoints = Object.keys(groupedCompletions).map(date => ({
        date,
        completed: groupedCompletions[date].size
      }));

      // Ordenar por data
      chartDataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Criar array dos últimos 30 dias com os dados existentes
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
        const existing = chartDataPoints.find(item => item.date === date);
        return existing || { date, completed: 0 };
      });

      return last30Days;
    },
  });

  if (statsLoading || chartLoading) {
    return <div>Carregando...</div>;
  }

  if (!stats || !chartData) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <ProgressStats
        currentStreak={stats.currentStreak}
        bestStreak={stats.bestStreak}
        completionRate={stats.completionRate}
      />
      <ProgressChart 
        data={chartData} 
        totalHabits={stats.totalHabits}
      />
    </div>
  );
};
