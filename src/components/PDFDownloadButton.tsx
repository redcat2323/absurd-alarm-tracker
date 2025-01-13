import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PDFDownloadButtonProps {
  pdfUrl: string;
}

export const PDFDownloadButton = ({ pdfUrl }: PDFDownloadButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      const fileName = pdfUrl.split('/').pop();
      if (!fileName) {
        throw new Error('Nome do arquivo inválido');
      }

      console.log('Iniciando download do PDF:', fileName);

      const { data, error } = await supabase.storage
        .from('book_files')
        .download(fileName);

      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast({
        title: "Sucesso",
        description: "PDF aberto em nova aba",
      });
    } catch (error) {
      console.error('Erro ao processar o PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={handleDownloadPDF}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      {isLoading ? "Baixando..." : "Baixar PDF"}
    </Button>
  );
};