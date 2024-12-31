import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface CelebrationMessageProps {
  show: boolean;
  onClose: () => void;
}

export const CelebrationMessage = ({ show, onClose }: CelebrationMessageProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Mensagem desaparece após 3 segundos

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="text-center animate-bounce">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
          🎉 Parabéns! 🎉
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Você completou todas as tarefas de hoje!
        </p>
      </div>
    </div>
  );
};