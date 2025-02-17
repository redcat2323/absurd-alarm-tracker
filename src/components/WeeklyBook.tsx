
import { Card } from "@/components/ui/card";
import { Book, ChevronDown, ChevronUp } from "lucide-react";
import { useWeeklyBook } from "@/hooks/useWeeklyBook";
import { PDFDownloadButton } from "@/components/PDFDownloadButton";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Button } from "./ui/button";

export const WeeklyBook = () => {
  const { book, upcomingBooks } = useWeeklyBook();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatWeekStart = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "dd 'de' MMMM", { locale: ptBR });
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
              <div className={`relative ${!isExpanded ? "max-h-24 overflow-hidden" : ""}`}>
                <div 
                  className="text-foreground leading-relaxed mb-4"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: book.description }}
                />
                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
                )}
              </div>
            )}
            
            {isExpanded && (
              <>
                {book.pdf_url && <PDFDownloadButton pdfUrl={book.pdf_url} />}

                {upcomingBooks.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-lg font-semibold text-primary mb-4">Próximos Livros</h4>
                    <div className="space-y-4">
                      {upcomingBooks.map((upcomingBook) => (
                        <div key={upcomingBook.id} className="p-4 rounded-lg bg-secondary/10">
                          <div className="text-sm text-muted-foreground mb-1">
                            Semana do dia {formatWeekStart(upcomingBook.week_start)}
                          </div>
                          <h5 className="font-medium text-foreground">{upcomingBook.title}</h5>
                          <p className="text-sm text-muted-foreground">por {upcomingBook.author}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            variant="secondary"
            className="w-full mt-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <div className="flex items-center gap-2">
                Ver menos <ChevronUp className="w-4 h-4" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Ver mais <ChevronDown className="w-4 h-4" />
              </div>
            )}
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-lg">Nenhum livro selecionado para esta semana.</p>
      )}
    </Card>
  );
};
