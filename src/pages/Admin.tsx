import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Label } from "@/components/ui/label";

const Admin = () => {
  const [dailyText, setDailyText] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [weekStartDate, setWeekStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleDailyTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("daily_texts")
      .upsert({ text: dailyText, date: selectedDate });

    if (error) {
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
      setDailyText("");
    }
  };

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

  const handleLogin = (name: string) => {
    setIsAuthenticated(true);
    toast({
      title: "Bem-vindo!",
      description: `Login realizado com sucesso, ${name}!`,
    });
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Painel Administrativo</h1>

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
              <Textarea
                id="boot-text"
                value={dailyText}
                onChange={(e) => setDailyText(e.target.value)}
                placeholder="Digite o texto do dia..."
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit">Salvar Texto Diário</Button>
          </form>
        </Card>

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
      </div>
    </div>
  );
};

export default Admin;