import { DefaultHabit, CustomHabit } from "./habits";

export interface HabitState {
  habits: DefaultHabit[];
  customHabits: CustomHabit[];
  toggleHabit: (id: number, isCustom?: boolean) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  refetchCustomHabits: () => Promise<void>;
}

export interface HabitResetState {
  lastResetDate: string;
  setLastResetDate: (date: string) => void;
}