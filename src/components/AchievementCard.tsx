import { Card } from "@/components/ui/card";
import { Award, BadgeCheck, Book, Medal, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievements";

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
}

const iconMap = {
  'badge-check': BadgeCheck,
  'trophy': Trophy,
  'award': Award,
  'book': Book,
  'star': Star,
  'medal': Medal,
};

export const AchievementCard = ({ achievement, unlocked, unlockedAt }: AchievementCardProps) => {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap];

  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-lg relative overflow-hidden",
      unlocked ? "border-yellow-500" : "border-muted opacity-75"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-2 rounded-full",
          unlocked ? "bg-yellow-500/10 text-yellow-500" : "bg-muted text-muted-foreground"
        )}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">{achievement.title}</h3>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-muted-foreground">
              Desbloqueado em {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {!unlocked && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="p-2 rounded-full bg-muted">
            <Award className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      )}
    </Card>
  );
};