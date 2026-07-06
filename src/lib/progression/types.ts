export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  coins: number;
  activityPoints: number;
  titles: string[];
  activeTitle: string;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string;
  createdAt: number;
}

export interface UserStatistics {
  gymsCompleted: number;
  hoohDefeats: number;
  redDefeats: number;
  npcsCompleted: number;
  guidesFinished: number;
  totalTimeMs: number;
  bestTimeMs: number;
  totalTimeRuns: number;
  totalStepsCompleted: number;
  totalXP: number;
  totalCoins: number;
  totalAchievements: number;
  totalTitles: number;
  regionsCompleted: string[];
}

export interface ProgressionEvent {
  id: string;
  type: 'level_up' | 'achievement' | 'title' | 'task_complete' | 'xp_gain' | 'streak' | 'run_complete';
  message: string;
  detail?: string;
  xpAmount?: number;
  coinAmount?: number;
  timestamp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  condition: (stats: UserStatistics, level: number) => boolean;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  condition: (stats: UserStatistics, level: number) => boolean;
}

export type TaskPeriod = 'daily' | 'weekly' | 'monthly';

export interface TaskDefinition {
  id: string;
  period: TaskPeriod;
  category: string;
  label: string;
  description: string;
  targetCount: number;
  xpReward: number;
  coinReward: number;
  condition: (stats: UserStatistics) => boolean;
}

export interface TaskProgress {
  id: string;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
}

export interface TaskState {
  daily: Record<string, TaskProgress>;
  weekly: Record<string, TaskProgress>;
  monthly: Record<string, TaskProgress>;
  lastDailyReset: number;
  lastWeeklyReset: number;
  lastMonthlyReset: number;
}

export interface SeasonData {
  seasonNumber: number;
  startDate: number;
  endDate: number | null;
  level: number;
  xp: number;
  stats: UserStatistics;
  achievements: string[];
  titles: string[];
}

export interface ProgressionData {
  profile: UserProfile;
  statistics: UserStatistics;
  achievements: string[];
  titles: string[];
  events: ProgressionEvent[];
  taskState: TaskState;
  season: SeasonData;
}

export const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common:    { bg: 'bg-neutral-800/60',  border: 'border-neutral-600/40',  text: 'text-neutral-300',    glow: '' },
  uncommon:  { bg: 'bg-emerald-950/40',  border: 'border-emerald-700/40',  text: 'text-emerald-400',    glow: 'shadow-emerald-500/10' },
  rare:      { bg: 'bg-blue-950/40',     border: 'border-blue-700/40',     text: 'text-blue-400',       glow: 'shadow-blue-500/10' },
  epic:      { bg: 'bg-purple-950/40',   border: 'border-purple-700/40',   text: 'text-purple-400',     glow: 'shadow-purple-500/15' },
  legendary: { bg: 'bg-amber-950/40',    border: 'border-amber-700/40',    text: 'text-amber-400',      glow: 'shadow-amber-500/15' },
};
