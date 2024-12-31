import { useState } from "react";
import { HabitList } from "@/components/HabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { useHabits } from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";

interface HabitsSectionProps {
  userId: string;
}

const CELEBRATION_MESSAGES = [
  "🌟 Incrível! Você completou todos os hábitos hoje!",
  "🎉 Que dia produtivo! Continue assim!",
  "💪 Você está arrasando! Mantenha o foco!",
  "🏆 Excelente trabalho! Você é um exemplo!",
  "⭐ Sensacional! Sua dedicação é inspiradora!"
];

export const HabitsSection = ({ userId }: HabitsSectionProps) => {
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { habits, customHabits, toggleHabit, deleteHabit, refetchCustomHabits } = useHabits(userId);

  const checkAndCelebrate = () => {
    const defaultHabitsCompleted = habits.every(habit => habit.completed);
    const customHabitsCompleted = customHabits?.every(habit => habit.completed) ?? true;
    const allHabitsCompleted = defaultHabitsCompleted && customHabitsCompleted;

    console.info("All habits completed?", allHabitsCompleted);
    console.info("Default habits completed:", defaultHabitsCompleted);
    console.info("Custom habits completed:", customHabitsCompleted);

    if (allHabitsCompleted) {
      // Show celebration toast with random message
      const randomMessage = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
      toast({
        title: randomMessage,
        className: "animate-bounce",
      });

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9b87f5', '#7E69AB', '#D946EF'],
      });

      // Add a second burst of confetti for more impact
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#9b87f5', '#7E69AB', '#D946EF'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#9b87f5', '#7E69AB', '#D946EF'],
        });
      }, 250);
    }
  };

  const handleToggleHabit = async (id: number, isCustom?: boolean) => {
    await toggleHabit(id, isCustom);
    // Add a small delay to ensure state updates before checking completion
    setTimeout(checkAndCelebrate, 100);
  };

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
        onToggleHabit={handleToggleHabit}
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