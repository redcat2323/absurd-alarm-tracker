import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Book, Droplets, Moon, Sun, Timer } from "lucide-react";
import { CustomHabit, DefaultHabit } from "@/types/habits";
import { getDaysInCurrentYear } from "@/utils/dateUtils";

const DEFAULT_HABITS = [
  { id: 1, title: "Tocar o Terror na Terra - 4h59", icon: <Timer className="w-6 h-6" /> },
  { id: 2, title: "Banho Natural", icon: <Droplets className="w-6 h-6" /> },
  { id: 3, title: "Devocional - Boot Diário", icon: <Sun className="w-6 h-6" /> },
  { id: 4, title: "Leitura Diária", icon: <Book className="w-6 h-6" /> },
  { id: 5, title: "Exercício Diário", icon: <Moon className="w-6 h-6" /> },
];

export const useHabits = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [habits, setHabits] = useState<DefaultHabit[]>([]);

  const { data: defaultHabitCompletions } = useQuery({
    queryKey: ['defaultHabitCompletions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('default_habit_completions')
        .select('habit_id, completed, completed_days, progress')
        .eq('user_id', userId);
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
    enabled: !!userId,
  });

  const { data: customHabits, refetch: refetchCustomHabits } = useQuery({
    queryKey: ['customHabits', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('custom_habits')
        .select('*')
        .eq('user_id', userId);
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
    enabled: !!userId,
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

  const calculateAnnualProgress = useCallback((completedDays: number) => {
    const daysInYear = getDaysInCurrentYear();
    return Number(((completedDays / daysInYear) * 100).toFixed(2));
  }, []);

  const toggleHabit = useCallback(async (id: number, isCustom: boolean = false) => {
    if (!userId) return;

    if (isCustom) {
      const habitToUpdate = customHabits?.find(h => h.id === id);
      if (!habitToUpdate) return;

      const newCompletedDays = habitToUpdate.completed ? 
        habitToUpdate.completed_days - 1 : 
        habitToUpdate.completed_days + 1;
      
      const newProgress = calculateAnnualProgress(newCompletedDays);

      try {
        const { error } = await supabase
          .from('custom_habits')
          .update({
            completed: !habitToUpdate.completed,
            completed_days: newCompletedDays,
            progress: newProgress
          })
          .eq('id', id);

        if (error) throw error;
        
        queryClient.setQueryData(['customHabits', userId], (old: any) => 
          old?.map((h: any) => h.id === id ? {
            ...h,
            completed: !habitToUpdate.completed,
            completed_days: newCompletedDays,
            progress: newProgress
          } : h)
        );

        await refetchCustomHabits();

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
    } else {
      const habitToUpdate = habits.find(h => h.id === id);
      if (!habitToUpdate) return;

      const newCompletedDays = habitToUpdate.completed ? 
        habitToUpdate.completedDays - 1 : 
        habitToUpdate.completedDays + 1;
      
      const newProgress = calculateAnnualProgress(newCompletedDays);

      try {
        const { error } = await supabase
          .from('default_habit_completions')
          .upsert({
            user_id: userId,
            habit_id: id,
            completed: !habitToUpdate.completed,
            completed_days: newCompletedDays,
            progress: newProgress
          }, {
            onConflict: 'user_id,habit_id'
          });

        if (error) throw error;

        queryClient.setQueryData(['defaultHabitCompletions', userId], (old: any) => 
          old?.map((h: any) => h.habit_id === id ? {
            ...h,
            completed: !habitToUpdate.completed,
            completed_days: newCompletedDays,
            progress: newProgress
          } : h)
        );

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
    }
  }, [userId, habits, customHabits, calculateAnnualProgress, queryClient, refetchCustomHabits]);

  const deleteHabit = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('custom_habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.setQueryData(['customHabits', userId], (old: any) => 
        old?.filter((h: any) => h.id !== id)
      );
      
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
  }, [userId, queryClient]);

  return {
    habits,
    customHabits: customHabits as CustomHabit[],
    toggleHabit,
    deleteHabit,
    refetchCustomHabits
  };
};
