import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WeeklyBook = Database["public"]["Tables"]["weekly_books"]["Row"];

export const WeeklyBook = () => {
  const [book, setBook] = useState<WeeklyBook | null>(null);

  useEffect(() => {
    const fetchWeeklyBook = async () => {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const { data, error } = await supabase
        .from("weekly_books")
        .select()
        .eq("week_start", startOfWeek.toISOString().split("T")[0])
        .maybeSingle();

      if (!error && data) {
        setBook(data);
      }
    };

    fetchWeeklyBook();
  }, []);

  return (
    <Card className="p-6 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Book className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Livro da Semana</h2>
      </div>
      {book ? (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{book.title}</h3>
          <p className="text-muted-foreground">por {book.author}</p>
          {book.description && (
            <p className="text-sm text-muted-foreground mt-2">{book.description}</p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum livro selecionado para esta semana.</p>
      )}
    </Card>
  );
};