import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PDFDownloadButtonProps {
  pdfUrl: string;
}

export const PDFDownloadButton = ({ pdfUrl }: PDFDownloadButtonProps) => {
  const handleDownloadPDF = async () => {
    try {
      const fileName = pdfUrl.split('/').pop();
      if (!fileName) return;

      console.log('Iniciando download do PDF:', fileName);

      const { data, error } = await supabase.storage
        .from('book_files')
        .download(fileName);

      if (error) {
        console.error('Erro ao baixar o PDF:', error);
        return;
      }

      const url = URL.createObjectURL(data);
      window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Erro ao processar o PDF:', error);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={handleDownloadPDF}
    >
      <FileText className="w-4 h-4" />
      Baixar PDF
    </Button>
  );
};