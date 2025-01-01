import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { CustomHabit, DefaultHabit } from "@/types/habits";
import { resetDailyHabits, resetAnnualHabits, shouldResetAnnualProgress } from "@/utils/habitReset";
import { calculateAnnualProgress } from "@/utils/habitProgress";
import { DEFAULT_HABITS } from "@/utils/habitConstants";
import {
  fetchDefaultHabitCompletions,
  fetchCustomHabits,
  updateDefaultHabit,
  updateCustomHabit,
  deleteCustomHabit
} from "@/utils/habitQueries";

export const useHabits = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [habits, setHabits] = useState<DefaultHabit[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string>('');

  useEffect(() => {
    if (!userId) return;

    const checkAndResetHabits = async () => {
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0];
      
      if (lastResetDate !== currentDate) {
        await resetDailyHabits(userId);
        setLastResetDate(currentDate);
      }

      if (shouldResetAnnualProgress()) {
        await resetAnnualHabits(userId);
        queryClient.invalidateQueries({ queryKey: ['defaultHabitCompletions', userId] });
        queryClient.invalidateQueries({ queryKey: ['customHabits', userId] });
      }
    };

    checkAndResetHabits();
    const resetInterval = setInterval(checkAndResetHabits, 60000);
    return () => clearInterval(resetInterval);
  }, [userId, lastResetDate, queryClient]);

  const { data: defaultHabitCompletions } = useQuery({
    queryKey: ['defaultHabitCompletions', userId],
    queryFn: () => userId ? fetchDefaultHabitCompletions(userId) : Promise.resolve([]),
    enabled: !!userId,
    staleTime: 1000, // Reduzido para 1 segundo para atualizar mais frequentemente
  });

  const { data: customHabits, refetch: refetchCustomHabits } = useQuery({
    queryKey: ['customHabits', userId],
    queryFn: () => userId ? fetchCustomHabits(userId) : Promise.resolve([]),
    enabled: !!userId,
    staleTime: 1000, // Reduzido para 1 segundo para atualizar mais frequentemente
  });

  useEffect(() => {
    if (defaultHabitCompletions) {
      const habitsWithCompletions = DEFAULT_HABITS.map(habit => {
        const completion = defaultHabitCompletions.find(c => c.habit_id === habit.id);
        return {
          ...habit,
          completed: completion?.completed || false,
          completedDays: completion?.completed_days || 0,
          progress: completion?.progress || 0,
        };
      });
      setHabits(habitsWithCompletions);
    }
  }, [defaultHabitCompletions]);

  const toggleHabit = async (id: number, isCustom: boolean = false) => {
    if (!userId) return;

    try {
      if (isCustom) {
        const habitToUpdate = customHabits?.find(h => h.id === id);
        if (!habitToUpdate) return;

        const newCompletedDays = habitToUpdate.completed ? 
          habitToUpdate.completed_days - 1 : 
          habitToUpdate.completed_days + 1;
        
        const newProgress = calculateAnnualProgress(newCompletedDays);

        await updateCustomHabit(id, !habitToUpdate.completed, newCompletedDays, newProgress);
        await refetchCustomHabits();
      } else {
        const habitToUpdate = habits.find(h => h.id === id);
        if (!habitToUpdate) return;

        const newCompletedDays = habitToUpdate.completed ? 
          habitToUpdate.completedDays - 1 : 
          habitToUpdate.completedDays + 1;
        
        const newProgress = calculateAnnualProgress(newCompletedDays);

        await updateDefaultHabit(
          userId,
          id,
          !habitToUpdate.completed,
          newCompletedDays,
          newProgress
        );
        
        queryClient.invalidateQueries({ queryKey: ['defaultHabitCompletions', userId] });
      }

      toast({
        title: "Hábito atualizado!",
        description: "Seu progresso anual foi atualizado.",
      });
    } catch (error: any) {
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
      await refetchCustomHabits();
      
      toast({
        title: "Hábito removido",
        description: "O hábito personalizado foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    habits,
    customHabits,
    toggleHabit,
    deleteHabit,
    refetchCustomHabits
  };
};