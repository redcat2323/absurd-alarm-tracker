import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and Anon Key are required");
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
      <h2 className="text-xl font-semibold mb-4">Mensagem do Dia</h2>
      <p className="text-muted-foreground">{text || "Nenhuma mensagem para hoje."}</p>
    </Card>
  );
};