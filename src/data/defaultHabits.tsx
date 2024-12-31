import { Book, Droplets, Moon, Sun, Timer } from "lucide-react";
import { Habit } from "@/types/habit";

export const defaultHabits: Habit[] = [
  { id: 1, title: "Despertar - 4h59", icon: <Timer className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
  { id: 2, title: "Banho Natural", icon: <Droplets className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
  { id: 3, title: "Devocional - Boot Diário", icon: <Sun className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
  { id: 4, title: "Leitura Diária", icon: <Book className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
  { id: 5, title: "Exercício Diário", icon: <Moon className="w-6 h-6" />, completed: false, progress: 0, completed_days: 0 },
];