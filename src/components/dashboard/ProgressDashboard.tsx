
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressStats } from "./ProgressStats";
import { ProgressChart } from "./ProgressChart";
import { format, subDays, parseISO, addDays, isEqual } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface ProgressDashboardProps {
  userId: string;
}

export const ProgressDashboard = ({ userId }: ProgressDashboardProps) => {
  // Buscar estatísticas gerais
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['progress-stats', userId],
    queryFn: async () => {
      // Timezone para Brasil (São Paulo)
      const timeZone = "America/Sao_Paulo";
      
      // Data atual no formato correto
      const today = format(toZonedTime(new Date(), timeZone), 'yyyy-MM-dd');
      
      // Buscar completions organizadas por data
      const { data: completions } = await supabase
        .from('habit_daily_completions')
        .select('completion_date, habit_id, is_custom_habit')
        .eq('user_id', userId)
        .order('completion_date', { ascending: false });

      // Buscar total de hábitos (padrão + customizados) atuais
      const { data: customHabits } = await supabase
        .from('custom_habits')
        .select('id')
        .eq('user_id', userId);
      
      const totalDefaultHabits = 5; // Número fixo de hábitos padrão
      const totalHabits = (customHabits?.length || 0) + totalDefaultHabits;

      // Agrupar completions por data
      const completionsByDate = completions?.reduce((acc, curr) => {
        const date = curr.completion_date;
        if (!acc[date]) {
          acc[date] = new Set();
        }
        acc[date].add(`${curr.habit_id}-${curr.is_custom_habit}`);
        return acc;
      }, {} as Record<string, Set<string>>) || {};

      // Calcular sequência atual - MODIFICAÇÃO AQUI
      let currentStreak = 0;
      let checkDate = today;
      let dateToCheck;
      
      // Continuar verificando dias consecutivos
      do {
        dateToCheck = checkDate;
        const completionsOnDay = completionsByDate[dateToCheck]?.size || 0;
        
        // Verificar se TODOS os hábitos foram completados neste dia
        // Se o número de completions for igual ao número total de hábitos, então todos foram completados
        if (completionsOnDay >= totalHabits) {
          currentStreak++;
          // Mover para o dia anterior
          checkDate = format(subDays(new Date(checkDate), 1), 'yyyy-MM-dd');
        } else {
          // Se não completou todos os hábitos para este dia, a sequência termina
          break;
        }
      } while (true);

      // Calcular melhor sequência (histórico) - MODIFICAÇÃO AQUI TAMBÉM
      let bestStreak = 0;
      let currentBestStreak = 0;
      
      // Ordene as datas das completions
      const sortedDates = Object.keys(completionsByDate).sort();
      
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i];
        const completionsOnDay = completionsByDate[currentDate]?.size || 0;
        
        // Verificar se TODOS os hábitos foram completados neste dia
        const allHabitsCompleted = completionsOnDay >= totalHabits;
        
        if (allHabitsCompleted) {
          // Se é o primeiro dia ou é consecutivo ao anterior
          if (i === 0 || isConsecutiveDay(sortedDates[i-1], currentDate)) {
            currentBestStreak++;
          } else {
            // Reiniciar contagem
            currentBestStreak = 1;
          }
          
          // Atualizar melhor sequência se a atual for maior
          if (currentBestStreak > bestStreak) {
            bestStreak = currentBestStreak;
          }
        } else {
          // Se não completou todos os hábitos, reiniciar a contagem
          currentBestStreak = 0;
        }
      }

      // Função para verificar se duas datas são consecutivas
      function isConsecutiveDay(date1: string, date2: string): boolean {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const nextDay = addDays(d2, 1);
        return format(d1, 'yyyy-MM-dd') === format(nextDay, 'yyyy-MM-dd');
      }

      // Calcular taxa média de conclusão diária (últimos 30 dias)
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
        currentStreak,
        bestStreak: Math.max(bestStreak, currentStreak), // Garante que o melhor seja pelo menos o atual
        completionRate: averageCompletionRate,
        totalHabits,
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
