
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Upload, CheckCircle } from 'lucide-react';

interface LoadSampleGoalsProps {
  userId: string;
}

export const LoadSampleGoals = ({ userId }: LoadSampleGoalsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const queryClient = useQueryClient();

  const sampleAnnualGoals = [
    // MAPA DE RIQUEZA (pilar_id = 1)
    {
      pillar_id: 1,
      title: 'Aumentar patrimônio líquido',
      description: 'Elevar patrimônio total de R$500.000 para R$1.200.000 com aportes mensais e valorização de ativos',
      target_value: 1200000,
      current_value: 500000,
      progress_percentage: 41.67
    },
    {
      pillar_id: 1,
      title: 'Criar novas fontes de renda passiva',
      description: 'Desenvolver pelo menos 3 fontes de renda passiva que gerem fluxo de caixa contínuo',
      target_value: 3,
      current_value: 1,
      progress_percentage: 33.33
    },
    // NEGÓCIO SEM FUNDADOR (pilar_id = 2)
    {
      pillar_id: 2,
      title: 'Automatizar operação de suporte',
      description: 'Implementar chatbot e central de autoatendimento com taxa de resolução >70%',
      target_value: 70,
      current_value: 20,
      progress_percentage: 28.57
    },
    {
      pillar_id: 2,
      title: 'Estruturar time de liderança',
      description: 'Definir e treinar 3 líderes para áreas-chave: vendas, operação e tech',
      target_value: 3,
      current_value: 1,
      progress_percentage: 33.33
    },
    // LEGADO E POSICIONAMENTO PESSOAL (pilar_id = 3)
    {
      pillar_id: 3,
      title: 'Gravar 365 vídeos autorais',
      description: 'Construir acervo de conteúdos de valor com consistência diária',
      target_value: 365,
      current_value: 50,
      progress_percentage: 13.70
    },
    {
      pillar_id: 3,
      title: 'Publicar livro sobre a jornada da liberdade',
      description: 'Lançar e distribuir um livro com aprendizados estratégicos da jornada',
      target_value: 1,
      current_value: 0.5,
      progress_percentage: 50.00
    },
    // CORPO E MENTE DE ALTA PERFORMANCE (pilar_id = 4)
    {
      pillar_id: 4,
      title: 'Manter rotina de 5 treinos semanais',
      description: 'Garantir consistência e adaptação física para performance',
      target_value: 260,
      current_value: 70,
      progress_percentage: 26.92
    },
    {
      pillar_id: 4,
      title: 'Alcançar 12% de gordura corporal',
      description: 'Ajustar alimentação e treinos com acompanhamento',
      target_value: 12,
      current_value: 17,
      progress_percentage: 0
    },
    // REDE ESTRATÉGICA (pilar_id = 5)
    {
      pillar_id: 5,
      title: 'Participar de 2 masterminds',
      description: 'Estar em grupos de troca de alto nível com fundadores e visionários',
      target_value: 2,
      current_value: 1,
      progress_percentage: 50.00
    },
    {
      pillar_id: 5,
      title: 'Ampliar rede com 10 conexões-chave',
      description: 'Criar vínculos com nomes estratégicos por proximidade e intenção',
      target_value: 10,
      current_value: 4,
      progress_percentage: 40.00
    },
    // LIBERDADE DEFINIDA (pilar_id = 6)
    {
      pillar_id: 6,
      title: 'Viver 30 dias em cidade fora da base atual',
      description: 'Testar rotina de liberdade remota em outro estado ou país',
      target_value: 30,
      current_value: 0,
      progress_percentage: 0
    },
    {
      pillar_id: 6,
      title: 'Reduzir jornada semanal para 30h',
      description: 'Implementar rotina com foco em foco, blocos e tempo livre',
      target_value: 30,
      current_value: 48,
      progress_percentage: 0
    }
  ];

  const sampleQuarterlyGoals = [
    // MAPA DE RIQUEZA (pilar_id = 1)
    {
      pillar_id: 1,
      quarter: 2,
      title: 'Finalizar plano financeiro anual',
      description: 'Mapear investimentos, simular cenários e revisar fluxo de caixa até fim de Q2',
      target_value: 100,
      current_value: 30,
      progress_percentage: 30.00
    },
    // NEGÓCIO SEM FUNDADOR (pilar_id = 2)
    {
      pillar_id: 2,
      quarter: 2,
      title: 'Criar 10 playbooks operacionais',
      description: 'Formalizar rotinas em formato replicável para autonomia do time',
      target_value: 10,
      current_value: 2,
      progress_percentage: 20.00
    },
    // LEGADO E POSICIONAMENTO PESSOAL (pilar_id = 3)
    {
      pillar_id: 3,
      quarter: 2,
      title: 'Consolidar narrativa de marca pessoal',
      description: 'Definir mensagem central, tópicos-chave e canais principais',
      target_value: 100,
      current_value: 40,
      progress_percentage: 40.00
    },
    // CORPO E MENTE DE ALTA PERFORMANCE (pilar_id = 4)
    {
      pillar_id: 4,
      quarter: 2,
      title: 'Estabilizar sono de qualidade',
      description: 'Dormir 7h30 por noite por 80% dos dias do trimestre',
      target_value: 72,
      current_value: 42,
      progress_percentage: 58.33
    },
    // REDE ESTRATÉGICA (pilar_id = 5)
    {
      pillar_id: 5,
      quarter: 2,
      title: 'Criar plano de relacionamento estratégico',
      description: 'Mapear e iniciar conexões com nomes de impacto',
      target_value: 100,
      current_value: 30,
      progress_percentage: 30.00
    },
    // LIBERDADE DEFINIDA (pilar_id = 6)
    {
      pillar_id: 6,
      quarter: 2,
      title: 'Definir rotina semanal ideal',
      description: 'Desenhar semana dos sonhos e começar implementação aos poucos',
      target_value: 100,
      current_value: 50,
      progress_percentage: 50.00
    }
  ];

  const loadSampleGoals = async () => {
    setIsLoading(true);

    try {
      const currentYear = new Date().getFullYear();

      // Inserir metas anuais
      const annualGoalsToInsert = sampleAnnualGoals.map(goal => ({
        user_id: userId,
        pillar_id: goal.pillar_id,
        year: currentYear,
        title: goal.title,
        description: goal.description,
        target_value: goal.target_value,
        current_value: goal.current_value,
        progress_percentage: goal.progress_percentage,
      }));

      const { error: annualError } = await supabase
        .from('pillar_annual_goals')
        .insert(annualGoalsToInsert);

      if (annualError) throw annualError;

      // Inserir metas trimestrais
      const quarterlyGoalsToInsert = sampleQuarterlyGoals.map(goal => ({
        user_id: userId,
        pillar_id: goal.pillar_id,
        year: currentYear,
        quarter: goal.quarter,
        title: goal.title,
        description: goal.description,
        target_value: goal.target_value,
        current_value: goal.current_value,
        progress_percentage: goal.progress_percentage,
      }));

      const { error: quarterlyError } = await supabase
        .from('pillar_quarterly_goals')
        .insert(quarterlyGoalsToInsert);

      if (quarterlyError) throw quarterlyError;

      toast({
        title: "Metas carregadas com sucesso!",
        description: "Todas as metas anuais e trimestrais foram adicionadas aos seus pilares.",
      });

      setIsLoaded(true);
      queryClient.invalidateQueries({ queryKey: ['annual-goals'] });
      queryClient.invalidateQueries({ queryKey: ['quarterly-goals'] });

    } catch (error: any) {
      toast({
        title: "Erro ao carregar metas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoaded) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Metas de exemplo já foram carregadas!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Upload className="w-5 h-5" />
          Carregar Metas de Exemplo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              Clique no botão abaixo para carregar metas pré-definidas para todos os pilares:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>12 metas anuais</strong> distribuídas entre os 6 pilares</li>
              <li><strong>6 metas trimestrais</strong> (Q2 2025) para foco imediato</li>
              <li>Valores realistas baseados na estratégia de aposentadoria</li>
            </ul>
          </div>
          
          <Button 
            onClick={loadSampleGoals} 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? 'Carregando metas...' : 'Carregar Metas de Exemplo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
