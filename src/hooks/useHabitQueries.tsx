import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DefaultHabit } from "@/types/habits";
import { DEFAULT_HABITS } from "@/utils/habitConstants";

const fetchDefaultHabitCompletions = async (userId: string) => {
  console.log('Fetching default habit completions for user:', userId);
  const { data, error } = await supabase
    .from('default_habit_completions')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching default habits:', error);
    throw error;
  }
  
  console.log('Fetched default habit completions:', data);
  return data || [];
};

const fetchCustomHabits = async (userId: string) => {
  console.log('Fetching custom habits for user:', userId);
  const { data, error } = await supabase
    .from('custom_habits')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching custom habits:', error);
    throw error;
  }
  
  console.log('Fetched custom habits:', data);
  return data || [];
};

export const useHabitQueries = (userId: string | undefined) => {
  const { data: defaultHabitCompletions, refetch: refetchDefaultHabits } = useQuery({
    queryKey: ['defaultHabitCompletions', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await fetchDefaultHabitCompletions(userId);
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0
  });

  const { data: customHabits, refetch: refetchCustomHabits } = useQuery({
    queryKey: ['customHabits', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await fetchCustomHabits(userId);
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0
  });

  const processedHabits: DefaultHabit[] = DEFAULT_HABITS.map(habit => {
    const completion = defaultHabitCompletions?.find(c => c.habit_id === habit.id);
    return {
      ...habit,
      completed: completion?.completed || false,
      completedDays: completion?.completed_days || 0,
      progress: completion?.progress || 0,
    };
  });

  return {
    habits: processedHabits,
    customHabits,
    refetchDefaultHabits,
    refetchCustomHabits
  };
};