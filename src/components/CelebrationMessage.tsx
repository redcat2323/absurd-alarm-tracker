import { cn } from "@/lib/utils";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Award, Star, Trophy } from "lucide-react";

interface CelebrationMessageProps {
  show: boolean;
  onClose: () => void;
  type?: "daily" | "achievement" | "milestone";
  message?: string;
}

export const CelebrationMessage = ({ 
  show, 
  onClose, 
  type = "daily",
  message 
}: CelebrationMessageProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Reduzido de 3000 para 2000ms

      if (type === "achievement") {
        // Confete dourado mais sutil para conquistas
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF8C00'],
          shapes: ['star'],
        });
      } else if (type === "milestone") {
        // Explosão de confete mais sutil para marcos
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.6 },
          colors: ['#9b87f5', '#7E69AB', '#D946EF'],
        });
      } else {
        // Confete mais sutil para tarefas diárias
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#9b87f5', '#7E69AB', '#D946EF'],
        });
      }

      return () => clearTimeout(timer);
    }
  }, [show, type, onClose]);

  const icons = {
    daily: <Star className="w-10 h-10 text-primary animate-pulse" />,
    achievement: <Trophy className="w-10 h-10 text-yellow-500 animate-bounce" />,
    milestone: <Award className="w-10 h-10 text-primary animate-pulse" />
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300",
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className={cn(
        "text-center p-6 rounded-lg bg-background/50 backdrop-blur-md shadow-xl",
        "transform transition-all duration-300",
        show ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
      )}>
        <div className="mb-3">
          {icons[type]}
        </div>
        <h1 className="text-3xl font-bold text-primary mb-3 animate-fade-in">
          🎉 Parabéns! 🎉
        </h1>
        <p className="text-lg text-muted-foreground animate-fade-in-up">
          {message || "Você completou todas as tarefas de hoje!"}
        </p>
      </div>
    </div>
  );
};