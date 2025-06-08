
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Building, Crown, Zap, Users, Compass } from 'lucide-react';
import { PillarGoalsModal } from './bigplan/PillarGoalsModal';

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

export const BigPlanDashboard = ({ userId }: BigPlanDashboardProps) => {
  const [selectedPillar, setSelectedPillar] = useState<any>(null);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

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
          
          return (
            <Card 
              key={pillar.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handlePillarClick(pillar)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${pillar.color}20`, color: pillar.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{pillar.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pillar.description}
                  </p>
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold" style={{ color: pillar.color }}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                  {pillarGoal && (
                    <div className="text-xs text-muted-foreground">
                      Meta: {pillarGoal.title}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
    </div>
  );
};
