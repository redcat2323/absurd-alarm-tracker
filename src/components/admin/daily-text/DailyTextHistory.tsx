import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const getMonthYear = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  // Agrupar textos por mês
  const groupedTexts = dailyTexts.reduce((groups, text) => {
    const monthYear = getMonthYear(text.date);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(text);
    return groups;
  }, {} as Record<string, DailyText[]>);

  // Ordenar meses em ordem decrescente
  const sortedMonths = Object.keys(groupedTexts).sort((a, b) => {
    const dateA = parseISO(groupedTexts[a][0].date);
    const dateB = parseISO(groupedTexts[b][0].date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Histórico de Boots</h2>
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
                        <TableHead>Data</TableHead>
                        <TableHead>Texto</TableHead>
                        <TableHead>Data de Criação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedTexts[monthYear].map((text) => (
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </Card>
  );
};