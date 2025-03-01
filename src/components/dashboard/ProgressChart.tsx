
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';

interface ProgressChartProps {
  data: Array<{
    date: string;
    completed: number;
  }>;
}

export const ProgressChart = ({ data }: ProgressChartProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  
  // Filter data for current week
  const weeklyData = data.filter(item => {
    const itemDate = parseISO(item.date);
    return itemDate >= currentWeekStart && itemDate <= currentWeekEnd;
  });
  
  // Calculate average completion rate for current week
  const weeklyCompletionRate = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, item) => sum + item.completed, 0) / weeklyData.length)
    : 0;
  
  // Function to navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevWeek => subWeeks(prevWeek, 1));
  };
  
  // Function to navigate to next week
  const goToNextWeek = () => {
    const nextWeekStart = addWeeks(currentWeekStart, 1);
    // Don't allow navigating to future weeks
    if (nextWeekStart <= new Date()) {
      setCurrentWeekStart(nextWeekStart);
    }
  };
  
  // Check if we can navigate to next week
  const canGoNext = addWeeks(currentWeekStart, 1) <= new Date();
  
  // Format the week range for display
  const weekRangeText = `${format(currentWeekStart, 'dd/MM')} - ${format(currentWeekEnd, 'dd/MM/yyyy')}`;

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Progresso ao Longo do Tempo</CardTitle>
          <CardDescription>
            Semana: {weekRangeText}
            {weeklyData.length > 0 && (
              <span className="ml-2 font-medium text-primary">
                Taxa média: {weeklyCompletionRate}%
              </span>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToNextWeek}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(parseISO(value), 'EEE dd/MM')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(parseISO(value), 'eeee, dd/MM/yyyy')}
                  formatter={(value: number) => [`${value} hábitos`, 'Completados']}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Sem dados para esta semana
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
