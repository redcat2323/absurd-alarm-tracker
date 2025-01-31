import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DailyTextInput } from "./daily-text/DailyTextInput";
import { DailyTextHistory } from "./daily-text/DailyTextHistory";

type DailyText = {
  id: number;
  text: string;
  date: string;
  created_at: string;
};

const DailyTextForm = () => {
  const [dailyTexts, setDailyTexts] = useState<DailyText[]>([]);
  const { toast } = useToast();

  const fetchDailyTexts = async () => {
    const { data, error } = await supabase
      .from("daily_texts")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar textos diários.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setDailyTexts(data);
    }
  };

  useEffect(() => {
    fetchDailyTexts();
  }, []);

  return (
    <div className="space-y-8">
      <DailyTextInput onTextSaved={fetchDailyTexts} />
      <DailyTextHistory dailyTexts={dailyTexts} />
    </div>
  );
};

export default DailyTextForm;