export interface CustomHabit {
  id: number;
  title: string;
  completed: boolean;
  progress: number;
  completed_days: number;
}

export interface DefaultHabit {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  completedDays: number;
}

export interface DefaultHabitCompletion {
  id: number;
  user_id: string;
  habit_id: number;
  completed_days: number;
  progress: number;
}