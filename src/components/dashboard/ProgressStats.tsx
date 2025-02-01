import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Zap, Target } from "lucide-react";

interface ProgressStatsProps {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}

export const ProgressStats = ({ currentStreak, bestStreak, completionRate }: ProgressStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStreak} dias</div>
          <p className="text-xs text-muted-foreground mt-1">dias seguidos completando hábitos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Melhor Sequência</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bestStreak} dias</div>
          <p className="text-xs text-muted-foreground mt-1">seu recorde de dias seguidos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conclusão Diária</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Em média, você completa {completionRate}% dos seus hábitos por dia
          </p>
        </CardContent>
      </Card>
    </div>
  );
};