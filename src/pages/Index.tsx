import { Book, Droplets, Moon, Sun, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Auth } from "@/components/Auth";
import { DailyText } from "@/components/DailyText";
import { WeeklyBook } from "@/components/WeeklyBook";
import { supabase } from "@/integrations/supabase/client";
import { HabitList } from "@/components/HabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { CustomHabit, DefaultHabit } from "@/types/habits";

const Index = () => {
  const [habits, setHabits] = useState<DefaultHabit[]>([
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

  const deleteHabit = async (id: number) => {
    try {
      const { error } = await supabase
        .from('custom_habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCustomHabits(customHabits.filter(habit => habit.id !== id));
      
      toast({
        title: "Hábito removido",
        description: "O hábito personalizado foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover hábito",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const toggleHabit = async (id: number, isCustom: boolean = false) => {
    if (isCustom) {
      const updatedHabits = await Promise.all(
        customHabits.map(async (habit) => {
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
        })
      );

      setCustomHabits(updatedHabits);
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
          <h1 className="text-4xl font-bold mb-2">
            <span className="inline md:inline-block">O Pior Ano</span>{" "}
            <span className="inline md:inline-block">da Sua Vida</span>
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {userName}! | Dia {dayOfYear} do ano
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <HabitList
              habits={habits}
              customHabits={customHabits}
              onToggleHabit={toggleHabit}
              onDeleteHabit={deleteHabit}
            />
            
            <AddHabitDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              newHabitTitle={newHabitTitle}
              onTitleChange={setNewHabitTitle}
              onAddHabit={addCustomHabit}
            />
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