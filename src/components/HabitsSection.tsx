import { useState } from "react";
import { HabitList } from "@/components/HabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { useHabits } from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface HabitsSectionProps {
  userId: string;
}

export const HabitsSection = ({ userId }: HabitsSectionProps) => {
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { habits, customHabits, toggleHabit, deleteHabit, refetchCustomHabits } = useHabits(userId);

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

      await refetchCustomHabits();
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
    <div className="space-y-4">
      <HabitList
        habits={habits}
        customHabits={customHabits || []}
        onToggleHabit={toggleHabit}
        onDeleteHabit={deleteHabit}
      />
      
      <AddHabitDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        newHabitTitle={newHabitTitle}
        onTitleChange={setNewHabitTitle}
        onAddHabit={addCustomHabit}
      />
    </div>
  );
};