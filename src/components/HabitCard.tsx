import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HabitCardProps {
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  onClick: () => void;
  onDelete?: () => void;
  isCustom?: boolean;
}

export const HabitCard = ({ 
  title, 
  icon, 
  completed, 
  progress, 
  onClick,
  onDelete,
  isCustom 
}: HabitCardProps) => {
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
        {completed ? (
          <Check className="w-6 h-6 text-emerald-500" />
        ) : (
          <X className="w-6 h-6 text-destructive" />
        )}
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground mt-2 mb-4">
        {progress}% completo
      </p>
      <div className="space-y-2">
        <Button 
          variant={completed ? "outline" : "default"}
          className={cn(
            "w-full",
            completed && "border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
          )}
          onClick={onClick}
        >
          {completed ? "Desfazer" : "Marcar como realizado"}
        </Button>
        
        {isCustom && onDelete && (
          <Button 
            variant="destructive"
            className="w-full"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remover Hábito
          </Button>
        )}
      </div>
    </Card>
  );
};