import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  onClick: () => void;
}

export const HabitCard = ({ title, icon, completed, progress, onClick }: HabitCardProps) => {
  return (
    <Card
      className={cn(
        "p-6 cursor-pointer transition-all hover:shadow-lg",
        completed ? "border-secondary" : "border-muted"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        {completed ? (
          <Check className="w-6 h-6 text-secondary" />
        ) : (
          <X className="w-6 h-6 text-destructive" />
        )}
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground mt-2">
        {progress}% completo
      </p>
    </Card>
  );
};