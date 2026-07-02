export type StepType = 'travel' | 'gym' | 'heal' | 'item' | 'note' | 'prep';

export interface RouteStep {
  id: number;
  type: StepType;
  region?: string;
  gym?: string;
  title: string;
  description?: string;
  lead?: string[];
  switchTo?: string[];
  actions?: string[];
  completed?: boolean;
  // Prep specific fields
  heal?: boolean;
  travel?: string | null;
  items?: { item: string; pokemon: string[] }[];
}

export interface AppState {
  currentStepIndex: number;
  completedSteps: Record<number, boolean>;
  runTimer: {
    isRunning: boolean;
    startedAt: number | null;
    elapsedBeforePause: number;
  };
}

export interface RunHistoryEntry {
  id: string;
  finishedAt: number;
  elapsed: number;
  completedStepsCount: number;
  totalSteps: number;
}

export interface DailyTask {
  id: string;
  label: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  targetElapsedMs?: number;
}

export interface DailyTasksState {
  tasks: DailyTask[];
  lastResetAt: number;
}

export interface LastRunStats {
  elapsed: number;
  gymsCompleted: number;
  totalGyms: number;
  finishedAt: number;
}
