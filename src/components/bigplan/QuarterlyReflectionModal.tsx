
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface QuarterlyReflectionModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QuarterlyReflectionModal = ({ userId, isOpen, onClose }: QuarterlyReflectionModalProps) => {
  const [reflection1, setReflection1] = useState('');
  const [reflection2, setReflection2] = useState('');
  const [reflection3, setReflection3] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);

  // Buscar reflexão existente do trimestre atual
  const { data: existingReflection } = useQuery({
    queryKey: ['quarterly-reflection', userId, currentYear, currentQuarter],
    queryFn: async () => {
      const { data } = await supabase
        .from('pillar_quarterly_goals')
        .select('reflections')
        .eq('user_id', userId)
        .eq('year', currentYear)
        .eq('quarter', currentQuarter)
        .limit(1)
        .maybeSingle();
      
      if (data?.reflections) {
        try {
          const parsed = JSON.parse(data.reflections);
          setReflection1(parsed.question1 || '');
          setReflection2(parsed.question2 || '');
          setReflection3(parsed.question3 || '');
          return parsed;
        } catch {
          return null;
        }
      }
      return null;
    },
    enabled: isOpen,
  });

  const handleSave = async () => {
    if (!reflection1.trim() || !reflection2.trim() || !reflection3.trim()) {
      toast({
        title: "Preencha todas as reflexões",
        description: "Por favor, responda todas as três perguntas antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const reflectionData = {
        question1: reflection1,
        question2: reflection2,
        question3: reflection3,
        created_at: new Date().toISOString(),
      };

      // Verificar se já existe uma meta trimestral para salvar a reflexão
      const { data: existingGoal } = await supabase
        .from('pillar_quarterly_goals')
        .select('id')
        .eq('user_id', userId)
        .eq('year', currentYear)
        .eq('quarter', currentQuarter)
        .limit(1)
        .maybeSingle();

      if (existingGoal) {
        // Atualizar reflexão existente
        const { error } = await supabase
          .from('pillar_quarterly_goals')
          .update({ 
            reflections: JSON.stringify(reflectionData),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingGoal.id);

        if (error) throw error;
      } else {
        // Criar uma entrada genérica para salvar a reflexão
        const { data: firstPillar } = await supabase
          .from('big_plan_pillars')
          .select('id')
          .limit(1)
          .single();

        if (firstPillar) {
          const { error } = await supabase
            .from('pillar_quarterly_goals')
            .insert({
              user_id: userId,
              pillar_id: firstPillar.id,
              year: currentYear,
              quarter: currentQuarter,
              title: `Reflexão Trimestral Q${currentQuarter}/${currentYear}`,
              description: 'Reflexão trimestral geral',
              reflections: JSON.stringify(reflectionData),
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Reflexão salva!",
        description: `Sua reflexão do Q${currentQuarter}/${currentYear} foi salva com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ['quarterly-reflection', userId] });
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar reflexão",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            Reflexão Trimestral - Q{currentQuarter}/{currentYear}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p>Reserve um tempo para refletir profundamente sobre sua jornada rumo à aposentadoria estratégica.</p>
            <p className="text-sm mt-1">Seja honesto e específico em suas respostas.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Pergunta 1 */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-700">
                  1. O que estou ignorando?
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Identifique áreas, hábitos ou responsabilidades que você está evitando ou negligenciando. 
                  O que você sabe que deveria estar fazendo, mas não está?
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reflection1}
                  onChange={(e) => setReflection1(e.target.value)}
                  placeholder="Ex: Não estou revisando meus investimentos mensalmente, estou procrastinando na criação de conteúdo, negligenciando minha saúde física..."
                  className="min-h-[100px] border-orange-200 focus:border-orange-400"
                />
              </CardContent>
            </Card>

            {/* Pergunta 2 */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-lg text-green-700">
                  2. Qual pilar mais cresceu neste trimestre? Por quê?
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Reconheça seus sucessos e identifique os fatores que contribuíram para esse crescimento. 
                  O que funcionou bem?
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reflection2}
                  onChange={(e) => setReflection2(e.target.value)}
                  placeholder="Ex: O pilar 'Legado e Posicionamento' cresceu muito porque consegui manter consistência na gravação de vídeos. A chave foi criar um cronograma fixo e preparar conteúdo com antecedência..."
                  className="min-h-[100px] border-green-200 focus:border-green-400"
                />
              </CardContent>
            </Card>

            {/* Pergunta 3 */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-lg text-red-700">
                  3. O que precisa ser radicalmente eliminado ou ajustado?
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Identifique hábitos, compromissos, pessoas ou estratégias que estão te atrasando. 
                  O que você precisa cortar ou mudar drasticamente?
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reflection3}
                  onChange={(e) => setReflection3(e.target.value)}
                  placeholder="Ex: Preciso eliminar reuniões desnecessárias que consomem 10h por semana, ajustar minha estratégia de redes sociais que não está gerando resultados, cortar relacionamentos que drenam energia..."
                  className="min-h-[100px] border-red-200 focus:border-red-400"
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Reflexão'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
