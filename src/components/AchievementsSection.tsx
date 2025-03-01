
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCard } from "@/components/AchievementCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AchievementsSectionProps {
  userId: string;
}

export const AchievementsSection = ({ userId }: AchievementsSectionProps) => {
  const { achievements, userAchievements } = useAchievements(userId);

  if (!achievements) return null;

  // Group achievements by type
  const streakAchievements = achievements.filter(a => a.type === 'streak');
  const milestoneAchievements = achievements.filter(a => a.type === 'milestone');
  const categoryAchievements = achievements.filter(a => a.type === 'category');
  const seasonalAchievements = achievements.filter(a => a.type === 'seasonal');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Conquistas</h2>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="streak">Sequências</TabsTrigger>
          <TabsTrigger value="category">Categorias</TabsTrigger>
          <TabsTrigger value="milestone">Marcos</TabsTrigger>
          <TabsTrigger value="seasonal">Sazonais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
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
        </TabsContent>
        
        <TabsContent value="streak" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streakAchievements.map((achievement) => {
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
        </TabsContent>
        
        <TabsContent value="category" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryAchievements.map((achievement) => {
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
        </TabsContent>
        
        <TabsContent value="milestone" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestoneAchievements.map((achievement) => {
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
        </TabsContent>
        
        <TabsContent value="seasonal" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasonalAchievements.map((achievement) => {
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
