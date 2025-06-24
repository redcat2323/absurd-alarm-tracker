
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-800">Progresso da Semana</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Tarefas Completadas</span>
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
              🎉 Excelente semana! Você está no caminho certo!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
