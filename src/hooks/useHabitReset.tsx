import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { resetDailyHabits, resetAnnualHabits, shouldResetAnnualProgress } from "@/utils/habitReset";
import { HabitResetState } from "@/types/habitTypes";

export const useHabitReset = (userId: string | undefined): HabitResetState => {
  const queryClient = useQueryClient();
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

  return { lastResetDate, setLastResetDate };
};