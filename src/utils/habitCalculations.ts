export const calculateAnnualProgress = (completedDays: number) => {
  const getDaysInCurrentYear = () => {
    const year = new Date().getFullYear();
    return ((year % 4 === 0 && year % 100 > 0) || year % 400 === 0) ? 366 : 365;
  };

  const daysInYear = getDaysInCurrentYear();
  return Number(((completedDays / daysInYear) * 100).toFixed(2));
};