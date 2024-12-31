import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const WeeklyBookForm = () => {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [weekStartDate, setWeekStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Carregar livro existente quando a data for alterada
  useEffect(() => {
    const loadExistingBook = async () => {
      const { data } = await supabase
        .from("weekly_books")
        .select()
        .eq("week_start", weekStartDate)
        .maybeSingle();

      if (data) {
        setBookTitle(data.title);
        setBookAuthor(data.author);
        setBookDescription(data.description || "");
      } else {
        setBookTitle("");
        setBookAuthor("");
        setBookDescription("");
      }
    };

    loadExistingBook();
  }, [weekStartDate]);

  const handleWeeklyBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Primeiro, verifica se já existe um livro para esta semana
      const { data: existingBook } = await supabase
        .from("weekly_books")
        .select()
        .eq("week_start", weekStartDate)
        .maybeSingle();

      let error;
      
      if (existingBook) {
        // Se existe, atualiza o registro
        const { error: updateError } = await supabase
          .from("weekly_books")
          .update({
            title: bookTitle,
            author: bookAuthor,
            description: bookDescription,
          })
          .eq("week_start", weekStartDate);
        error = updateError;
      } else {
        // Se não existe, insere um novo
        const { error: insertError } = await supabase
          .from("weekly_books")
          .insert({
            title: bookTitle,
            author: bookAuthor,
            description: bookDescription,
            week_start: weekStartDate,
          });
        error = insertError;
      }

      if (error) {
        console.error("Error saving weekly book:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar o livro da semana. Por favor, tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Livro da semana atualizado com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error in weekly book submission:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o livro. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            required
          />
        </div>
        <div>
          <Label htmlFor="book-title">Título do Livro</Label>
          <Input
            id="book-title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Título do livro"
            required
          />
        </div>
        <div>
          <Label htmlFor="book-author">Autor do Livro</Label>
          <Input
            id="book-author"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            placeholder="Autor do livro"
            required
          />
        </div>
        <div>
          <Label htmlFor="book-description">Descrição do Livro</Label>
          <RichTextEditor
            value={bookDescription}
            onChange={setBookDescription}
            placeholder="Descrição do livro..."
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Livro da Semana"}
        </Button>
      </form>
    </Card>
  );
};

export default WeeklyBookForm;