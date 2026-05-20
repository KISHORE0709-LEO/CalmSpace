import { useState, useEffect } from "react";

export interface CalmQuestProgress {
  unlockedWorlds: number[]; // e.g., [1, 2, 3]
  completedLevels: Record<number, number[]>; // worldId -> [levelId]
  stars: number;
  xp: number;
  badges: string[];
}

const DEFAULT_PROGRESS: CalmQuestProgress = {
  unlockedWorlds: [1],
  completedLevels: { 1: [], 2: [], 3: [] },
  stars: 0,
  xp: 0,
  badges: [],
};

const STORAGE_KEY = "calmspace_calmquest_progress";

export const useCalmQuestProgress = () => {
  const [progress, setProgress] = useState<CalmQuestProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading CalmQuest progress", e);
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error("Error saving CalmQuest progress", e);
    }
  }, [progress]);

  const completeLevel = (worldId: number, levelId: number, starsEarned: number, xpEarned: number) => {
    setProgress((prev) => {
      const isNewComplete = !prev.completedLevels[worldId]?.includes(levelId);
      const updatedLevels = isNewComplete
        ? [...(prev.completedLevels[worldId] || []), levelId]
        : prev.completedLevels[worldId];

      const newProgress = {
        ...prev,
        completedLevels: {
          ...prev.completedLevels,
          [worldId]: updatedLevels,
        },
        stars: prev.stars + starsEarned,
        xp: prev.xp + xpEarned,
      };

      // Check if world is complete (5 levels) and unlock next
      if (updatedLevels.length >= 5 && worldId < 3) {
        if (!newProgress.unlockedWorlds.includes(worldId + 1)) {
          newProgress.unlockedWorlds = [...newProgress.unlockedWorlds, worldId + 1];
        }
      }

      return newProgress;
    });
  };

  const addBadge = (badge: string) => {
    setProgress((prev) => ({
      ...prev,
      badges: prev.badges.includes(badge) ? prev.badges : [...prev.badges, badge],
    }));
  };

  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
  };

  return { progress, completeLevel, addBadge, resetProgress };
};
