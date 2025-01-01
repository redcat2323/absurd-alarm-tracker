import { getDaysInCurrentYear } from "@/utils/dateUtils";

export const calculateAnnualProgress = (completedDays: number) => {
  const daysInYear = getDaysInCurrentYear();
  return Number(((completedDays / daysInYear) * 100).toFixed(2));
};