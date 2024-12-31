import { useState } from "react";
import { HabitList } from "@/components/HabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { useHabits } from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import confetti from 'canvas-confetti';

interface HabitsSectionProps {
  userId: string;
}

export const HabitsSection = ({ userId }: HabitsSectionProps) => {
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { habits, customHabits, toggleHabit, deleteHabit, refetchCustomHabits } = useHabits(userId);

  const checkAllHabitsCompleted = () => {
    // Verifica se há hábitos para checar
    if (habits.length === 0 && (!customHabits || customHabits.length === 0)) {
      return false;
    }

    // Verifica os hábitos padrão
    const allDefaultHabitsCompleted = habits.length > 0 ? 
      habits.every(habit => habit.completed) : true;

    // Verifica os hábitos personalizados
    const allCustomHabitsCompleted = customHabits && customHabits.length > 0 ? 
      customHabits.every(habit => habit.completed) : true;

    console.log('Default habits completed:', allDefaultHabitsCompleted);
    console.log('Custom habits completed:', allCustomHabitsCompleted);
    
    return allDefaultHabitsCompleted && allCustomHabitsCompleted;
  };

  const celebrateCompletion = () => {
    const celebrationMessages = [
      "🎉 Parabéns! Você completou todos os hábitos de hoje!",
      "⭐ Incrível trabalho! Continue assim!",
      "🌟 Que dia produtivo! Você arrasou!",
      "🏆 Meta diária alcançada! Você é demais!",
      "💪 Excelente! Seu comprometimento é inspirador!"
    ];

    const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

    sonnerToast(randomMessage, {
      duration: 5000,
      className: "animate-bounce",
      style: {
        background: 'linear-gradient(to right, #9b87f5, #7E69AB)',
        color: 'white',
        border: 'none',
      },
    });

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#9b87f5', '#7E69AB', '#D946EF']
    });
  };

  const handleToggleHabit = async (id: number, isCustom?: boolean) => {
    await toggleHabit(id, isCustom);
    
    // Adiciona um pequeno delay para garantir que o estado foi atualizado
    setTimeout(() => {
      const allCompleted = checkAllHabitsCompleted();
      console.log('All habits completed?', allCompleted);
      if (allCompleted) {
        celebrateCompletion();
      }
    }, 100);
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
