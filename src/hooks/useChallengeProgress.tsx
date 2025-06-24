
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

interface ChallengeProgress {
  dailyCompletionRate: number;
  weeklyCompletionRate: number;
  totalTasksCompleted: number;
  streakDays: number;
  freedomProgress: number; // Progresso geral rumo à liberdade (0-100%)
}

export const useChallengeProgress = (userId: string) => {
  const [progress, setProgress] = useState<ChallengeProgress>({
    dailyCompletionRate: 0,
    weeklyCompletionRate: 0,
    totalTasksCompleted: 0,
    streakDays: 0,
    freedomProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchChallengeProgress();
    }
  }, [userId]);

  const fetchChallengeProgress = async () => {
    try {
      // Buscar completions dos últimos 30 dias
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data: completions, error } = await supabase
        .from('daily_goal_completions')
        .select('*')
        .eq('user_id', userId)
        .gte('goal_date', thirtyDaysAgo)
        .order('goal_date', { ascending: false });

      if (error) throw error;

      if (!completions || completions.length === 0) {
        setIsLoading(false);
        return;
      }

      // Calcular estatísticas
      let totalTasks = 0;
      let completedTasks = 0;
      let streakDays = 0;
      let consecutiveComplete = true;

      // Agrupar por data para análise diária
      const dailyStats = completions.reduce((acc, completion) => {
        const date = completion.goal_date;
        if (!acc[date]) {
          acc[date] = {
            authority: false,
            audience: false,
            offer: false,
          };
        }
        acc[date].authority = completion.authority_completed;
        acc[date].audience = completion.audience_completed;
        acc[date].offer = completion.offer_completed;
        return acc;
      }, {} as Record<string, { authority: boolean; audience: boolean; offer: boolean }>);

      // Analisar cada dia
      const sortedDates = Object.keys(dailyStats).sort().reverse();
      
      for (const date of sortedDates) {
        const dayStats = dailyStats[date];
        const dayCompleted = dayStats.authority && dayStats.audience && dayStats.offer;
        
        totalTasks += 3; // 3 tarefas por dia
        completedTasks += [dayStats.authority, dayStats.audience, dayStats.offer].filter(Boolean).length;
        
        // Calcular streak (dias consecutivos com 100% de completude)
        if (dayCompleted && consecutiveComplete) {
          streakDays++;
        } else {
          consecutiveComplete = false;
        }
      }

      // Calcular taxas
      const dailyCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Progresso da liberdade baseado na consistência e completude
      // Fórmula: (taxa de conclusão * 0.7) + (streak de dias * 0.3)
      const maxStreak = 30; // Máximo de 30 dias considerados
      const streakScore = Math.min((streakDays / maxStreak) * 100, 100);
      const freedomProgress = Math.round((dailyCompletionRate * 0.7) + (streakScore * 0.3));

      setProgress({
        dailyCompletionRate,
        weeklyCompletionRate: dailyCompletionRate, // Simplificado por ora
        totalTasksCompleted: completedTasks,
        streakDays,
        freedomProgress: Math.min(freedomProgress, 100),
      });

    } catch (error) {
      console.error('Erro ao buscar progresso do desafio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { progress, isLoading, refreshProgress: fetchChallengeProgress };
};
