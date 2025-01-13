import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCard } from "@/components/AchievementCard";

interface AchievementsSectionProps {
  userId: string;
}

export const AchievementsSection = ({ userId }: AchievementsSectionProps) => {
  const { achievements, userAchievements } = useAchievements(userId);

  if (!achievements) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Conquistas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const unlockedAchievement = userAchievements?.find(
            ua => ua.achievement_id === achievement.id
          );
          
          return (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={!!unlockedAchievement}
              unlockedAt={unlockedAchievement?.unlocked_at}
            />
          );
        })}
      </div>
    </div>
  );
};