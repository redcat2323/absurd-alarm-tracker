import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

const WeeklyBookForm = () => {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [weekStartDate, setWeekStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { toast } = useToast();

  const handleWeeklyBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("weekly_books").upsert({
      title: bookTitle,
      author: bookAuthor,
      description: bookDescription,
      week_start: weekStartDate,
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o livro da semana.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Livro da semana atualizado com sucesso!",
      });
      setBookTitle("");
      setBookAuthor("");
      setBookDescription("");
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Livro da Semana</h2>
      <form onSubmit={handleWeeklyBookSubmit} className="space-y-4">
        <div>
          <Label htmlFor="week-start">Data de Início da Semana</Label>
          <Input
            id="week-start"
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            className="mb-4"
          />
        </div>
        <div>
          <Label htmlFor="book-title">Título do Livro</Label>
          <Input
            id="book-title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Título do livro"
          />
        </div>
        <div>
          <Label htmlFor="book-author">Autor do Livro</Label>
          <Input
            id="book-author"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            placeholder="Autor do livro"
          />
        </div>
        <div>
          <Label htmlFor="book-description">Descrição do Livro</Label>
          <Textarea
            id="book-description"
            value={bookDescription}
            onChange={(e) => setBookDescription(e.target.value)}
            placeholder="Descrição do livro..."
            className="min-h-[100px]"
          />
        </div>
        <Button type="submit">Salvar Livro da Semana</Button>
      </form>
    </Card>
  );
};

export default WeeklyBookForm;