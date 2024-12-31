import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/AdminNav";
import { Auth } from "@/components/Auth";
import { Header } from "@/components/Header";
import { DailyText } from "@/components/DailyText";
import { WeeklyBook } from "@/components/WeeklyBook";
import { HabitList } from "@/components/HabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Book, Droplets, Moon, Sun } from "lucide-react";
import { getDayOfYear } from "@/utils/dateUtils";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = new Date();
  const formattedDate = format(today, "yyyy-MM-dd");
  const dayOfYear = getDayOfYear(today);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || "Usuário");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || "Usuário");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: defaultHabits = [] } = useQuery({
    queryKey: ["defaultHabits", session?.user?.id, formattedDate],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data: completions } = await supabase
        .from("default_habit_completions")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("created_at", `${formattedDate}T00:00:00`)
        .lte("created_at", `${formattedDate}T23:59:59`);

      const defaultHabitsList = [
        { id: 1, title: "Ler a Bíblia", icon: <Book className="w-6 h-6" /> },
        { id: 2, title: "Orar", icon: <Sun className="w-6 h-6" /> },
        { id: 3, title: "Exercitar", icon: <Droplets className="w-6 h-6" /> },
        { id: 4, title: "Estudar", icon: <Moon className="w-6 h-6" /> },
      ];

      return defaultHabitsList.map((habit) => {
        const completion = completions?.find(c => c.habit_id === habit.id);
        return {
          ...habit,
          completed: completion?.completed || false,
          completedDays: completion?.completed_days || 0,
          progress: completion?.progress || 0,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: customHabits = [], refetch: refetchCustomHabits } = useQuery({
    queryKey: ["customHabits", session?.user?.id, formattedDate],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data } = await supabase
        .from("custom_habits")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("created_at", `${formattedDate}T00:00:00`)
        .lte("created_at", `${formattedDate}T23:59:59`);
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: dailyText } = useQuery({
    queryKey: ["dailyText", formattedDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_texts")
        .select("*")
        .eq("date", formattedDate)
        .single();
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });

  const { data: weeklyBook } = useQuery({
    queryKey: ["weeklyBook"],
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_books")
        .select("*")
        .lte("week_start", formattedDate)
        .order("week_start", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const initializeDefaultHabits = async (userId: string) => {
    const { data: existingCompletions } = await supabase
      .from("default_habit_completions")
      .select("habit_id")
      .eq("user_id", userId)
      .gte("created_at", `${formattedDate}T00:00:00`)
      .lte("created_at", `${formattedDate}T23:59:59`);

    if (!existingCompletions || existingCompletions.length === 0) {
      const defaultHabitsData = [1, 2, 3, 4].map((habitId) => ({
        user_id: userId,
        habit_id: habitId,
        completed_days: 0,
        progress: 0,
        completed: false,
      }));

      await supabase.from("default_habit_completions").insert(defaultHabitsData);
      queryClient.invalidateQueries({ queryKey: ["defaultHabits"] });
    }
  };

  const toggleHabit = async (id: number, isCustom?: boolean) => {
    const user = session?.user;
    if (!user) return;

    try {
      const habitToUpdate = isCustom 
        ? customHabits?.find(h => h.id === id)
        : defaultHabits?.find(h => h.id === id);

      if (!habitToUpdate) return;

      const newCompletedDays = habitToUpdate.completed
        ? Math.max(0, (habitToUpdate.completedDays || habitToUpdate.completed_days || 0) - 1)
        : (habitToUpdate.completedDays || habitToUpdate.completed_days || 0) + 1;
      const newProgress = (newCompletedDays / 365) * 100;

      if (isCustom) {
        await supabase
          .from("custom_habits")
          .update({
            completed: !habitToUpdate.completed,
            completed_days: newCompletedDays,
            progress: newProgress,
          })
          .eq("id", id);

        refetchCustomHabits();
      } else {
        await supabase
          .from("default_habit_completions")
          .upsert({
            user_id: user.id,
            habit_id: id,
            completed: !habitToUpdate.completed,
            completed_days: newCompletedDays,
            progress: newProgress
          }, {
            onConflict: "user_id,habit_id",
          });

        queryClient.invalidateQueries({ queryKey: ["defaultHabits"] });
      }

      if (!habitToUpdate.completed && newCompletedDays === 365) {
        toast({
          title: "Parabéns! 🎉",
          description: "Você completou 365 dias deste hábito!",
        });
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o hábito.",
        variant: "destructive",
      });
    }
  };

  const deleteHabit = async (id: number) => {
    try {
      await supabase
        .from("custom_habits")
        .delete()
        .eq("id", id);
      
      refetchCustomHabits();
      
      toast({
        title: "Sucesso",
        description: "Hábito removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o hábito.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (name: string) => {
    setUserName(name);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await initializeDefaultHabits(user.id);
    }
  };

  useEffect(() => {
    const checkYearTransition = async () => {
      if (!session?.user) return;

      const lastLoginKey = `lastLogin_${session.user.id}`;
      const lastLogin = localStorage.getItem(lastLoginKey);
      const currentYear = new Date().getFullYear();

      if (lastLogin) {
        const lastLoginYear = new Date(lastLogin).getFullYear();
        if (currentYear > lastLoginYear) {
          const { data: habits } = await supabase
            .from("default_habit_completions")
            .select("*")
            .eq("user_id", session.user.id);

          if (habits && habits.length > 0) {
            await supabase
              .from("default_habit_completions")
              .update({
                completed_days: 0,
                progress: 0,
                completed: false,
              })
              .eq("user_id", session.user.id);

            await supabase
              .from("custom_habits")
              .update({
                completed_days: 0,
                progress: 0,
                completed: false,
              })
              .eq("user_id", session.user.id);

            toast({
              title: "Feliz Ano Novo! 🎉",
              description: "Seus hábitos foram resetados para o novo ano.",
            });
            await initializeDefaultHabits(session.user.id);
            await refetchCustomHabits();
          }
        }
      }

      localStorage.setItem(lastLoginKey, new Date().toISOString());
    };

    checkYearTransition();
  }, [session]);

  if (!session) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <Header userName={userName} dayOfYear={dayOfYear} />
        <div className="mt-8 space-y-8">
          {dailyText && (
            <DailyText text={dailyText.text} />
          )}
          {weeklyBook && (
            <WeeklyBook
              title={weeklyBook.title}
              author={weeklyBook.author}
              description={weeklyBook.description}
              pdfUrl={weeklyBook.pdf_url}
            />
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Meus Hábitos</h2>
              <AddHabitDialog onHabitAdded={refetchCustomHabits} />
            </div>
            <HabitList
              defaultHabits={defaultHabits}
              customHabits={customHabits}
              onToggleHabit={toggleHabit}
              onDeleteHabit={deleteHabit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
