
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from 'date-fns-tz';
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

type DailyText = Database["public"]["Tables"]["daily_texts"]["Row"];

const REFETCH_INTERVAL = 30000; // 30 segundos
const TIMEZONE = 'America/Sao_Paulo';

export const DailyText = () => {
  const today = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const isMobile = useIsMobile();
  
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

  const handleCopyText = async () => {
    if (!dailyText?.text) return;
    
    try {
      // Remove HTML tags for plain text copying
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = dailyText.text;
      const textToCopy = `Boot Diário - ${formattedDate}\n\n${tempDiv.textContent}`;
      
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Sucesso",
        description: "Boot diário copiado para a área de transferência",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar texto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleShareText = async () => {
    if (!dailyText?.text || !navigator.share) return;
    
    try {
      // Remove HTML tags for plain text sharing
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = dailyText.text;
      const textToShare = `Boot Diário - ${formattedDate}\n\n${tempDiv.textContent}`;
      
      await navigator.share({
        title: `Boot Diário - ${formattedDate}`,
        text: textToShare,
      });
      
      toast({
        title: "Sucesso",
        description: "Boot diário compartilhado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao compartilhar texto:", error);
      // Não exibir erro caso o usuário cancele o compartilhamento
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Erro",
          description: "Não foi possível compartilhar o texto. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

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
        <>
          <div 
            className="prose prose-base dark:prose-invert max-w-none text-foreground leading-relaxed"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: dailyText.text }}
          />
          
          <div className="flex gap-2 mt-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleCopyText}
            >
              <Copy className="w-4 h-4" />
              {isCopied ? "Copiado!" : "Copiar"}
            </Button>
            
            {/* Only show Share button on mobile devices */}
            {isMobile && navigator.share && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleShareText}
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">Nenhuma mensagem para hoje.</p>
      )}
    </Card>
  );
};
