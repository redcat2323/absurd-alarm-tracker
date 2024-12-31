export const getDaysInCurrentYear = () => {
  const year = new Date().getFullYear();
  return ((year % 4 === 0 && year % 100 > 0) || year % 400 === 0) ? 366 : 365;
};

export const calculateProgress = (completedDays: number): number => {
  const totalDays = getDaysInCurrentYear();
  return Number(((completedDays / totalDays) * 100).toFixed(2));
};

export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};