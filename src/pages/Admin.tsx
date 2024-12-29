import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";

const Admin = () => {
  const [dailyText, setDailyText] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleDailyTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("daily_texts")
      .upsert({ text: dailyText, date: today });

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
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekStart = startOfWeek.toISOString().split("T")[0];

    const { error } = await supabase.from("weekly_books").upsert({
      title: bookTitle,
      author: bookAuthor,
      description: bookDescription,
      week_start: weekStart,
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
            <Textarea
              value={dailyText}
              onChange={(e) => setDailyText(e.target.value)}
              placeholder="Digite o texto do dia..."
              className="min-h-[100px]"
            />
            <Button type="submit">Salvar Texto Diário</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Livro da Semana</h2>
          <form onSubmit={handleWeeklyBookSubmit} className="space-y-4">
            <Input
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="Título do livro"
            />
            <Input
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              placeholder="Autor do livro"
            />
            <Textarea
              value={bookDescription}
              onChange={(e) => setBookDescription(e.target.value)}
              placeholder="Descrição do livro..."
              className="min-h-[100px]"
            />
            <Button type="submit">Salvar Livro da Semana</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Admin;