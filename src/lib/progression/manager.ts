import type {
  UserProfile, UserStatistics, ProgressionEvent,
  TaskState, TaskProgress, SeasonData, ProgressionData, TaskPeriod,
} from './types';
import { xpForLevel, xpToNextLevel, calculateLevel, calculateCoinsForXP, applyStreakMultiplier, LEVEL_MILESTONES } from './xp';
import { TASK_DEFINITIONS } from './tasks';
import { ACHIEVEMENTS } from './achievements';
import { TITLES } from './titles';

const DAILY_MS = 24 * 60 * 60 * 1000;
const WEEKLY_MS = 7 * DAILY_MS;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultProfile(id: string, username: string): UserProfile {
  return {
    id, username, avatar: '', level: 1, currentXP: 0, totalXP: 0,
    xpToNextLevel: xpToNextLevel(1), coins: 0, activityPoints: 0,
    titles: ['entrenador'], activeTitle: 'entrenador',
    currentStreak: 0, bestStreak: 0, lastActivityDate: '', createdAt: Date.now(),
  };
}

function getDefaultStats(): UserStatistics {
  return {
    gymsCompleted: 0, hoohDefeats: 0, redDefeats: 0, npcsCompleted: 0,
    guidesFinished: 0, totalTimeMs: 0, bestTimeMs: Infinity, totalTimeRuns: 0,
    totalStepsCompleted: 0, totalXP: 0, totalCoins: 0, totalAchievements: 0,
    totalTitles: 0, regionsCompleted: [],
  };
}

function getDefaultTaskState(): TaskState {
  return {
    daily: {}, weekly: {}, monthly: {},
    lastDailyReset: 0, lastWeeklyReset: 0, lastMonthlyReset: 0,
  };
}

function getDefaultSeason(): SeasonData {
  return {
    seasonNumber: 1, startDate: Date.now(), endDate: null,
    level: 1, xp: 0, stats: getDefaultStats(), achievements: [], titles: [],
  };
}

function checkResets(ts: TaskState): TaskState {
  const now = Date.now();
  const state = { ...ts };
  if (now - state.lastDailyReset >= DAILY_MS) {
    state.daily = {};
    state.lastDailyReset = now;
  }
  if (now - state.lastWeeklyReset >= WEEKLY_MS) {
    state.weekly = {};
    state.lastWeeklyReset = now;
  }
  const nowDate = new Date(now);
  if (nowDate.getDate() === 1 && now - state.lastMonthlyReset >= DAILY_MS) {
    state.monthly = {};
    state.lastMonthlyReset = now;
  }
  return state;
}

export class ProgressionManager {
  profile: UserProfile;
  statistics: UserStatistics;
  unlockedAchievements: string[];
  unlockedTitles: string[];
  events: ProgressionEvent[];
  taskState: TaskState;
  season: SeasonData;
  private pendingNotifications: ProgressionEvent[] = [];

  constructor(data?: Partial<ProgressionData>) {
    this.profile = data?.profile ?? getDefaultProfile('', '');
    this.statistics = data?.statistics ?? getDefaultStats();
    this.unlockedAchievements = data?.achievements ?? [];
    this.unlockedTitles = data?.titles ?? ['entrenador'];
    this.events = data?.events ?? [];
    this.taskState = checkResets(data?.taskState ?? getDefaultTaskState());
    this.season = data?.season ?? getDefaultSeason();
  }

  static fromRedis(data: Record<string, unknown>): ProgressionManager {
    return new ProgressionManager({
      profile: data.profile as UserProfile | undefined,
      statistics: data.statistics as UserStatistics | undefined,
      achievements: data.achievements as string[] | undefined,
      titles: data.titles as string[] | undefined,
      events: (data.events as ProgressionEvent[] | undefined)?.slice(-100),
      taskState: data.taskState as TaskState | undefined,
      season: data.season as SeasonData | undefined,
    });
  }

  toRedis(): Record<string, unknown> {
    return {
      profile: this.profile,
      statistics: this.statistics,
      achievements: this.unlockedAchievements,
      titles: this.unlockedTitles,
      events: this.events.slice(-100),
      taskState: this.taskState,
      season: this.season,
    };
  }

  initProfile(id: string, username: string) {
    if (!this.profile.id) {
      this.profile = getDefaultProfile(id, username);
    }
  }

