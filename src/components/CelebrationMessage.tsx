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
      }, 3000);

      if (type === "achievement") {
        // Confete dourado para conquistas
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF8C00'],
          shapes: ['star'],
        });
      } else if (type === "milestone") {
        // Explosão de confete para marcos importantes
        const end = Date.now() + 1000;
        const colors = ['#9b87f5', '#7E69AB', '#D946EF'];
        
        (function frame() {
          confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });
        
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      } else {
        // Confete padrão para tarefas diárias
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9b87f5', '#7E69AB', '#D946EF'],
        });
      }

      return () => clearTimeout(timer);
    }
  }, [show, type, onClose]);

  const icons = {
    daily: <Star className="w-12 h-12 text-primary animate-spin-slow" />,
    achievement: <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />,
    milestone: <Award className="w-12 h-12 text-primary animate-pulse" />
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300",
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className={cn(
        "text-center p-8 rounded-lg bg-background/50 backdrop-blur-md shadow-xl",
        "transform transition-all duration-500",
        show ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
      )}>
        <div className="mb-4">
          {icons[type]}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4 animate-fade-in">
          🎉 Parabéns! 🎉
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in-up">
          {message || "Você completou todas as tarefas de hoje!"}
        </p>
      </div>
    </div>
  );
};