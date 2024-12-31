import { ReactNode } from 'react';

export interface Habit {
  id: number;
  title: string;
  icon: ReactNode;
  completed: boolean;
  progress: number;
  completed_days: number;
}