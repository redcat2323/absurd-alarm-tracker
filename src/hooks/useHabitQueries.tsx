import { useQuery } from "@tanstack/react-query";
import { fetchDefaultHabitCompletions, fetchCustomHabits } from "@/utils/habitQueries";
import { DefaultHabit } from "@/types/habits";
import { DEFAULT_HABITS } from "@/utils/habitConstants";

export const useHabitQueries = (userId: string | undefined) => {
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
    staleTime: 0
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