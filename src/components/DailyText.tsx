import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const DailyText = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchDailyText = async () => {
      const { data, error } = await supabase
        .from("daily_texts")
        .select("*")
        .eq("date", new Date().toISOString().split("T")[0])
        .single();

      if (!error && data) {
        setText(data.text);
      }
    };

    fetchDailyText();
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Boot Diário</h2>
      <p className="text-muted-foreground">{text || "Nenhuma mensagem para hoje."}</p>
    </Card>
  );
};