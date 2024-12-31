import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { startOfWeek, format } from "date-fns";
import { FileUp, Loader2 } from "lucide-react";
import { WeeklyBooksHistory } from "./WeeklyBooksHistory";
import type { Database } from "@/integrations/supabase/types";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

const WeeklyBookForm = () => {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const sunday = startOfWeek(today, { weekStartsOn: 0 });
    return format(sunday, 'yyyy-MM-dd');
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [weeklyBooks, setWeeklyBooks] = useState<WeeklyBook[]>([]);
  const { toast } = useToast();

  const fetchWeeklyBooks = async () => {
    const { data, error } = await supabase
      .from("weekly_books")
      .select()
      .order('week_start', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar histórico de livros.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setWeeklyBooks(data);
    }
  };

  useEffect(() => {
    fetchWeeklyBooks();
  }, []);

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
        setCurrentPdfUrl(data.pdf_url);
      } else {
        setBookTitle("");
        setBookAuthor("");
        setBookDescription("");
        setCurrentPdfUrl(null);
      }
    };

    loadExistingBook();
  }, [weekStartDate]);

  const handleWeekStartChange = (date: string) => {
    const selectedDate = new Date(date);
    const sunday = startOfWeek(selectedDate, { weekStartsOn: 0 });
    setWeekStartDate(format(sunday, 'yyyy-MM-dd'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo PDF.",
          variant: "destructive",
        });
      }
    }
  };

  const uploadPdf = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('book_files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Erro ao fazer upload do arquivo');
    }

    const { data } = supabase.storage
      .from('book_files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleWeeklyBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let pdfUrl = currentPdfUrl;
      
      if (pdfFile) {
        pdfUrl = await uploadPdf(pdfFile);
      }

      const { data: existingBook } = await supabase
        .from("weekly_books")
        .select()
        .eq("week_start", weekStartDate)
        .maybeSingle();

      let error;
      
      if (existingBook) {
        const { error: updateError } = await supabase
          .from("weekly_books")
          .update({
            title: bookTitle,
            author: bookAuthor,
            description: bookDescription,
            pdf_url: pdfUrl,
          })
          .eq("week_start", weekStartDate);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("weekly_books")
          .insert({
            title: bookTitle,
            author: bookAuthor,
            description: bookDescription,
            week_start: weekStartDate,
            pdf_url: pdfUrl,
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
        setPdfFile(null);
        fetchWeeklyBooks();
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

  const handleViewPdf = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Livro da Semana</h2>
        <form onSubmit={handleWeeklyBookSubmit} className="space-y-4">
          <div>
            <Label htmlFor="week-start">Data de Início da Semana (Domingo)</Label>
            <Input
              id="week-start"
              type="date"
              value={weekStartDate}
              onChange={(e) => handleWeekStartChange(e.target.value)}
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
          <div>
            <Label htmlFor="pdf-file">PDF do Livro</Label>
            <div className="flex items-center gap-4">
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              {currentPdfUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleViewPdf(currentPdfUrl)}
                >
                  Ver PDF Atual
                </Button>
              )}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Salvar Livro da Semana
              </>
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Histórico de Livros</h2>
        <WeeklyBooksHistory books={weeklyBooks} onViewPdf={handleViewPdf} />
      </Card>
    </div>
  );
};

export default WeeklyBookForm;