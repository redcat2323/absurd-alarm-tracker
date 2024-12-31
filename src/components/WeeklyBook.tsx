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
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Livro da Semana</h2>
        </div>
      </div>
      
      {book ? (
        <div className="space-y-4">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-foreground mb-2">{book.title}</h3>
            <p className="text-muted-foreground text-lg italic mb-4">por {book.author}</p>
            {book.description && (
              <div 
                className="text-foreground leading-relaxed"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-lg">Nenhum livro selecionado para esta semana.</p>
      )}
    </Card>
  );
};