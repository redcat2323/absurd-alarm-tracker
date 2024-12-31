import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type DailyText = {
  id: number;
  text: string;
  date: string;
  created_at: string;
};

const DailyTextForm = () => {
  const [dailyText, setDailyText] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dailyTexts, setDailyTexts] = useState<DailyText[]>([]);
  const { toast } = useToast();

  const fetchDailyTexts = async () => {
    const { data, error } = await supabase
      .from("daily_texts")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar textos diários.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setDailyTexts(data);
    }
  };

  useEffect(() => {
    fetchDailyTexts();
  }, []);

  useEffect(() => {
    const fetchExistingText = async () => {
      const { data, error } = await supabase
        .from("daily_texts")
        .select("text")
        .eq("date", selectedDate)
        .maybeSingle();

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar texto existente.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setDailyText(data.text);
      } else {
        setDailyText("");
      }
    };

    fetchExistingText();
  }, [selectedDate, toast]);

  const handleDailyTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("daily_texts")
      .upsert(
        { text: dailyText, date: selectedDate },
        { onConflict: "date" }
      );

    if (error) {
      console.error("Error saving daily text:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o texto diário.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Texto diário atualizado com sucesso!",
      });
      fetchDailyTexts();
    }
  };

  const formatDate = (dateString: string) => {
    // Parse the date string to a Date object, considering it as UTC
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Texto Diário</h2>
        <form onSubmit={handleDailyTextSubmit} className="space-y-4">
          <div>
            <Label htmlFor="boot-date">Data do Boot</Label>
            <Input
              id="boot-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mb-4"
            />
          </div>
          <div>
            <Label htmlFor="boot-text">Texto do Boot</Label>
            <RichTextEditor
              value={dailyText}
              onChange={setDailyText}
              placeholder="Digite o texto do dia..."
            />
          </div>
          <Button type="submit">Salvar Texto Diário</Button>
        </form>
      </Card>

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
                    {format(new Date(text.created_at), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default DailyTextForm;