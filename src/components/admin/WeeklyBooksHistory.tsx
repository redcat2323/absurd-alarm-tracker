import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WeeklyBookTableRow } from "./weekly-book/WeeklyBookTableRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Database } from "@/integrations/supabase/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

interface WeeklyBooksHistoryProps {
  books: WeeklyBook[];
  onViewPdf: (pdfUrl: string) => void;
}

export const WeeklyBooksHistory = ({ books, onViewPdf }: WeeklyBooksHistoryProps) => {
  const getMonthYear = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  // Agrupar livros por mês
  const groupedBooks = books.reduce((groups, book) => {
    const monthYear = getMonthYear(book.week_start);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(book);
    return groups;
  }, {} as Record<string, WeeklyBook[]>);

  // Ordenar meses em ordem decrescente
  const sortedMonths = Object.keys(groupedBooks).sort((a, b) => {
    const dateA = parseISO(groupedBooks[a][0].week_start);
    const dateB = parseISO(groupedBooks[b][0].week_start);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Histórico de Livros</h2>
      <ScrollArea className="h-[600px] pr-4">
        <Accordion type="single" collapsible className="space-y-4">
          {sortedMonths.map((monthYear) => (
            <AccordionItem key={monthYear} value={monthYear}>
              <AccordionTrigger className="text-lg font-medium hover:no-underline">
                {monthYear}
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-md border mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Início da Semana</TableHead>
                        <TableHead>Fim da Semana</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead className="w-[300px]">Descrição</TableHead>
                        <TableHead>PDF</TableHead>
                        <TableHead>Data de Criação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedBooks[monthYear].map((book) => (
                        <WeeklyBookTableRow 
                          key={book.id} 
                          book={book} 
                          onViewPdf={onViewPdf} 
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </Card>
  );
};