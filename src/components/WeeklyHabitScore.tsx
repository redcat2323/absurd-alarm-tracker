
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { TrendingUp, Building, Crown, Zap, Users, Compass } from 'lucide-react';

interface WeeklyHabitScoreProps {
  userId: string;
}

const pillarIcons = {
  'trending-up': TrendingUp,
  'building': Building,
  'crown': Crown,
  'zap': Zap,
  'users': Users,
  'compass': Compass,
};

export const WeeklyHabitScore = ({ userId }: WeeklyHabitScoreProps) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Buscar pilares
  const { data: pillars } = useQuery({
    queryKey: ['big-plan-pillars'],
    queryFn: async () => {
      const { data } = await supabase
        .from('big_plan_pillars')
        .select('*')
        .order('sort_order');
      return data || [];
    },
  });

  // Buscar associações de hábitos padrão com pilares
  const { data: habitPillarAssociations } = useQuery({
    queryKey: ['habit-pillar-associations', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('default_habit_pillars')
        .select('*')
        .eq('user_id', userId);
      return data || [];
    },
  });

  // Buscar hábitos customizados
  const { data: customHabits } = useQuery({
    queryKey: ['custom-habits', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('custom_habits')
        .select('*')
        .eq('user_id', userId);
      return data || [];
    },
  });

  // Buscar completions da semana
  const { data: weeklyCompletions } = useQuery({
    queryKey: ['weekly-completions', userId, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('habit_daily_completions')
        .select('*')
        .eq('user_id', userId)
        .gte('completion_date', startDate)
        .lte('completion_date', endDate);
      
      return data || [];
    },
  });

  // Calcular pontuação por pilar
  const pillarScores = pillars?.map(pillar => {
    const defaultHabits = [1, 2, 3, 4, 5]; // IDs dos hábitos padrão
    const associatedHabits = habitPillarAssociations?.filter(
      assoc => assoc.pillar_id === pillar.id
    ).map(assoc => assoc.habit_id) || [];
    
    const associatedCustomHabits = customHabits?.filter(
      habit => habit.pillar_ids?.includes(pillar.id)
    ) || [];

    // Contar completions para este pilar na semana
    let completions = 0;
    let possibleCompletions = 0;

    daysInWeek.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayCompletions = weeklyCompletions?.filter(
        comp => comp.completion_date === dayStr
      ) || [];

      // Contar hábitos padrão associados a este pilar
      associatedHabits.forEach(habitId => {
        possibleCompletions++;
        if (dayCompletions.some(comp => comp.habit_id === habitId && !comp.is_custom_habit)) {
          completions++;
        }
      });

      // Contar hábitos customizados associados a este pilar
      associatedCustomHabits.forEach(habit => {
        possibleCompletions++;
        if (dayCompletions.some(comp => comp.habit_id === habit.id && comp.is_custom_habit)) {
          completions++;
        }
      });
    });

    const percentage = possibleCompletions > 0 ? Math.round((completions / possibleCompletions) * 100) : 0;

    return {
      ...pillar,
      completions,
      possibleCompletions,
      percentage,
    };
  }) || [];

  // Calcular média geral da semana
  const totalCompletions = pillarScores.reduce((sum, pillar) => sum + pillar.completions, 0);
  const totalPossible = pillarScores.reduce((sum, pillar) => sum + pillar.possibleCompletions, 0);
  const overallPercentage = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Placar Semanal - {format(weekStart, 'dd/MM')} a {format(weekEnd, 'dd/MM')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">{overallPercentage}%</div>
            <p className="text-muted-foreground">
              {totalCompletions} de {totalPossible} hábitos completados
            </p>
            <Progress value={overallPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillarScores.map((pillar) => {
          const IconComponent = pillarIcons[pillar.icon as keyof typeof pillarIcons] || TrendingUp;
          
          return (
            <Card key={pillar.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${pillar.color}20`, color: pillar.color }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm">{pillar.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: pillar.color }}>
                      {pillar.percentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pillar.completions}/{pillar.possibleCompletions} completados
                    </p>
                  </div>
                  <Progress value={pillar.percentage} className="h-1" />
                  {pillar.possibleCompletions === 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Nenhum hábito associado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
