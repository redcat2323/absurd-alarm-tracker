
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

    // Check if achievement is already unlocked
    const isAlreadyUnlocked = userAchievements?.some(
      ua => ua.achievement_id === achievementId
    );

    if (isAlreadyUnlocked) {
      return; // Silently return if already unlocked
    }

    try {
      // First, check if this achievement was recently unlocked to prevent duplicate notifications
      const { data: recentAchievement, error: checkError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw checkError;
      }

      // If achievement was already unlocked, just return without showing notification
      if (recentAchievement) {
        return;
      }

      const { error } = await supabase
        .from('user_achievements')
        .insert([
          { user_id: userId, achievement_id: achievementId }
        ]);

      if (error) {
        // If it's not a duplicate error, throw it
        if (error.code !== '23505') {
          throw error;
        }
        // If it is a duplicate, just return silently
        return;
      }

      const achievement = achievements?.find(a => a.id === achievementId);
      
      // Show notification only once for each achievement
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
