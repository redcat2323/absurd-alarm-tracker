import { useState } from "react";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AddHabitFormProps {
  userId: string;
  onHabitAdded: () => Promise<void>;
}

export const AddHabitForm = ({ userId, onHabitAdded }: AddHabitFormProps) => {
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addCustomHabit = async () => {
    if (!newHabitTitle.trim()) {
      toast({
        title: "Erro",
        description: "O título do hábito não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_habits')
        .insert([
          {
            title: newHabitTitle,
            user_id: userId,
          }
        ]);

      if (error) throw error;

      await onHabitAdded();
      setNewHabitTitle("");
      setIsDialogOpen(false);
      
      toast({
        title: "Sucesso!",
        description: "Hábito personalizado criado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AddHabitDialog
      isOpen={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      newHabitTitle={newHabitTitle}
      onTitleChange={setNewHabitTitle}
      onAddHabit={addCustomHabit}
    />
  );
};