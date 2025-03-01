
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
  const { data: stats } = useQuery({
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
      
      // Buscar total de hábitos (padrão + customizados)
      const { data: customHabits } = await supabase
        .from('custom_habits')
        .select('id')
        .eq('user_id', userId);
      
      const totalDefaultHabits = 5; // Número fixo de hábitos padrão
      const totalHabits = (customHabits?.length || 0) + totalDefaultHabits;
      
      // Buscar completions dos últimos 30 dias
      const { data: completions } = await supabase
        .from('habit_daily_completions')
        .select('completion_date')
        .eq('user_id', userId)
        .gte('completion_date', thirtyDaysAgo)
        .order('completion_date', { ascending: false });

      // Agrupar completions por data
      const completionsByDate = completions?.reduce((acc, curr) => {
        const date = format(new Date(curr.completion_date), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Calcular taxa média de conclusão diária
      let totalCompletionRate = 0;
      let daysWithCompletions = 0;

      // Iterar pelos últimos 30 dias
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const completionsOnDay = completionsByDate[date] || 0;
        
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
      };
    },
  });

  // Buscar dados do gráfico (últimos 30 dias)
  const { data: chartData } = useQuery({
    queryKey: ['progress-chart', userId],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data: completions } = await supabase
        .from('habit_daily_completions')
        .select('completion_date')
        .eq('user_id', userId)
        .gte('completion_date', thirtyDaysAgo)
        .order('completion_date', { ascending: true });

      // Agrupar completions por data
      const groupedCompletions = completions?.reduce((acc, curr) => {
        const date = curr.completion_date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Criar array dos últimos 30 dias
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
        return {
          date,
          completed: groupedCompletions[date] || 0,
        };
      });

      return last30Days;
    },
  });

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
      <ProgressChart data={chartData} />
    </div>
  );
};
