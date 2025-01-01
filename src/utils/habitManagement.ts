import { calculateAnnualProgress } from "@/utils/habitProgress";
import { updateDefaultHabit, updateCustomHabit, deleteCustomHabit as deleteHabitFromDB } from "@/utils/habitQueries";

export const toggleDefaultHabit = async (
  userId: string,
  habitId: number,
  currentCompleted: boolean,
  currentCompletedDays: number
) => {
  const newCompletedDays = currentCompleted ? 
    currentCompletedDays - 1 : 
    currentCompletedDays + 1;
  
  const newProgress = calculateAnnualProgress(newCompletedDays);
  console.log('Updating default habit with:', { completed: !currentCompleted, completedDays: newCompletedDays, progress: newProgress });

  const result = await updateDefaultHabit(
    userId,
    habitId,
    !currentCompleted,
    newCompletedDays,
    newProgress
  );
  
  return result;
};

export const toggleCustomHabit = async (
  habitId: number,
  currentCompleted: boolean,
  currentCompletedDays: number
) => {
  const newCompletedDays = currentCompleted ? 
    currentCompletedDays - 1 : 
    currentCompletedDays + 1;
  
  const newProgress = calculateAnnualProgress(newCompletedDays);
  console.log('Updating custom habit with:', { completed: !currentCompleted, completedDays: newCompletedDays, progress: newProgress });

  const result = await updateCustomHabit(
    habitId,
    !currentCompleted,
    newCompletedDays,
    newProgress
  );
  
  return result;
};

export const deleteCustomHabit = async (id: number) => {
  await deleteHabitFromDB(id);
};