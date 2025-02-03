import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from 'date-fns-tz';

type DailyText = Database["public"]["Tables"]["daily_texts"]["Row"];

const REFETCH_INTERVAL = 30000; // 30 segundos
const TIMEZONE = 'America/Sao_Paulo';

export const DailyText = () => {
  const today = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
  
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

  const formattedDate = formatInTimeZone(new Date(), TIMEZONE, "dd 'de' MMMM", { locale: ptBR });

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Boot Diário
          </h2>
        </div>
        <span className="text-lg text-muted-foreground font-medium">
          {formattedDate}
        </span>
      </div>
      {dailyText?.text ? (
        <div 
          className="prose prose-base dark:prose-invert max-w-none text-foreground leading-relaxed"
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