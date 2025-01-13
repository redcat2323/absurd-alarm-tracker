import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WeeklyBookTableRow } from "./weekly-book/WeeklyBookTableRow";
import type { Database } from "@/integrations/supabase/types";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

interface WeeklyBooksHistoryProps {
  books: WeeklyBook[];
  onViewPdf: (pdfUrl: string) => void;
}

export const WeeklyBooksHistory = ({ books, onViewPdf }: WeeklyBooksHistoryProps) => {
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
            <WeeklyBookTableRow 
              key={book.id} 
              book={book} 
              onViewPdf={onViewPdf} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};