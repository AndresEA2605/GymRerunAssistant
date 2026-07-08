export const XP_VALUES = {
  // Run completions
  gymCompletion: 100,
  regionCompletionPerGym: 100,
  runBaseCompletion: 200,
  runPerGymCompletion: 75,

  // Login & Actions
  loginBonus: 50,
  dailyTaskCompletion: 100,
  guidePreview: 25,

  // Achievements
  achievementCommon: 150,
  achievementUncommon: 400,
  achievementRare: 1200,
  achievementEpic: 3000,
  achievementLegendary: 10000,

  // Titles (not XP, but milestones)
  milestone_5: { title: 'Novato', coins: 50 },
  milestone_10: { title: 'Explorador', coins: 100 },
  milestone_15: { title: 'Veterano', coins: 200 },
  milestone_20: { title: 'Líder', coins: 300 },
  milestone_25: { title: 'Maestro', coins: 500 },
  milestone_30: { title: 'Campeón', coins: 700 },
  milestone_40: { title: 'Élite', coins: 1000 },
  milestone_50: { title: 'Leyenda', coins: 1500 },
  milestone_75: { title: 'Mítico', coins: 3000 },
  milestone_100: { title: 'Invicto', coins: 5000 },
};

export const getNewGymCompletionXP = () => XP_VALUES.gymCompletion;
export const getNewRegionCompletionXP = (gymCount: number) => XP_VALUES.regionCompletionPerGym * gymCount;
export const getNewRunCompletionXP = (totalGymsDone: number) => XP_VALUES.runBaseCompletion + XP_VALUES.runPerGymCompletion * totalGymsDone;
export const getNewDailyTaskXP = () => XP_VALUES.dailyTaskCompletion;
export const getNewLoginXP = () => XP_VALUES.loginBonus;