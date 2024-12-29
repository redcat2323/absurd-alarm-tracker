import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DailyText = Database["public"]["Tables"]["daily_texts"]["Row"];

export const DailyText = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchDailyText = async () => {
      const { data, error } = await supabase
        .from("daily_texts")
        .select()
        .eq("date", new Date().toISOString().split("T")[0])
        .maybeSingle();

      if (!error && data) {
        setText(data.text);
      }
    };

    fetchDailyText();
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/5">
      <h2 className="text-2xl font-bold mb-6 text-primary">Boot Diário</h2>
      {text ? (
        <div 
          className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ) : (
        <p className="text-muted-foreground">Nenhuma mensagem para hoje.</p>
      )}
    </Card>
  );
};