import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface DailyTextInputProps {
  onTextSaved: () => void;
}

export const DailyTextInput = ({ onTextSaved }: DailyTextInputProps) => {
  const [dailyText, setDailyText] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchExistingText = async () => {
      // Don't fetch if date is empty
      if (!selectedDate) {
        setDailyText("");
        return;
      }

      const { data, error } = await supabase
        .from("daily_texts")
        .select("text")
        .eq("date", selectedDate)
        .maybeSingle();

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar texto existente.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setDailyText(data.text);
      } else {
        setDailyText("");
      }
    };

    fetchExistingText();
  }, [selectedDate, toast]);

  const clearForm = () => {
    setDailyText("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleDailyTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data.",
        variant: "destructive",
      });
      return;
    }

    if (!dailyText.trim()) {
      toast({
        title: "Erro",
        description: "O texto do boot não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("daily_texts")
      .upsert(
        { text: dailyText, date: selectedDate },
        { onConflict: "date" }
      );

    if (error) {
      console.error("Error saving daily text:", error);
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
      onTextSaved();
      clearForm();
    }
  };

  return (
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
            required
          />
        </div>
        <div>
          <Label htmlFor="boot-text">Texto do Boot</Label>
          <RichTextEditor
            value={dailyText}
            onChange={setDailyText}
            placeholder="Digite o texto do dia..."
          />
        </div>
        <Button type="submit">Salvar Texto Diário</Button>
      </form>
    </Card>
  );
};