export const getDaysInCurrentYear = () => {
  const currentYear = new Date().getFullYear();
  // Ano bissexto se for divisível por 4 E (não divisível por 100 OU divisível por 400)
  return ((currentYear % 4 === 0) && (currentYear % 100 !== 0)) || (currentYear % 400 === 0) ? 366 : 365;
};