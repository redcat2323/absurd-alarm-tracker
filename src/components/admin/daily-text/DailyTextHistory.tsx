import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type DailyText = {
  id: number;
  text: string;
  date: string;
  created_at: string;
};

interface DailyTextHistoryProps {
  dailyTexts: DailyText[];
}

export const DailyTextHistory = ({ dailyTexts }: DailyTextHistoryProps) => {
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", {
      locale: ptBR,
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Histórico de Boots</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Texto</TableHead>
              <TableHead>Data de Criação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyTexts.map((text) => (
              <TableRow key={text.id}>
                <TableCell>
                  {formatDate(text.date)}
                </TableCell>
                <TableCell className="max-w-md">
                  <div 
                    className="prose prose-sm dark:prose-invert line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: text.text.length > 150 
                        ? text.text.substring(0, 150) + "..." 
                        : text.text 
                    }}
                  />
                </TableCell>
                <TableCell>
                  {formatCreatedAt(text.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};