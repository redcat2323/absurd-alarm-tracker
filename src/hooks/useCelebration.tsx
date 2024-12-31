import { toast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";
import { DefaultHabit, CustomHabit } from "@/types/habits";

const CELEBRATION_MESSAGES = [
  "🌟 Incrível! Você completou todos os hábitos hoje!",
  "🎉 Que dia produtivo! Continue assim!",
  "💪 Você está arrasando! Mantenha o foco!",
  "🏆 Excelente trabalho! Você é um exemplo!",
  "⭐ Sensacional! Sua dedicação é inspiradora!"
];

export const useCelebration = () => {
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

      const willAllBeCompleted = defaultHabitsCompleted && customHabitsCompleted;

      console.info("Checking celebration conditions:");
      console.info("Default habits will be completed:", defaultHabitsCompleted);
      console.info("Custom habits will be completed:", customHabitsCompleted);
      console.info("All habits will be completed?", willAllBeCompleted);

      if (willAllBeCompleted) {
        celebrate();
      }
    }
  };

  const celebrate = () => {
    const randomMessage = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
    toast({
      title: randomMessage,
      className: "animate-bounce",
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#9b87f5', '#7E69AB', '#D946EF'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9b87f5', '#7E69AB', '#D946EF'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9b87f5', '#7E69AB', '#D946EF'],
      });
    }, 250);
  };

  return { checkAndCelebrate };
};