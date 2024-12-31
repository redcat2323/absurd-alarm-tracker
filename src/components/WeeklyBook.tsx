import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Book, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

export const WeeklyBook = () => {
  const [book, setBook] = useState<WeeklyBook | null>(null);

  useEffect(() => {
    const fetchWeeklyBook = async () => {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const { data, error } = await supabase
        .from("weekly_books")
        .select()
        .eq("week_start", startOfWeek.toISOString().split("T")[0])
        .maybeSingle();

      if (!error && data) {
        setBook(data);
      }
    };

    fetchWeeklyBook();
  }, []);

  const handleDownloadPDF = async () => {
    if (book?.pdf_url) {
      try {
        // Extrair apenas o nome do arquivo da URL completa
        const fileName = book.pdf_url.split('/').pop();
        if (!fileName) return;

        const { data, error } = await supabase.storage
          .from('book_files')
          .download(fileName);

        if (error) {
          console.error('Erro ao baixar o PDF:', error);
          return;
        }

        // Criar um URL temporário para o blob e abrir em uma nova aba
        const url = URL.createObjectURL(data);
        window.open(url, '_blank');

        // Limpar o URL do blob após um breve delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        console.error('Erro ao processar o PDF:', error);
      }
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Livro da Semana</h2>
        </div>
      </div>
      
      {book ? (
        <div className="space-y-4">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-foreground mb-2">{book.title}</h3>
            <p className="text-muted-foreground text-lg italic mb-4">por {book.author}</p>
            {book.description && (
              <div 
                className="text-foreground leading-relaxed mb-4"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            )}
            {book.pdf_url && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownloadPDF}
              >
                <FileText className="w-4 h-4" />
                Baixar PDF
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-lg">Nenhum livro selecionado para esta semana.</p>
      )}
    </Card>
  );
};