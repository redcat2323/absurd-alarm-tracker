import React from 'react';
import { getWeek } from 'date-fns';
import { Check, AlertCircle, XCircle } from 'lucide-react';
import { calculateProgress } from '@/utils/dateUtils';

interface HeaderProps {
  userName: string;
  dayOfYear: number;
}

export const Header = ({ userName, dayOfYear }: HeaderProps) => {
  const currentWeek = getWeek(new Date(), { weekStartsOn: 0 }); // 0 = Sunday
  const totalWeeks = 52;
  const yearProgress = calculateProgress(dayOfYear);

  return (
    <div className="text-center -mt-16">
      <div className="mb-4">
        <h1 className="text-4xl font-bold mb-1">
          O Pior Ano<br />
          da Sua Vida
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo, {userName}! | Dia {dayOfYear} do ano ({yearProgress}%) | Semana {currentWeek} de {totalWeeks}
        </p>
      </div>

      <div className="bg-card p-4 rounded-lg shadow-sm max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4">Meta Anual Sugerida</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>+ de 310 dias completados</span>
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>+ de 200 dias completados</span>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>- de 199 dias completados</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground italic">
          "Cada dia é uma nova oportunidade. Não desanime com os dias perdidos, 
          foque nos dias que você conquistou e siga em frente!"
        </p>
      </div>
    </div>
  );
};