import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Book, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from 'date-fns-tz';
import { startOfWeek } from 'date-fns';

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

const TIMEZONE = 'America/Sao_Paulo';

export const WeeklyBook = () => {
  const [book, setBook] = useState<WeeklyBook | null>(null);

  useEffect(() => {
    const fetchWeeklyBook = async () => {
      // Obter a data atual no fuso horário de Brasília
      const now = new Date();
      const brazilianDate = new Date(formatInTimeZone(now, TIMEZONE, 'yyyy-MM-dd'));
      
      // Encontrar o domingo (início) da semana atual
      const weekStart = startOfWeek(brazilianDate, { weekStartsOn: 0 }).toISOString().split("T")[0];
      
      console.log('Data atual (Brasília):', brazilianDate);
      console.log('Início da semana (domingo):', weekStart);
      
      const { data, error } = await supabase
        .from("weekly_books")
        .select()
        .eq("week_start", weekStart)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar livro da semana:', error);
        return;
      }

      console.log('Livro da semana encontrado:', data);
      if (data) {
        setBook(data);
      }
    };

    fetchWeeklyBook();

    // Atualizar o livro à meia-noite de cada dia
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchWeeklyBook();
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  const handleDownloadPDF = async () => {
    if (book?.pdf_url) {
      try {
        const fileName = book.pdf_url.split('/').pop();
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