  consumeNotifications(): ProgressionEvent[] {
    const notes = [...this.pendingNotifications];
    this.pendingNotifications = [];
    return notes;
  }

  grantXP(amount: number, reason: string, streak?: number): boolean {
    if (amount <= 0) return false;
    const prevLevel = this.profile.level;
    const actualStreak = streak !== undefined ? streak : this.profile.currentStreak;
    const streakMulti = applyStreakMultiplier(amount, actualStreak);
    const coins = calculateCoinsForXP(streakMulti);

    this.profile.totalXP += streakMulti;
    this.profile.currentXP = this.profile.totalXP;
    this.profile.level = calculateLevel(this.profile.totalXP);
    this.profile.xpToNextLevel = xpToNextLevel(this.profile.level);
    this.profile.coins += coins;
    this.statistics.totalXP = this.profile.totalXP;
    this.statistics.totalCoins = this.profile.coins;
    this.season.xp = this.profile.totalXP;
    this.season.level = this.profile.level;

    this.addEvent({
      id: crypto.randomUUID(),
      type: 'xp_gain',
      message: `+${streakMulti} XP${streakMulti > amount ? ` (+${streakMulti - amount} racha)` : ''}: ${reason}`.trim(),
      xpAmount: streakMulti,
      coinAmount: coins,
      timestamp: Date.now(),
    });

    if (this.profile.level > prevLevel) {
      this.addEvent({
        id: crypto.randomUUID(),
        type: 'level_up',
        message: `¡Subiste al nivel ${this.profile.level}!`,
        detail: `Nivel ${prevLevel} → ${this.profile.level}`,
        timestamp: Date.now(),
      });

      const milestone = LEVEL_MILESTONES[this.profile.level];
      if (milestone) {
        if (milestone.bonusXP) {
          this.addEvent({
            id: crypto.randomUUID(),
            type: 'xp_gain',
            message: `+${milestone.bonusXP} XP (nivel ${prevLevel + 1})`,
            xpAmount: milestone.bonusXP,
            coinAmount: milestone.bonusCoins,
            timestamp: Date.now(),
          });
          this.profile.totalXP += milestone.bonusXP;
          this.profile.currentXP = this.profile.totalXP;
          this.profile.level = calculateLevel(this.profile.totalXP);
          this.profile.xpToNextLevel = xpToNextLevel(this.profile.level);
        }
      }

      this.checkAchievements();
      this.checkTitles();
    }

    this.updateStreak();
    return true;
  }

  updateStatistics(updates: Partial<UserStatistics>) {
    Object.assign(this.statistics, updates);
    this.season.stats = { ...this.statistics };
    this.checkAchievements();
    this.checkTitles();
  }

  incrementStat(key: keyof UserStatistics, amount: number = 1) {
    const current = this.statistics[key];
    if (typeof current === 'number') {
      (this.statistics as unknown as Record<string, number>)[key] = current + amount;
    }
    this.season.stats = { ...this.statistics };
    this.checkAchievements();
    this.checkTitles();
  }

  addRegion(region: string) {
    if (!this.statistics.regionsCompleted.includes(region)) {
      this.statistics.regionsCompleted.push(region);
      this.season.stats = { ...this.statistics };
    }
  }

  private addEvent(event: ProgressionEvent) {
    this.events.push(event);
    if (this.events.length > 200) this.events = this.events.slice(-200);
    this.pendingNotifications.push(event);
  }

  private checkAchievements() {
    for (const ach of ACHIEVEMENTS) {
      if (this.unlockedAchievements.includes(ach.id)) continue;
      if (ach.condition(this.statistics, this.profile.level)) {
        this.unlockedAchievements.push(ach.id);
        this.statistics.totalAchievements = this.unlockedAchievements.length;
        this.grantXP(ach.xpReward, `Logro: ${ach.name}`);
        this.addEvent({
          id: crypto.randomUUID(),
          type: 'achievement',
          message: `Logro desbloqueado: ${ach.name}`,
          detail: ach.description,
          xpAmount: ach.xpReward,
          timestamp: Date.now(),
        });
      }
    }
  }

  private checkTitles() {
    for (const title of TITLES) {
      if (this.unlockedTitles.includes(title.id)) continue;
      if (title.condition(this.statistics, this.profile.level)) {
        this.unlockedTitles.push(title.id);
        this.statistics.totalTitles = this.unlockedTitles.length;
        this.addEvent({
          id: crypto.randomUUID(),
          type: 'title',
          message: `Título obtenido: ${title.name}`,
          detail: title.description,
          timestamp: Date.now(),
        });
      }
    }
  }

