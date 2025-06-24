
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';

interface WeeklyProgressProps {
  userId: string;
}

export const WeeklyProgress = ({ userId }: WeeklyProgressProps) => {
  const [weeklyStats, setWeeklyStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { progress: challengeProgress } = useChallengeProgress(userId);

  useEffect(() => {
    fetchWeeklyProgress();
  }, [userId]);

  const fetchWeeklyProgress = async () => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const dateStrings = daysInWeek.map(date => format(date, 'yyyy-MM-dd'));

      // Buscar completions da semana
      const { data: completions, error } = await supabase
        .from('daily_goal_completions')
        .select('*')
        .eq('user_id', userId)
        .in('goal_date', dateStrings);

      if (error) throw error;

      // Calcular estatísticas
      let totalCompleted = 0;
      const totalPossible = daysInWeek.length * 3; // 3 tarefas por dia

      completions?.forEach((completion) => {
        if (completion.authority_completed) totalCompleted++;
        if (completion.audience_completed) totalCompleted++;
        if (completion.offer_completed) totalCompleted++;
      });

      const completionRate = Math.round((totalCompleted / totalPossible) * 100);

      setWeeklyStats({
        totalTasks: totalPossible,
        completedTasks: totalCompleted,
        completionRate,
      });
    } catch (error) {
      console.error('Erro ao buscar progresso semanal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Carregando progresso...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Progresso Semanal */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            📊 Progresso da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Metas Estratégicas</span>
            <span className="font-semibold">
              {weeklyStats.completedTasks}/{weeklyStats.totalTasks}
            </span>
          </div>
          
          <Progress value={weeklyStats.completionRate} className="h-3" />
          
          <div className="text-center">
            <span className="text-2xl font-bold text-purple-700">
              {weeklyStats.completionRate}%
            </span>
            <p className="text-sm text-muted-foreground">
              Taxa de conclusão semanal
            </p>
          </div>

          {weeklyStats.completionRate >= 80 && (
            <div className="text-center p-2 bg-green-100 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                🎉 Semana excepcional! Você está dominando o jogo!
              </p>
            </div>
          )}

          {weeklyStats.completionRate >= 60 && weeklyStats.completionRate < 80 && (
            <div className="text-center p-2 bg-yellow-100 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                ⚡ Boa semana! Mantenha o foco nas metas estratégicas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progresso Rumo à Liberdade */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            🎯 Liberdade Conquistada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-700 mb-2">
              {challengeProgress.freedomProgress}%
            </div>
            <p className="text-sm text-emerald-600 mb-3">
              do caminho para a liberdade financeira
            </p>
            
            <Progress 
              value={challengeProgress.freedomProgress} 
              className="h-4 mb-3" 
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-emerald-100 rounded-lg p-2">
                <div className="font-semibold text-emerald-800">
                  {challengeProgress.streakDays}
                </div>
                <div className="text-emerald-600">dias seguidos</div>
              </div>
              <div className="bg-emerald-100 rounded-lg p-2">
                <div className="font-semibold text-emerald-800">
                  {challengeProgress.totalTasksCompleted}
                </div>
                <div className="text-emerald-600">metas cumpridas</div>
              </div>
            </div>
          </div>

          {challengeProgress.freedomProgress >= 75 && (
            <div className="text-center p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">
                🚀 Você está voando! A liberdade está cada vez mais próxima!
              </p>
            </div>
          )}

          {challengeProgress.streakDays >= 7 && (
            <div className="text-center p-2 bg-yellow-100 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                🔥 {challengeProgress.streakDays} dias de consistência! O hábito está se formando!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
