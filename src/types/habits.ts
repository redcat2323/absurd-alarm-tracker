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