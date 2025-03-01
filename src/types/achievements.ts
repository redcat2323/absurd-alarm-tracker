
export interface Achievement {
  id: number;
  title: string;
  description: string;
  type: 'streak' | 'milestone' | 'category' | 'seasonal';
  requirement_value: number;
  category: string | null;
  icon: string;
}

export interface UserAchievement {
  id: number;
  user_id: string;
  achievement_id: number;
  unlocked_at: string;
  achievement?: Achievement;
}
