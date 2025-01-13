import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
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
      
      // Abre o PDF diretamente em uma nova aba
      window.open(pdfUrl, '_blank');

      toast({
        title: "Sucesso",
        description: "PDF aberto em nova aba",
      });
    } catch (error) {
      console.error('Erro ao processar o PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o PDF. Tente novamente.",
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
      {isLoading ? "Abrindo..." : "Abrir PDF"}
    </Button>
  );
};