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

  const checkAndCelebrate = (habitId: number, isCustom: boolean | undefined) => {
    // Ensure we have habits to check
    if (!habits.length && !customHabits?.length) return;

    // Find the habit that was just toggled
    const toggledHabit = isCustom 
      ? customHabits?.find(h => h.id === habitId)
      : habits.find(h => h.id === habitId);

    // Only proceed if we're marking a habit as completed
    if (!toggledHabit?.completed) {
      const defaultHabitsCompleted = habits.every(habit => 
        habit.id === habitId ? !habit.completed : habit.completed
      );
      const customHabitsCompleted = customHabits?.every(habit => 
        habit.id === habitId ? !habit.completed : habit.completed
      ) ?? true;

      const willAllBeCompleted = defaultHabitsCompleted && customHabitsCompleted;

      console.info("Checking celebration conditions:");
      console.info("Default habits will be completed:", defaultHabitsCompleted);
      console.info("Custom habits will be completed:", customHabitsCompleted);
      console.info("All habits will be completed?", willAllBeCompleted);

      if (willAllBeCompleted) {
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
    }
  };

  const handleToggleHabit = async (id: number, isCustom?: boolean) => {
    // Check celebration before toggling the habit
    checkAndCelebrate(id, isCustom);
    await toggleHabit(id, isCustom);
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