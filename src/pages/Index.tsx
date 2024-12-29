import { Book, Droplets, Moon, Sun, Timer } from "lucide-react";
import { HabitCard } from "@/components/HabitCard";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface Habit {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  completedDays: number;
}

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, title: "Despertar", icon: <Timer className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
    { id: 2, title: "Banho Natural", icon: <Droplets className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
    { id: 3, title: "Devocional", icon: <Sun className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
    { id: 4, title: "Leitura", icon: <Book className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
    { id: 5, title: "Exercício", icon: <Moon className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
  ]);

  // Calcula o progresso anual baseado nos dias completados
  const calculateAnnualProgress = (completedDays: number) => {
    const daysInYear = 365;
    return Math.round((completedDays / daysInYear) * 100);
  };

  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const newCompletedDays = habit.completed ? habit.completedDays - 1 : habit.completedDays + 1;
        const newProgress = calculateAnnualProgress(newCompletedDays);
        
        return {
          ...habit,
          completed: !habit.completed,
          completedDays: newCompletedDays,
          progress: newProgress,
        };
      }
      return habit;
    }));

    toast({
      title: "Hábito atualizado!",
      description: "Seu progresso anual foi atualizado.",
    });
  };

  // Reseta os hábitos diariamente
  useEffect(() => {
    const resetHabits = () => {
      setHabits(habits.map(habit => ({
        ...habit,
        completed: false
      })));
    };

    // Verifica se é um novo dia
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilReset = tomorrow.getTime() - now.getTime();
    const resetTimer = setTimeout(resetHabits, timeUntilReset);

    return () => clearTimeout(resetTimer);
  }, [habits]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">O Pior Ano</h1>
        <p className="text-muted-foreground text-center mb-8">
          Transforme seu ano através de hábitos diários
        </p>
        
        <div className="flex flex-col gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              title={habit.title}
              icon={habit.icon}
              completed={habit.completed}
              progress={habit.progress}
              onClick={() => toggleHabit(habit.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
