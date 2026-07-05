export type StepType = 'travel' | 'gym' | 'heal' | 'item' | 'note' | 'prep' | 'turn';

export interface TurnConditional {
  target: string;
  move: string;
  color: string;
  icon: string;
}

export interface TurnStepAction {
  pokemon: string;
  icon: string;
  action: string;
  type: 'move' | 'switch' | 'none';
  conditionals?: TurnConditional[];
}

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
  // Turn specific fields
  turnData?: TurnStepAction[];
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

export interface GuideCredits {
  author: string;
  adaptedBy?: string;
  status: 'Original' | 'Adaptada' | 'Actualizada';
  lastUpdated?: string;
  sources: {
    youtube?: string;
    docs?: string;
    discord?: string;
    website?: string;
  };
}

export type GuideCategory = 'guides' | 'farming' | 'routes' | 'resources';

export interface GuideMeta {
  id: string;
  title: string;
  subtitle: string;
  category: GuideCategory;
  icon: string;
  color: string;
  credits: GuideCredits;
}
