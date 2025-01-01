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
        queryClient.invalidateQueries({ queryKey: ['defaultHabitCompletions'] });
        queryClient.invalidateQueries({ queryKey: ['customHabits'] });
      }
    };

    checkAndResetHabits();
    const resetInterval = setInterval(checkAndResetHabits, 60000);
    return () => clearInterval(resetInterval);
  }, [userId, lastResetDate, queryClient]);

  const { data: defaultHabitCompletions, refetch: refetchDefaultHabits } = useQuery({
    queryKey: ['defaultHabitCompletions', userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log('Fetching default habit completions for user:', userId);
      const data = await fetchDefaultHabitCompletions(userId);
      console.log('Fetched default habit completions:', data);
      return data;
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: customHabits, refetch: refetchCustomHabits } = useQuery({
    queryKey: ['customHabits', userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log('Fetching custom habits for user:', userId);
      const data = await fetchCustomHabits(userId);
      console.log('Fetched custom habits:', data);
      return data;
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (defaultHabitCompletions) {
      console.log('Updating habits state with completions:', defaultHabitCompletions);
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
        await refetchCustomHabits();
        queryClient.invalidateQueries({ queryKey: ['customHabits'] });
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
        await queryClient.invalidateQueries({ queryKey: ['defaultHabitCompletions', userId] });
      }

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
      await refetchCustomHabits();
      queryClient.invalidateQueries({ queryKey: ['customHabits'] });
      
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

  return {
    habits,
    customHabits,
    toggleHabit,
    deleteHabit,
    refetchCustomHabits
  };
};