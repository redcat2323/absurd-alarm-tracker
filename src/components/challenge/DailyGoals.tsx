
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
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0; // Domingo é dia de descanso

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
      if (!goalData && !isWeekend) {
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
    // Calcular qual semana do desafio estamos (baseado no início em 2025)
    const challengeStart = new Date('2025-01-06'); // Segunda-feira da primeira semana
    const daysDiff = Math.floor((new Date().getTime() - challengeStart.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.floor(daysDiff / 7) % 12 + 1; // Ciclo de 12 semanas
    
    // Buscar tema da semana
    const { data: scheduleData } = await supabase
      .from('challenge_schedule')
      .select('*')
      .eq('week_number', weekNumber)
      .single();

    const focusTheme = scheduleData?.focus_theme || 'Desenvolvimento Digital';

    // Base de tarefas estratégicas por tipo
    const authorityTasks = [
      {
        task: "Criar carrossel: 'O Instagram não te deve nada'",
        description: "Provocar e educar sobre mentalidade empreendedora, atraindo audiência que romantiza dependência de algoritmos",
        reference: "https://exemplo.com/template-carrossel-mentalidade"
      },
      {
        task: "Postar vídeo YouTube sobre liberdade financeira",
        description: "Construir autoridade educativa e capturar audiência qualificada interessada em independência",
        reference: "https://exemplo.com/roteiro-youtube-liberdade"
      },
      {
        task: "Carrossel técnico: Como começar do zero",
        description: "Demonstrar expertise através de conteúdo didático, posicionando-se como referência para iniciantes",
        reference: "https://exemplo.com/template-passo-a-passo"
      }
    ];

    const audienceTasks = [
      {
        task: "Reel viral com CTA para YouTube",
        description: "Expandir alcance orgânico e direcionar tráfego qualificado para conteúdo de autoridade no canal",
        reference: "https://exemplo.com/script-reel-viral"
      },
      {
        task: "Story série: 'Bastidores da construção'",
        description: "Humanizar marca pessoal e criar conexão emocional, aumentando engajamento e retenção",
        reference: "https://exemplo.com/roteiro-stories-bastidores"
      },
      {
        task: "Post engajamento: Pergunta estratégica",
        description: "Gerar interação qualificada para aumentar alcance e identificar dores da audiência",
        reference: "https://exemplo.com/perguntas-estrategicas"
      }
    ];

    const offerTasks = [
      {
        task: "Sequência de email: Nurturing VIP",
        description: "Nutrir leads qualificados com conteúdo de valor, preparando para conversão futura",
        reference: "https://exemplo.com/sequencia-email-vip"
      },
      {
        task: "Story com prova social",
        description: "Demonstrar resultados e credibilidade através de depoimentos, aumentando desejo pela oferta",
        reference: "https://exemplo.com/template-prova-social"
      },
      {
        task: "Live: Sessão de dúvidas + oferta",
        description: "Criar urgência e escassez através de interação ao vivo, convertendo audiência em clientes",
        reference: "https://exemplo.com/roteiro-live-conversao"
      }
    ];

    // Selecionar tarefas baseadas no dia da semana para variedade
    const dayIndex = new Date().getDay();
    const selectedAuthority = authorityTasks[dayIndex % authorityTasks.length];
    const selectedAudience = audienceTasks[dayIndex % audienceTasks.length];
    const selectedOffer = offerTasks[dayIndex % offerTasks.length];

    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .insert({
          user_id: userId,
          goal_date: today,
          authority_task: selectedAuthority.task,
          authority_description: selectedAuthority.description,
          authority_reference: selectedAuthority.reference,
          audience_task: selectedAudience.task,
          audience_description: selectedAudience.description,
          audience_reference: selectedAudience.reference,
          offer_task: selectedOffer.task,
          offer_description: selectedOffer.description,
          offer_reference: selectedOffer.reference,
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

      // Feedback motivacional estratégico
      if (!completion[`${type}_completed` as keyof DailyCompletion]) {
        const motivationalMessages = {
          authority: "🎯 +1 Autoridade Digital conquistada!",
          audience: "📈 +1 Audiência expandida!",
          offer: "💰 +1 Passo rumo à conversão!"
        };
        
        toast({
          title: motivationalMessages[type],
          description: "Liberdade financeira se constrói um dia de cada vez",
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

  // Mensagem para domingo (dia de descanso)
  if (isWeekend) {
    return (
      <div className="text-center p-8 space-y-4">
        <h2 className="text-2xl font-bold">Domingo é Dia de Descanso 🌅</h2>
        <p className="text-muted-foreground">
          Use este tempo para planejar a semana, estudar ou simplesmente relaxar. 
          Liberdade também é ter tempo livre!
        </p>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
          <p className="text-sm font-medium text-purple-800">
            💡 Dica: Revise suas metas da semana passada e prepare-se mentalmente para os próximos desafios
          </p>
        </div>
      </div>
    );
  }

  if (!dailyGoal) {
    return <div className="text-center p-8">Gerando suas metas estratégicas...</div>;
  }

  const goals = [
    {
      type: 'authority' as const,
      title: 'Autoridade Digital',
      task: dailyGoal.authority_task,
      description: dailyGoal.authority_description,
      reference: dailyGoal.authority_reference,
      completed: completion.authority_completed,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      emoji: '🎯'
    },
    {
      type: 'audience' as const,
      title: 'Expansão de Audiência',
      task: dailyGoal.audience_task,
      description: dailyGoal.audience_description,
      reference: dailyGoal.audience_reference,
      completed: completion.audience_completed,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      emoji: '📈'
    },
    {
      type: 'offer' as const,
      title: 'Otimização de Oferta',
      task: dailyGoal.offer_task,
      description: dailyGoal.offer_description,
      reference: dailyGoal.offer_reference,
      completed: completion.offer_completed,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      emoji: '💰'
    },
  ];

  const completedCount = Object.values(completion).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / 3) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Meta Estratégica de Hoje</h2>
        <p className="text-muted-foreground">{todayFormatted}</p>
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-3">
          <p className="text-sm font-medium text-purple-800">
            🚀 Cada meta cumprida te aproxima da liberdade financeira
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.type} className={`${goal.color} transition-all duration-200 hover:shadow-md ${goal.completed ? 'ring-2 ring-green-400' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className={`${goal.iconColor} font-semibold flex items-center gap-2`}>
                  <span>{goal.emoji}</span>
                  {goal.title}
                </span>
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
                <h4 className="font-medium text-sm mb-2">{goal.task}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{goal.description}</p>
              </div>
              
              {goal.reference && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => window.open(goal.reference, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Material Estratégico
                </Button>
              )}

              {goal.completed && (
                <div className="text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Meta Conquistada
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barra de Progresso da Liberdade */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 space-y-4">
        <div className="text-center">
          <h3 className="font-semibold text-purple-800 mb-2">Progresso do Dia - Rumo à Liberdade</h3>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl font-bold text-purple-700">{progressPercentage}%</span>
            <span className="text-sm text-purple-600">({completedCount}/3 metas)</span>
          </div>
          
          {/* Barra de progresso visual */}
          <div className="w-full bg-purple-200 rounded-full h-3 mb-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Feedback baseado no progresso */}
          {progressPercentage === 100 && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
              <p className="text-green-800 font-medium">
                🎉 Parabéns! Dia 100% conquistado - Você está construindo sua liberdade!
              </p>
            </div>
          )}
          
          {progressPercentage >= 66 && progressPercentage < 100 && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <p className="text-yellow-800 font-medium">
                ⚡ Quase lá! Mais uma meta e seu dia estará completo
              </p>
            </div>
          )}

          {progressPercentage < 66 && progressPercentage > 0 && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-800 font-medium">
                🚀 Bom começo! Continue focado nas suas metas estratégicas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
