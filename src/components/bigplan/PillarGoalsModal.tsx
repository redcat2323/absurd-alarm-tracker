
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Plus, Save, Calendar } from 'lucide-react';

interface PillarGoalsModalProps {
  pillar: any;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PillarGoalsModal = ({ pillar, userId, isOpen, onClose }: PillarGoalsModalProps) => {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  
  const [newAnnualGoal, setNewAnnualGoal] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: '',
  });
  
  const [newQuarterlyGoal, setNewQuarterlyGoal] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: '',
    quarter: currentQuarter,
  });

  // Buscar metas anuais
  const { data: annualGoals } = useQuery({
    queryKey: ['annual-goals', userId, pillar.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('pillar_annual_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('pillar_id', pillar.id)
        .eq('year', currentYear);
      return data || [];
    },
    enabled: isOpen,
  });

  // Buscar metas trimestrais
  const { data: quarterlyGoals } = useQuery({
    queryKey: ['quarterly-goals', userId, pillar.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('pillar_quarterly_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('pillar_id', pillar.id)
        .eq('year', currentYear);
      return data || [];
    },
    enabled: isOpen,
  });

  const createAnnualGoal = async () => {
    if (!newAnnualGoal.title.trim()) return;

    const progressPercentage = newAnnualGoal.target_value && newAnnualGoal.current_value
      ? Math.min((parseFloat(newAnnualGoal.current_value) / parseFloat(newAnnualGoal.target_value)) * 100, 100)
      : 0;

    const { error } = await supabase
      .from('pillar_annual_goals')
      .insert([{
        user_id: userId,
        pillar_id: pillar.id,
        year: currentYear,
        title: newAnnualGoal.title,
        description: newAnnualGoal.description,
        target_value: newAnnualGoal.target_value ? parseFloat(newAnnualGoal.target_value) : null,
        current_value: newAnnualGoal.current_value ? parseFloat(newAnnualGoal.current_value) : 0,
        progress_percentage: progressPercentage,
      }]);

    if (error) {
      toast({
        title: "Erro ao criar meta anual",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Meta anual criada!",
      description: "Sua nova meta foi adicionada com sucesso.",
    });

    setNewAnnualGoal({ title: '', description: '', target_value: '', current_value: '' });
    queryClient.invalidateQueries({ queryKey: ['annual-goals'] });
  };

  const createQuarterlyGoal = async () => {
    if (!newQuarterlyGoal.title.trim()) return;

    const progressPercentage = newQuarterlyGoal.target_value && newQuarterlyGoal.current_value
      ? Math.min((parseFloat(newQuarterlyGoal.current_value) / parseFloat(newQuarterlyGoal.target_value)) * 100, 100)
      : 0;

    const { error } = await supabase
      .from('pillar_quarterly_goals')
      .insert([{
        user_id: userId,
        pillar_id: pillar.id,
        year: currentYear,
        quarter: newQuarterlyGoal.quarter,
        title: newQuarterlyGoal.title,
        description: newQuarterlyGoal.description,
        target_value: newQuarterlyGoal.target_value ? parseFloat(newQuarterlyGoal.target_value) : null,
        current_value: newQuarterlyGoal.current_value ? parseFloat(newQuarterlyGoal.current_value) : 0,
        progress_percentage: progressPercentage,
      }]);

    if (error) {
      toast({
        title: "Erro ao criar meta trimestral",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Meta trimestral criada!",
      description: "Sua nova meta foi adicionada com sucesso.",
    });

    setNewQuarterlyGoal({ 
      title: '', 
      description: '', 
      target_value: '', 
      current_value: '', 
      quarter: currentQuarter 
    });
    queryClient.invalidateQueries({ queryKey: ['quarterly-goals'] });
  };

  const updateGoalProgress = async (goalId: number, currentValue: number, targetValue: number, isAnnual: boolean) => {
    const progressPercentage = targetValue ? Math.min((currentValue / targetValue) * 100, 100) : 0;
    
    const table = isAnnual ? 'pillar_annual_goals' : 'pillar_quarterly_goals';
    
    const { error } = await supabase
      .from(table)
      .update({
        current_value: currentValue,
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Erro ao atualizar progresso",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Progresso atualizado!",
      description: "O progresso da meta foi atualizado com sucesso.",
    });

    queryClient.invalidateQueries({ queryKey: ['annual-goals'] });
    queryClient.invalidateQueries({ queryKey: ['quarterly-goals'] });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${pillar.color}20`, color: pillar.color }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            {pillar.name} - Metas e Progresso
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="annual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="annual">Metas Anuais {currentYear}</TabsTrigger>
            <TabsTrigger value="quarterly">Metas Trimestrais</TabsTrigger>
          </TabsList>

          <TabsContent value="annual" className="space-y-6">
            {/* Formulário Nova Meta Anual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Meta Anual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título da meta"
                  value={newAnnualGoal.title}
                  onChange={(e) => setNewAnnualGoal({ ...newAnnualGoal, title: e.target.value })}
                />
                <Textarea
                  placeholder="Descrição da meta"
                  value={newAnnualGoal.description}
                  onChange={(e) => setNewAnnualGoal({ ...newAnnualGoal, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Valor alvo"
                    value={newAnnualGoal.target_value}
                    onChange={(e) => setNewAnnualGoal({ ...newAnnualGoal, target_value: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Valor atual"
                    value={newAnnualGoal.current_value}
                    onChange={(e) => setNewAnnualGoal({ ...newAnnualGoal, current_value: e.target.value })}
                  />
                </div>
                <Button onClick={createAnnualGoal} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Criar Meta Anual
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Metas Anuais */}
            <div className="space-y-4">
              {annualGoals?.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {goal.description && (
                          <p className="text-muted-foreground mt-1">{goal.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">{Math.round(goal.progress_percentage || 0)}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={goal.progress_percentage || 0} className="h-2" />
                      {goal.target_value && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Valor Atual</label>
                            <Input
                              type="number"
                              defaultValue={goal.current_value || 0}
                              onBlur={(e) => {
                                const newValue = parseFloat(e.target.value) || 0;
                                if (newValue !== (goal.current_value || 0)) {
                                  updateGoalProgress(goal.id, newValue, goal.target_value || 0, true);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Valor Alvo</label>
                            <Input
                              type="number"
                              value={goal.target_value || 0}
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quarterly" className="space-y-6">
            {/* Formulário Nova Meta Trimestral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Meta Trimestral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título da meta"
                  value={newQuarterlyGoal.title}
                  onChange={(e) => setNewQuarterlyGoal({ ...newQuarterlyGoal, title: e.target.value })}
                />
                <Textarea
                  placeholder="Descrição da meta"
                  value={newQuarterlyGoal.description}
                  onChange={(e) => setNewQuarterlyGoal({ ...newQuarterlyGoal, description: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-4">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newQuarterlyGoal.quarter}
                    onChange={(e) => setNewQuarterlyGoal({ ...newQuarterlyGoal, quarter: parseInt(e.target.value) })}
                  >
                    <option value={1}>Q1 (Jan-Mar)</option>
                    <option value={2}>Q2 (Abr-Jun)</option>
                    <option value={3}>Q3 (Jul-Set)</option>
                    <option value={4}>Q4 (Out-Dez)</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Valor alvo"
                    value={newQuarterlyGoal.target_value}
                    onChange={(e) => setNewQuarterlyGoal({ ...newQuarterlyGoal, target_value: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Valor atual"
                    value={newQuarterlyGoal.current_value}
                    onChange={(e) => setNewQuarterlyGoal({ ...newQuarterlyGoal, current_value: e.target.value })}
                  />
                </div>
                <Button onClick={createQuarterlyGoal} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Criar Meta Trimestral
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Metas Trimestrais */}
            <div className="space-y-4">
              {quarterlyGoals?.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {goal.title}
                          <Badge variant="outline">Q{goal.quarter}</Badge>
                        </CardTitle>
                        {goal.description && (
                          <p className="text-muted-foreground mt-1">{goal.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">{Math.round(goal.progress_percentage || 0)}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={goal.progress_percentage || 0} className="h-2" />
                      {goal.target_value && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Valor Atual</label>
                            <Input
                              type="number"
                              defaultValue={goal.current_value || 0}
                              onBlur={(e) => {
                                const newValue = parseFloat(e.target.value) || 0;
                                if (newValue !== (goal.current_value || 0)) {
                                  updateGoalProgress(goal.id, newValue, goal.target_value || 0, false);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Valor Alvo</label>
                            <Input
                              type="number"
                              value={goal.target_value || 0}
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