  setActiveTitle(titleId: string): boolean {
    if (this.unlockedTitles.includes(titleId)) {
      this.profile.activeTitle = titleId;
      return true;
    }
    return false;
  }

  private updateStreak() {
    const today = todayStr();
    if (this.profile.lastActivityDate === today) return;

    const yesterday = new Date(Date.now() - DAILY_MS).toISOString().slice(0, 10);
    if (this.profile.lastActivityDate === yesterday) {
      this.profile.currentStreak += 1;
    } else if (this.profile.lastActivityDate !== today) {
      this.profile.currentStreak = 1;
    }
    this.profile.lastActivityDate = today;
    if (this.profile.currentStreak > this.profile.bestStreak) {
      this.profile.bestStreak = this.profile.currentStreak;
    }
    if (this.profile.currentStreak === 7) {
      this.addEvent({
        id: crypto.randomUUID(),
        type: 'streak',
        message: '¡Racha de 7 días!',
        detail: 'Sigue así, Entrenador',
        timestamp: Date.now(),
      });
    }
  }

  checkTasks(): { newlyCompleted: string[] } {
    const newlyCompleted: string[] = [];
    for (const def of TASK_DEFINITIONS) {
      const state = this.getTaskStateForPeriod(def.period);
      const progress = state[def.id] ?? { id: def.id, currentCount: 0, completed: false, claimed: false };

      if (progress.completed) continue;

      if (def.condition(this.statistics)) {
        progress.currentCount = def.targetCount;
        progress.completed = true;
        state[def.id] = progress;
        newlyCompleted.push(def.id);
      }
    }

    const allDaily = TASK_DEFINITIONS.filter(d => d.period === 'daily' && d.id !== 'daily_bonus');
    const allDailyDone = allDaily.every(d => this.taskState.daily[d.id]?.completed);
    if (allDailyDone && !this.taskState.daily['daily_bonus']?.completed) {
      this.taskState.daily['daily_bonus'] = {
        id: 'daily_bonus', currentCount: 1, completed: true, claimed: false,
      };
      newlyCompleted.push('daily_bonus');
    }

    return { newlyCompleted };
  }

  claimTaskReward(taskId: string): { xp: number; coins: number } {
    const def = TASK_DEFINITIONS.find(d => d.id === taskId);
    if (!def) return { xp: 0, coins: 0 };

    const state = this.getTaskStateForPeriod(def.period);
    const progress = state[taskId];
    if (!progress?.completed || progress.claimed) return { xp: 0, coins: 0 };

    progress.claimed = true;
    state[taskId] = { ...progress };
    this.grantXP(def.xpReward, `Tarea: ${def.label}`);

    this.addEvent({
      id: crypto.randomUUID(),
      type: 'task_complete',
      message: `Tarea completada: ${def.label}`,
      detail: `+${def.xpReward} XP`,
      xpAmount: def.xpReward,
      timestamp: Date.now(),
    });

    return { xp: def.xpReward, coins: def.coinReward };
  }

  private getTaskStateForPeriod(period: TaskPeriod): Record<string, TaskProgress> {
    return this.taskState[period];
  }

  getTaskProgress(defId: string): TaskProgress {
    const def = TASK_DEFINITIONS.find(d => d.id === defId);
    if (!def) return { id: defId, currentCount: 0, completed: false, claimed: false };
    return this.taskState[def.period][defId] ?? { id: defId, currentCount: 0, completed: false, claimed: false };
  }

  getActivityPoints(): number {
    let points = 0;
    const now = Date.now();

    if (this.profile.currentStreak >= 7 && this.profile.currentStreak < 30) {
      points += 50;
    } else if (this.profile.currentStreak >= 30 && this.profile.currentStreak < 90) {
      points += 150;
    } else if (this.profile.currentStreak >= 90) {
      points += 300;
    }

    if (this.season.level >= 10) {
      points += 200;
    } else if (this.season.level >= 5) {
      points += 100;
    }

    const nowDate = new Date(now);
    const today = nowDate.toISOString().slice(0, 10);
    if (this.profile.lastActivityDate !== today) {
      points += 25;
    }

    return points;
  }
}