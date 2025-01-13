import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DailyText = Database["public"]["Tables"]["daily_texts"]["Row"];

const REFETCH_INTERVAL = 30000; // 30 segundos

export const DailyText = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: dailyText } = useQuery({
    queryKey: ['dailyText', today],
    queryFn: async () => {
      console.log('Buscando boot diário para a data:', today);
      
      const { data, error } = await supabase
        .from("daily_texts")
        .select()
        .eq("date", today)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar boot diário:', error);
        throw error;
      }
      
      console.log('Boot diário encontrado:', data);
      return data;
    },
    staleTime: REFETCH_INTERVAL,
    refetchInterval: REFETCH_INTERVAL,
  });

  const formattedDate = format(new Date(), "dd 'de' MMMM", { locale: ptBR });

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">Boot Diário</h2>
        <span className="text-lg text-muted-foreground">{formattedDate}</span>
      </div>
      {dailyText?.text ? (
        <div 
          className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
          dangerouslySetInnerHTML={{ __html: dailyText.text }}
        />
      ) : (
        <p className="text-muted-foreground">Nenhuma mensagem para hoje.</p>
      )}
    </Card>
  );
};