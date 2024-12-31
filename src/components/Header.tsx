interface HeaderProps {
  userName: string;
  dayOfYear: number;
}

export const Header = ({ userName, dayOfYear }: HeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2">O Pior Ano da Sua Vida</h1>
      <p className="text-muted-foreground">
        Bem-vindo, {userName}! | Dia {dayOfYear} do ano
      </p>
    </div>
  );
};