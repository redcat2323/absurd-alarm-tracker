import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Book, Droplets, Moon, Sun, Timer } from "lucide-react";
import { CustomHabit, DefaultHabit } from "@/types/habits";
import { checkDailyCompletion, recordDailyCompletion, getTodayCompletions } from "@/services/habitCompletions";
import { updateCustomHabit, updateDefaultHabit } from "@/services/habitUpdates";

const DEFAULT_HABITS = [
  { id: 1, title: "Tocar o Terror na Terra - 4h59", icon: <Timer className="w-6 h-6" /> },
  { id: 2, title: "Banho Natural", icon: <Droplets className="w-6 h-6" /> },
  { id: 3, title: "Devocional - Boot Diário", icon: <Sun className="w-6 h-6" /> },
  { id: 4, title: "Leitura Diária", icon: <Book className="w-6 h-6" /> },
  { id: 5, title: "Exercício Diário", icon: <Moon className="w-6 h-6" /> },
];

// Intervalo de atualização em milissegundos (30 segundos)
const REFETCH_INTERVAL = 30000;

export const useHabits = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [habits, setHabits] = useState<DefaultHabit[]>([]);

  // Fetch default habits with caching
  const { data: defaultHabitCompletions } = useQuery({
    queryKey: ['defaultHabitCompletions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('default_habit_completions')
        .select('*')
        .eq('user_id', userId);
      return data || [];
    },
    staleTime: REFETCH_INTERVAL,
    refetchInterval: REFETCH_INTERVAL,
    enabled: !!userId,
  });

  // Fetch custom habits with caching
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
    staleTime: REFETCH_INTERVAL,
    refetchInterval: REFETCH_INTERVAL,
    enabled: !!userId,
  });

  // Fetch today's completions
  const { data: todayCompletions, refetch: refetchTodayCompletions } = useQuery({
    queryKey: ['todayCompletions', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getTodayCompletions(userId);
    },
    staleTime: REFETCH_INTERVAL,
    refetchInterval: REFETCH_INTERVAL,
    enabled: !!userId,
  });

  useEffect(() => {
    if (defaultHabitCompletions && todayCompletions) {
      const habitsWithCompletions = DEFAULT_HABITS.map(habit => {
        const completion = defaultHabitCompletions.find(c => c.habit_id === habit.id);
        const completedToday = todayCompletions.some(
          c => c.habit_id === habit.id && !c.is_custom_habit
        );
        
        return {
          ...habit,
          completed: completedToday,
          completed_days: completion?.completed_days || 0,
          progress: completion?.progress || 0,
        };
      });
      setHabits(habitsWithCompletions);
    }
  }, [defaultHabitCompletions, todayCompletions]);

  const toggleHabit = async (id: number, isCustom: boolean = false) => {
    if (!userId) return;

    try {
      const existingCompletion = await checkDailyCompletion(userId, id, isCustom);
      
      if (existingCompletion) {
        toast({
          title: "Hábito já concluído",
          description: "Você já marcou este hábito como concluído hoje.",
          variant: "destructive",
        });
        return;
      }

      if (isCustom) {
        const habitToUpdate = customHabits?.find(h => h.id === id);
        if (!habitToUpdate) return;

        await updateCustomHabit(habitToUpdate, true);
        await recordDailyCompletion(userId, id, true);
        await refetchCustomHabits();
      } else {
        const habitToUpdate = habits.find(h => h.id === id);
        if (!habitToUpdate) return;

        await updateDefaultHabit(userId, habitToUpdate, true);
        await recordDailyCompletion(userId, id, false);
        
        // Invalidate and refetch all relevant queries
        queryClient.invalidateQueries({ queryKey: ['defaultHabitCompletions', userId] });
        queryClient.invalidateQueries({ queryKey: ['todayCompletions', userId] });
      }

      // Force refetch of today's completions
      await refetchTodayCompletions();

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
      const { error } = await supabase
        .from('custom_habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
    customHabits: customHabits?.map(habit => ({
      ...habit,
      completed: todayCompletions?.some(
        c => c.habit_id === habit.id && c.is_custom_habit
      ) || false,
    })) || [],
    toggleHabit,
    deleteHabit,
    refetchCustomHabits
  };
};
