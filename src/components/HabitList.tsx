import { Sun } from "lucide-react";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { defaultHabits } from "@/data/defaultHabits";
import { calculateAnnualProgress } from "@/utils/habitUtils";
import type { Habit } from "@/types/habit";

export const HabitList = () => {
  const queryClient = useQueryClient();

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
      if (habit.id > 5) {
        const { data, error } = await supabase
          .from('custom_habits')
          .update({
            completed: !habit.completed,
            completed_days: habit.completed ? habit.completed_days - 1 : habit.completed_days + 1,
            progress: calculateAnnualProgress(habit.completed ? habit.completed_days - 1 : habit.completed_days + 1),
          })
          .eq('id', habit.id)
          .select()
          .maybeSingle();
        
        if (error) throw error;
        return data;
      }
      
      return {
        ...habit,
        completed: !habit.completed,
        completed_days: habit.completed ? habit.completed_days - 1 : habit.completed_days + 1,
        progress: calculateAnnualProgress(habit.completed ? habit.completed_days - 1 : habit.completed_days + 1),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success("Hábito atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar hábito: " + error.message);
    },
  });

  const allHabits = [...defaultHabits, ...customHabits];

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <AddHabitDialog onCreateHabit={(title) => createHabitMutation.mutate(title)} />
      </div>
      
      {allHabits.map((habit) => {
        const uniqueKey = `habit-${habit.id}-${habit.title.replace(/\s+/g, '-')}`;
        return (
          <HabitCard
            key={uniqueKey}
            title={habit.title}
            icon={habit.icon}
            completed={habit.completed}
            progress={habit.progress}
            onClick={() => updateHabitMutation.mutate(habit)}
            onDelete={habit.id > 5 ? () => deleteHabitMutation.mutate(habit.id) : undefined}
            isCustom={habit.id > 5}
          />
        );
      })}
    </div>
  );
};