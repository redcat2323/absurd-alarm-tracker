import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getDaysInCurrentYear } from "@/utils/dateUtils";

interface HabitCardProps {
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  completed_days: number;
  onClick: () => void;
  onDelete?: () => void;
  isCustom?: boolean;
}

export const HabitCard = ({ 
  title, 
  icon, 
  completed, 
  progress, 
  completed_days,
  onClick,
  onDelete,
  isCustom 
}: HabitCardProps) => {
  const totalDaysInYear = getDaysInCurrentYear();

  return (
    <Card
      className={cn(
        "p-6 transition-all hover:shadow-lg",
        completed ? "border-emerald-500" : "border-muted"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {completed ? (
            <Check className="w-6 h-6 text-emerald-500" />
          ) : (
            <X className="w-6 h-6 text-destructive" />
          )}
          {isCustom && onDelete && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground mt-2 mb-4">
        {progress.toFixed(2)}% completo • {completed_days}/{totalDaysInYear} dias
      </p>
      {!completed && (
        <Button 
          variant="default"
          className="w-full"
          onClick={onClick}
        >
          Marcar como concluída
        </Button>
      )}
    </Card>
  );
};