export const getDaysInCurrentYear = () => {
  const year = new Date().getFullYear();
  return ((year % 4 === 0 && year % 100 > 0) || year % 400 === 0) ? 366 : 365;
};

export const calculateProgress = (completedDays: number): number => {
  const totalDays = getDaysInCurrentYear();
  return Number(((completedDays / totalDays) * 100).toFixed(2));
};