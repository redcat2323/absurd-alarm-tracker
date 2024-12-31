import { Book, Droplets, Moon, Sun, Timer, Plus } from "lucide-react";
import { HabitCard } from "@/components/HabitCard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Auth } from "@/components/Auth";
import { DailyText } from "@/components/DailyText";
import { WeeklyBook } from "@/components/WeeklyBook";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Habit {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  completed_days: number;
}

const defaultHabits: Habit[] = [
  { id: 1, title: "Despertar - 4h59", icon: <Timer className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
  { id: 2, title: "Banho Natural", icon: <Droplets className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
  { id: 3, title: "Devocional - Boot Diário", icon: <Sun className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
  { id: 4, title: "Leitura Diária", icon: <Book className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
  { id: 5, title: "Exercício Diário", icon: <Moon className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
];

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [dayOfYear, setDayOfYear] = useState(0);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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
  }, []);

  const { data: customHabits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_habits')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data.map(habit => ({
        ...habit,
        icon: <Sun className="w-6 h-6" />,
      }));
    },
    enabled: isAuthenticated,
  });

  const createHabitMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from('custom_habits')
        .insert([{ title, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setNewHabitTitle("");
      setIsDialogOpen(false);
      toast.success("Hábito criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar hábito: " + error.message);
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const { error } = await supabase
        .from('custom_habits')
        .delete()
        .eq('id', habitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success("Hábito removido com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover hábito: " + error.message);
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async (habit: Habit) => {
      const { data, error } = await supabase
        .from('custom_habits')
        .update({
          completed: !habit.completed,
          completed_days: habit.completed ? habit.completed_days - 1 : habit.completed_days + 1,
          progress: calculateAnnualProgress(habit.completed ? habit.completed_days - 1 : habit.completed_days + 1),
        })
        .eq('id', habit.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success("Hábito atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar hábito: " + error.message);
    },
  });

  const calculateAnnualProgress = (completedDays: number) => {
    const daysInYear = 365;
    return Math.round((completedDays / daysInYear) * 100);
  };

  const handleLogin = (name: string) => {
    setIsAuthenticated(true);
    setUserName(name);
  };

  const handleCreateHabit = () => {
    if (newHabitTitle.trim()) {
      createHabitMutation.mutate(newHabitTitle.trim());
    }
  };

  const handleDeleteHabit = (habitId: number) => {
    deleteHabitMutation.mutate(habitId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  const allHabits = [...defaultHabits, ...customHabits];

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
            <div className="flex justify-end mb-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Hábito
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Hábito</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Nome do hábito"
                      value={newHabitTitle}
                      onChange={(e) => setNewHabitTitle(e.target.value)}
                    />
                    <Button 
                      onClick={handleCreateHabit}
                      disabled={!newHabitTitle.trim()}
                      className="w-full"
                    >
                      Criar Hábito
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {allHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                title={habit.title}
                icon={habit.icon}
                completed={habit.completed}
                progress={habit.progress}
                onClick={() => updateHabitMutation.mutate(habit)}
                onDelete={habit.id > 5 ? () => handleDeleteHabit(habit.id) : undefined}
                isCustom={habit.id > 5}
              />
            ))}
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