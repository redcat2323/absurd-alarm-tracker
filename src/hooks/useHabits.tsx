import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useHabitReset } from "./useHabitReset";
import { useHabitQueries } from "./useHabitQueries";
import { HabitState } from "@/types/habitTypes";
import { 
  toggleDefaultHabit, 
  toggleCustomHabit, 
  deleteCustomHabit,
  wasHabitCompletedToday
} from "@/utils/habitManagement";

export const useHabits = (userId: string | undefined): HabitState => {
  const queryClient = useQueryClient();
  const { lastResetDate } = useHabitReset(userId);
  const { 
    habits, 
    customHabits, 
    refetchDefaultHabits, 
    refetchCustomHabits: originalRefetchCustomHabits 
  } = useHabitQueries(userId);

  const toggleHabit = async (id: number, isCustom: boolean = false) => {
    if (!userId) return;
    console.log(`Toggling ${isCustom ? 'custom' : 'default'} habit:`, id);

    try {
      if (isCustom) {
        const habitToUpdate = customHabits?.find(h => h.id === id);
        if (!habitToUpdate) {
          console.error('Custom habit not found:', id);
          return;
        }

        const result = await toggleCustomHabit(
          id,
          habitToUpdate.completed,
          habitToUpdate.completed_days
        );
        
        // Se o resultado for null, significa que o hábito já foi concluído hoje
        if (result === null) return;
        
        await originalRefetchCustomHabits();
      } else {
        const habitToUpdate = habits.find(h => h.id === id);
        if (!habitToUpdate) {
          console.error('Default habit not found:', id);
          return;
        }

        const result = await toggleDefaultHabit(
          userId,
          id,
          habitToUpdate.completed,
          habitToUpdate.completedDays
        );
        
        // Se o resultado for null, significa que o hábito já foi concluído hoje
        if (result === null) return;
        
        await refetchDefaultHabits();
      }

      await queryClient.invalidateQueries({ queryKey: ['defaultHabitCompletions', userId] });
      await queryClient.invalidateQueries({ queryKey: ['customHabits', userId] });

      toast({
        title: "Hábito atualizado!",
        description: "Seu progresso anual foi atualizado.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar hábito:', error);
      toast({
        title: "Erro ao atualizar hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteHabit = async (id: number) => {
    try {
      await deleteCustomHabit(id);
      await originalRefetchCustomHabits();
      await queryClient.invalidateQueries({ queryKey: ['customHabits', userId] });
      
      toast({
        title: "Hábito removido",
        description: "O hábito personalizado foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover hábito:', error);
      toast({
        title: "Erro ao remover hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const refetchCustomHabits = async () => {
    await originalRefetchCustomHabits();
  };

  return {
    habits,
    customHabits,
    toggleHabit,
    deleteHabit: handleDeleteHabit,
    refetchCustomHabits
  };
};