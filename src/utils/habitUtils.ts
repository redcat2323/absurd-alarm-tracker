export const calculateAnnualProgress = (completedDays: number) => {
  const daysInYear = 365;
  return Math.round((completedDays / daysInYear) * 100);
};