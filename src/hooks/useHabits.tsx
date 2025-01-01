import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { calculateAnnualProgress } from "@/utils/habitProgress";
import { updateDefaultHabit, updateCustomHabit, deleteCustomHabit } from "@/utils/habitQueries";
import { useHabitReset } from "./useHabitReset";
import { useHabitQueries } from "./useHabitQueries";
import { HabitState } from "@/types/habitTypes";

export const useHabits = (userId: string | undefined): HabitState => {
  const queryClient = useQueryClient();
  const { lastResetDate } = useHabitReset(userId);
  const { habits, customHabits, refetchDefaultHabits, refetchCustomHabits: originalRefetchCustomHabits } = useHabitQueries(userId);

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

        const newCompletedDays = habitToUpdate.completed ? 
          habitToUpdate.completed_days - 1 : 
          habitToUpdate.completed_days + 1;
        
        const newProgress = calculateAnnualProgress(newCompletedDays);
        console.log('Updating custom habit with:', { completed: !habitToUpdate.completed, completedDays: newCompletedDays, progress: newProgress });

        await updateCustomHabit(id, !habitToUpdate.completed, newCompletedDays, newProgress);
        await originalRefetchCustomHabits();
      } else {
        const habitToUpdate = habits.find(h => h.id === id);
        if (!habitToUpdate) {
          console.error('Default habit not found:', id);
          return;
        }

        const newCompletedDays = habitToUpdate.completed ? 
          habitToUpdate.completedDays - 1 : 
          habitToUpdate.completedDays + 1;
        
        const newProgress = calculateAnnualProgress(newCompletedDays);
        console.log('Updating default habit with:', { completed: !habitToUpdate.completed, completedDays: newCompletedDays, progress: newProgress });

        await updateDefaultHabit(
          userId,
          id,
          !habitToUpdate.completed,
          newCompletedDays,
          newProgress
        );
        
        await refetchDefaultHabits();
      }

      // Força atualização imediata
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

  const deleteHabit = async (id: number) => {
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

  // Wrapper function to make refetchCustomHabits return Promise<void>
  const refetchCustomHabits = async () => {
    await originalRefetchCustomHabits();
  };

  return {
    habits,
    customHabits,
    toggleHabit,
    deleteHabit,
    refetchCustomHabits
  };
};