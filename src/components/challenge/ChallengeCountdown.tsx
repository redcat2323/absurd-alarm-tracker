
import { differenceInWeeks, differenceInDays, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Calendar, Clock } from 'lucide-react';

export const ChallengeCountdown = () => {
  const targetDate = new Date('2035-05-23');
  const today = new Date();
  
  const weeksRemaining = differenceInWeeks(targetDate, today);
  const daysRemaining = differenceInDays(targetDate, today);
  
  const targetDateFormatted = format(targetDate, 'dd/MM/yyyy');

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Desafio 10K - Rumo à Liberdade
        </h1>
        <p className="text-muted-foreground text-lg">
          Aposentadoria estratégica em {targetDateFormatted}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-700">
              {weeksRemaining}
            </div>
            <p className="text-emerald-600 font-medium">Semanas Restantes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {daysRemaining}
            </div>
            <p className="text-blue-600 font-medium">Dias Restantes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700">
              23/05/2035
            </div>
            <p className="text-purple-600 font-medium">Data Alvo</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Missão do Desafio 10K
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          "Cada dia é uma oportunidade de construir autoridade, expandir audiência e 
          aperfeiçoar sua oferta. Com {weeksRemaining} semanas pela frente, você tem tempo 
          suficiente para criar o negócio digital dos seus sonhos. A liberdade começa hoje!"
        </p>
      </div>
    </div>
  );
};
