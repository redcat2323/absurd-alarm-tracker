import { Book, Droplets, Moon, Sun, Timer, Plus } from "lucide-react";
import { HabitCard } from "@/components/HabitCard";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Auth } from "@/components/Auth";
import { DailyText } from "@/components/DailyText";
import { WeeklyBook } from "@/components/WeeklyBook";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Habit {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  completedDays: number;
}

interface CustomHabit {
  id: number;
  title: string;
  completed: boolean;
  progress: number;
  completed_days: number;
}

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, title: "Despertar - 4h59", icon: <Timer className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
    { id: 2, title: "Banho Natural", icon: <Droplets className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
    { id: 3, title: "Devocional - Boot Diário", icon: <Sun className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
    { id: 4, title: "Leitura Diária", icon: <Book className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
    { id: 5, title: "Exercício Diário", icon: <Moon className="w-6 h-6" />, completed: false, progress: 0, completedDays: 0 },
  ]);

  const [customHabits, setCustomHabits] = useState<CustomHabit[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [dayOfYear, setDayOfYear] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const calculateDayOfYear = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const day = Math.floor(diff / oneDay);
      setDayOfYear(day);
    };

    calculateDayOfYear();
    fetchCustomHabits();
  }, []);

  const fetchCustomHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_habits')
        .select('*');
      
      if (error) throw error;
      
      setCustomHabits(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar hábitos personalizados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateAnnualProgress = (completedDays: number) => {
    const daysInYear = 365;
    return Math.round((completedDays / daysInYear) * 100);
  };

  const toggleHabit = (id: number, isCustom: boolean = false) => {
    if (isCustom) {
      setCustomHabits(customHabits.map(async (habit) => {
        if (habit.id === id) {
          const newCompletedDays = habit.completed ? habit.completed_days - 1 : habit.completed_days + 1;
          const newProgress = calculateAnnualProgress(newCompletedDays);
          
          try {
            const { error } = await supabase
              .from('custom_habits')
              .update({
                completed: !habit.completed,
                completed_days: newCompletedDays,
                progress: newProgress
              })
              .eq('id', id);
            
            if (error) throw error;
            
            return {
              ...habit,
              completed: !habit.completed,
              completed_days: newCompletedDays,
              progress: newProgress,
            };
          } catch (error: any) {
            toast({
              title: "Erro ao atualizar hábito",
              description: error.message,
              variant: "destructive",
            });
            return habit;
          }
        }
        return habit;
      }));
    } else {
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
    }

    toast({
      title: "Hábito atualizado!",
      description: "Seu progresso anual foi atualizado.",
    });
  };

  const addCustomHabit = async () => {
    if (!newHabitTitle.trim()) {
      toast({
        title: "Erro",
        description: "O título do hábito não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_habits')
        .insert([
          {
            title: newHabitTitle,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setCustomHabits([...customHabits, data[0]]);
        setNewHabitTitle("");
        setIsDialogOpen(false);
        toast({
          title: "Sucesso!",
          description: "Hábito personalizado criado com sucesso.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const resetHabits = () => {
      setHabits(habits.map(habit => ({
        ...habit,
        completed: false
      })));
      
      // Reset custom habits
      customHabits.forEach(async (habit) => {
        try {
          await supabase
            .from('custom_habits')
            .update({ completed: false })
            .eq('id', habit.id);
        } catch (error) {
          console.error('Error resetting custom habit:', error);
        }
      });
      
      setCustomHabits(customHabits.map(habit => ({
        ...habit,
        completed: false
      })));
    };

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilReset = tomorrow.getTime() - now.getTime();
    const resetTimer = setTimeout(resetHabits, timeUntilReset);

    return () => clearTimeout(resetTimer);
  }, [habits, customHabits]);

  const handleLogin = (name: string) => {
    setIsAuthenticated(true);
    setUserName(name);
    fetchCustomHabits();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">O Pior Ano da Sua Vida</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {userName}! | Dia {dayOfYear} do ano
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
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
            
            {customHabits.map((habit) => (
              <HabitCard
                key={`custom-${habit.id}`}
                title={habit.title}
                icon={<Plus className="w-6 h-6" />}
                completed={habit.completed}
                progress={habit.progress}
                onClick={() => toggleHabit(habit.id, true)}
              />
            ))}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Adicionar Hábito Personalizado</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Hábito Personalizado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome do hábito"
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                  />
                  <Button onClick={addCustomHabit} className="w-full">
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-4">
            <DailyText />
            <WeeklyBook />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;