export type StepType = 'travel' | 'gym' | 'heal' | 'item' | 'note';

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
