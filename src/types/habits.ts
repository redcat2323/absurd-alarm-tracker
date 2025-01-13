import { ReactNode } from 'react';

export interface CustomHabit {
  id: number;
  title: string;
  completed: boolean;
  progress: number;
  completed_days: number;
  user_id: string;
  created_at: string;
}

export interface DefaultHabit {
  id: number;
  title: string;
  icon: ReactNode;
  completed: boolean;
  progress: number;
  completed_days: number;
}

export interface DefaultHabitCompletion {
  id: number;
  user_id: string;
  habit_id: number;
  completed_days: number;
  progress: number;
  completed: boolean;
}