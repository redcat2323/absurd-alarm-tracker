
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyGoalsProps {
  userId: string;
}

interface DailyGoal {
  id: string;
  goal_date: string;
  authority_task: string;
  authority_description: string;
  authority_reference: string;
  audience_task: string;
  audience_description: string;
  audience_reference: string;
  offer_task: string;
  offer_description: string;
  offer_reference: string;
}

interface DailyCompletion {
  authority_completed: boolean;
  audience_completed: boolean;
  offer_completed: boolean;
}

export const DailyGoals = ({ userId }: DailyGoalsProps) => {
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [completion, setCompletion] = useState<DailyCompletion>({
    authority_completed: false,
    audience_completed: false,
    offer_completed: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), "dd 'de' MMMM", { locale: ptBR });

  useEffect(() => {
    fetchTodayGoals();
  }, [userId]);

  const fetchTodayGoals = async () => {
    try {
      // Buscar meta do dia
      const { data: goalData, error: goalError } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_date', today)
        .maybeSingle();

      if (goalError) throw goalError;

      // Se não existe meta para hoje, gerar uma
      if (!goalData) {
        await generateTodayGoal();
        return;
      }

      setDailyGoal(goalData);

      // Buscar completion do dia
      const { data: completionData, error: completionError } = await supabase
        .from('daily_goal_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_date', today)
        .maybeSingle();

      if (completionError) throw completionError;

      if (completionData) {
        setCompletion({
          authority_completed: completionData.authority_completed,
          audience_completed: completionData.audience_completed,
          offer_completed: completionData.offer_completed,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar metas do dia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas do dia",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTodayGoal = async () => {
    // Gerar meta baseada no cronograma do Desafio 10K
    const weekNumber = Math.floor((new Date().getTime() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    const currentWeek = Math.min(weekNumber % 12 || 12, 12);

    const sampleGoals = {
      authority_task: "Criar carrossel educativo sobre liberdade financeira",
      authority_description: "Desenvolver conteúdo que demonstre expertise e construa autoridade digital",
      authority_reference: "https://exemplo.com/template-carrossel",
      audience_task: "Publicar Reel com CTA para YouTube",
      audience_description: "Engajar audiência e direcionar tráfego para canal principal",
      audience_reference: "https://exemplo.com/script-reel",
      offer_task: "Escrever sequência de e-mail para lista VIP",
      offer_description: "Nutrir leads qualificados com conteúdo de valor",
      offer_reference: "https://exemplo.com/template-email"
    };

    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .insert({
          user_id: userId,
          goal_date: today,
          ...sampleGoals
        })
        .select()
        .single();

      if (error) throw error;
      setDailyGoal(data);
    } catch (error) {
      console.error('Erro ao gerar meta do dia:', error);
    }
  };

  const toggleCompletion = async (type: 'authority' | 'audience' | 'offer') => {
    const newCompletion = {
      ...completion,
      [`${type}_completed`]: !completion[`${type}_completed` as keyof DailyCompletion],
    };

    try {
      const { error } = await supabase
        .from('daily_goal_completions')
        .upsert({
          user_id: userId,
          goal_date: today,
          ...newCompletion,
          completion_timestamp: new Date().toISOString(),
        });

      if (error) throw error;

      setCompletion(newCompletion);

      // Feedback motivacional
      if (!completion[`${type}_completed` as keyof DailyCompletion]) {
        toast({
          title: "🎯 Meta Cumprida!",
          description: "+1 passo rumo à liberdade financeira",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar completion:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Carregando metas do dia...</div>;
  }

  if (!dailyGoal) {
    return <div className="text-center p-8">Gerando suas metas...</div>;
  }

  const goals = [
    {
      type: 'authority' as const,
      title: 'Autoridade',
      task: dailyGoal.authority_task,
      description: dailyGoal.authority_description,
      reference: dailyGoal.authority_reference,
      completed: completion.authority_completed,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      type: 'audience' as const,
      title: 'Audiência',
      task: dailyGoal.audience_task,
      description: dailyGoal.audience_description,
      reference: dailyGoal.audience_reference,
      completed: completion.audience_completed,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      type: 'offer' as const,
      title: 'Oferta',
      task: dailyGoal.offer_task,
      description: dailyGoal.offer_description,
      reference: dailyGoal.offer_reference,
      completed: completion.offer_completed,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Meta de Hoje</h2>
        <p className="text-muted-foreground">{todayFormatted}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.type} className={`${goal.color} transition-all duration-200 hover:shadow-md`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className={`${goal.iconColor} font-semibold`}>{goal.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCompletion(goal.type)}
                  className="h-8 w-8 p-0"
                >
                  {goal.completed ? (
                    <CheckCircle className={`h-5 w-5 ${goal.iconColor} fill-current`} />
                  ) : (
                    <Circle className={`h-5 w-5 ${goal.iconColor}`} />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">{goal.task}</h4>
                <p className="text-xs text-muted-foreground">{goal.description}</p>
              </div>
              
              {goal.reference && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => window.open(goal.reference, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Material de Referência
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2">
          <span className="text-sm font-medium">
            Progresso: {Object.values(completion).filter(Boolean).length}/3
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  Object.values(completion).filter(Boolean).length >= i
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
