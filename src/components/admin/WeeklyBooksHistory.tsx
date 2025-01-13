import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

interface WeeklyBooksHistoryProps {
  books: WeeklyBook[];
  onViewPdf: (pdfUrl: string) => void;
}

export const WeeklyBooksHistory = ({ books, onViewPdf }: WeeklyBooksHistoryProps) => {
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  const getEndDate = (startDate: string) => {
    const date = parseISO(startDate);
    const endDate = addDays(date, 6); // Add 6 days to get to Saturday
    return formatDate(endDate.toISOString());
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Início da Semana</TableHead>
            <TableHead>Fim da Semana</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>PDF</TableHead>
            <TableHead>Data de Criação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{formatDate(book.week_start)}</TableCell>
              <TableCell>{getEndDate(book.week_start)}</TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell className="max-w-md">
                {book.description && (
                  <div 
                    className="prose prose-sm dark:prose-invert line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: book.description.length > 150 
                        ? book.description.substring(0, 150) + "..." 
                        : book.description 
                    }}
                  />
                )}
              </TableCell>
              <TableCell>
                {book.pdf_url && (
                  <button
                    onClick={() => onViewPdf(book.pdf_url!)}
                    className="text-primary hover:underline"
                  >
                    Ver PDF
                  </button>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(book.created_at), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};