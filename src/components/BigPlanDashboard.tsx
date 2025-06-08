import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Building, Crown, Zap, Users, Compass, MessageSquare } from 'lucide-react';
import { PillarGoalsModal } from './bigplan/PillarGoalsModal';
import { QuarterlyReflectionModal } from './bigplan/QuarterlyReflectionModal';
import { LoadSampleGoals } from './bigplan/LoadSampleGoals';

interface BigPlanDashboardProps {
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

const pillarContent = {
  'Mapa de Riqueza': {
    emoji: '🟩',
    mission: 'Construir independência financeira por meio de planejamento inteligente, renda passiva e multiplicação patrimonial.',
    goals: [
      'Aumentar patrimônio líquido para R$ 1M',
      'Criar 3 fontes de renda passiva',
      'Automatizar e revisar plano financeiro anual'
    ],
    habits: [
      'Revisar investimentos semanalmente',
      'Ler 1 livro de finanças por mês'
    ]
  },
  'Negócio sem Fundador': {
    emoji: '🟦',
    mission: 'Criar sistemas, times e processos que permitem que o negócio funcione sem depender de mim.',
    goals: [
      'Automatizar 70% do suporte ao cliente',
      'Estruturar time de liderança operacional',
      'Criar playbooks replicáveis de vendas'
    ],
    habits: [
      'Delegar 1 tarefa com processo documentado por semana',
      'Revisar o organograma toda quinzena'
    ]
  },
  'Legado e Posicionamento Pessoal': {
    emoji: '🟧',
    mission: 'Construir uma presença que inspire, ensine e influencie positivamente o mundo, deixando uma marca duradoura.',
    goals: [
      'Gravar 365 vídeos autorais no ano',
      'Escrever e publicar um livro',
      'Atingir 100 mil seguidores com conteúdo transformador'
    ],
    habits: [
      'Gravar 1 vídeo por dia',
      'Publicar conteúdo profundo toda semana'
    ]
  },
  'Corpo e Mente de Alta Performance': {
    emoji: '🟥',
    mission: 'Sustentar energia, foco e clareza mental de elite para executar com intensidade e consistência.',
    goals: [
      'Atingir 12% de gordura corporal com saúde',
      'Dormir 7h30 por noite durante 90% do ano',
      'Eliminar picos de estresse e ansiedade com práticas diárias'
    ],
    habits: [
      'Fazer exercícios físicos diários',
      'Meditar ou fazer devocional todos os dias'
    ]
  },
  'Rede Estratégica': {
    emoji: '🟪',
    mission: 'Construir relações de valor com pessoas que elevam minha visão, geram oportunidades e criam conexões de longo prazo.',
    goals: [
      'Participar de 2 masterminds relevantes no ano',
      'Conectar com 10 players estratégicos da minha área',
      'Criar um conselho de mentores pessoal'
    ],
    habits: [
      'Enviar 1 mensagem de valor por dia a alguém da rede',
      'Agendar 1 call estratégica por semana'
    ]
  },
  'Liberdade Definida': {
    emoji: '🟦',
    mission: 'Projetar e viver um estilo de vida intencional, com clareza do que quero manter, eliminar e experimentar ao longo da jornada.',
    goals: [
      'Viver 1 mês por ano em outro país como teste de liberdade',
      'Ter rotina de 25h/semana de trabalho até 2030',
      'Criar mapa de vida ideal: onde, como, com quem'
    ],
    habits: [
      'Planejar a semana ideal todo domingo',
      'Revisar minha visão de vida 1x por mês'
    ]
  }
};

export const BigPlanDashboard = ({ userId }: BigPlanDashboardProps) => {
  const [selectedPillar, setSelectedPillar] = useState<any>(null);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);

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

  // Buscar metas anuais do usuário
  const { data: annualGoals } = useQuery({
    queryKey: ['annual-goals', userId],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data } = await supabase
        .from('pillar_annual_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('year', currentYear);
      return data || [];
    },
  });

  // Calcular progresso geral
  const overallProgress = annualGoals?.length 
    ? Math.round(annualGoals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0) / annualGoals.length)
    : 0;

  const handlePillarClick = (pillar: any) => {
    setSelectedPillar(pillar);
    setShowGoalsModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Carregar Metas de Exemplo - só aparece se não há metas ainda */}
      {annualGoals?.length === 0 && (
        <LoadSampleGoals userId={userId} />
      )}

      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Progresso Geral do Big Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallProgress} className="h-4" />
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
              <p className="text-muted-foreground">da sua jornada para a aposentadoria estratégica</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid dos 6 Pilares */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars?.map((pillar) => {
          const IconComponent = pillarIcons[pillar.icon as keyof typeof pillarIcons] || TrendingUp;
          const pillarGoal = annualGoals?.find(goal => goal.pillar_id === pillar.id);
          const progress = pillarGoal?.progress_percentage || 0;
          const content = pillarContent[pillar.name as keyof typeof pillarContent];
          
          return (
            <Card 
              key={pillar.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handlePillarClick(pillar)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{content?.emoji}</div>
                    <CardTitle className="text-lg">{pillar.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Missão */}
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">📌 Missão</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {content?.mission}
                    </p>
                  </div>

                  {/* Progresso */}
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold" style={{ color: pillar.color }}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>

                  {/* Meta atual */}
                  {pillarGoal && (
                    <div className="text-xs">
                      <span className="font-medium text-muted-foreground">Meta atual: </span>
                      <span className="text-foreground">{pillarGoal.title}</span>
                    </div>
                  )}

                  {/* Exemplos de metas */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">🎯 Exemplos de metas</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {content?.goals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exemplos de hábitos */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">✅ Hábitos associados</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {content?.habits.map((habit, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          <span>{habit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seção de Reflexão Trimestral */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            Reflexão Trimestral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Momento de parar, refletir e ajustar a rota rumo à aposentadoria estratégica
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/60 p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">1. O que estou ignorando?</h4>
                <p className="text-muted-foreground text-xs">
                  Identifique áreas negligenciadas que podem estar sabotando seu progresso
                </p>
              </div>
              
              <div className="bg-white/60 p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">2. Qual pilar mais cresceu?</h4>
                <p className="text-muted-foreground text-xs">
                  Reconheça seus avanços e entenda os fatores de sucesso
                </p>
              </div>
              
              <div className="bg-white/60 p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">3. O que eliminar?</h4>
                <p className="text-muted-foreground text-xs">
                  Identifique o que precisa ser radicalmente ajustado ou removido
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => setShowReflectionModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Iniciar Reflexão Trimestral
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Metas do Pilar */}
      {selectedPillar && (
        <PillarGoalsModal
          pillar={selectedPillar}
          userId={userId}
          isOpen={showGoalsModal}
          onClose={() => {
            setShowGoalsModal(false);
            setSelectedPillar(null);
          }}
        />
      )}

      {/* Modal de Reflexão Trimestral */}
      <QuarterlyReflectionModal
        userId={userId}
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
      />
    </div>
  );
};
