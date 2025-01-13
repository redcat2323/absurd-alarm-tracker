import { toast } from "@/components/ui/use-toast";
import { DefaultHabit, CustomHabit } from "@/types/habits";
import { useState } from "react";

const CELEBRATION_MESSAGES = {
  daily: [
    "🌟 Incrível! Você completou todos os hábitos hoje!",
    "🎉 Que dia produtivo! Continue assim!",
    "💪 Você está arrasando! Mantenha o foco!",
  ],
  achievement: [
    "🏆 Nova conquista desbloqueada! Você é incrível!",
    "⭐ Parabéns pela conquista! Continue evoluindo!",
    "🌟 Mais uma conquista para sua coleção!",
  ],
  milestone: [
    "🎯 Marco importante alcançado! Você é inspirador!",
    "🚀 Uau! Você atingiu um marco incrível!",
    "💫 Que conquista extraordinária! Continue brilhando!",
  ],
};

export const useCelebration = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"daily" | "achievement" | "milestone">("daily");
  const [celebrationMessage, setCelebrationMessage] = useState("");

  const getRandomMessage = (type: "daily" | "achievement" | "milestone") => {
    const messages = CELEBRATION_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const celebrate = (type: "daily" | "achievement" | "milestone", customMessage?: string) => {
    // Evita múltiplas celebrações simultâneas
    if (showCelebration) return;

    const message = customMessage || getRandomMessage(type);
    setCelebrationType(type);
    setCelebrationMessage(message);
    setShowCelebration(true);

    // Mostra o toast para conquistas e marcos importantes
    if (type !== "daily") {
      toast({
        title: message,
        className: "animate-bounce",
      });
    }
  };

  const checkAndCelebrate = (
    habitId: number,
    isCustom: boolean | undefined,
    habits: DefaultHabit[],
    customHabits: CustomHabit[] | undefined
  ) => {
    if (!habits.length && !customHabits?.length) return;

    const toggledHabit = isCustom 
      ? customHabits?.find(h => h.id === habitId)
      : habits.find(h => h.id === habitId);

    if (!toggledHabit?.completed) {
      const defaultHabitsCompleted = habits.every(habit => 
        habit.id === habitId ? !habit.completed : habit.completed
      );
      const customHabitsCompleted = customHabits?.every(habit => 
        habit.id === habitId ? !habit.completed : habit.completed
      ) ?? true;

      if (defaultHabitsCompleted && customHabitsCompleted) {
        celebrate("daily");
      }
    }
  };

  return { 
    checkAndCelebrate, 
    showCelebration, 
    setShowCelebration,
    celebrationType,
    celebrationMessage,
    celebrate 
  };
};