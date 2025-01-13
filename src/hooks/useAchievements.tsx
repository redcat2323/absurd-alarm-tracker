import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Achievement, UserAchievement } from "@/types/achievements";
import { toast } from "@/components/ui/use-toast";

export const useAchievements = (userId: string | undefined) => {
  // Fetch all available achievements
  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!userId,
  });

  // Fetch user's unlocked achievements
  const { data: userAchievements, refetch: refetchUserAchievements } = useQuery({
    queryKey: ['userAchievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!userId,
  });

  const unlockAchievement = async (achievementId: number) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert([
          { user_id: userId, achievement_id: achievementId }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          return; // Achievement already unlocked
        }
        throw error;
      }

      const achievement = achievements?.find(a => a.id === achievementId);
      
      toast({
        title: "🎉 Nova Conquista Desbloqueada!",
        description: achievement?.title,
      });

      await refetchUserAchievements();
    } catch (error: any) {
      console.error('Error unlocking achievement:', error);
      toast({
        title: "Erro ao desbloquear conquista",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    achievements,
    userAchievements,
    unlockAchievement,
    refetchUserAchievements,
  };
};