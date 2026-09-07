import { useState, useEffect } from "react";

export interface LevelStats {
  stars: number;
  highScore: number;
}

export interface CalmQuestProgress {
  unlockedWorlds: number[]; // e.g., [1, 2, 3]
  completedLevels: Record<number, number[]>; // worldId -> [levelId]
  levelStats?: Record<string, LevelStats>; // "worldId-levelId" -> stats
  stars: number;
  xp: number;
  badges: string[];
}

const DEFAULT_PROGRESS: CalmQuestProgress = {
  unlockedWorlds: [1],
  completedLevels: { 1: [], 2: [], 3: [] },
  levelStats: {},
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
        const parsed = JSON.parse(stored);
        // Ensure levelStats is initialized for backward compatibility
        if (!parsed.levelStats) parsed.levelStats = {};
        return parsed;
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

  const completeLevel = (worldId: number, levelId: number, starsEarned: number, score: number) => {
    setProgress((prev) => {
      const statsKey = `${worldId}-${levelId}`;
      const currentStats = prev.levelStats || {};
      const existing = currentStats[statsKey] || { stars: 0, highScore: 0 };

      const isNewComplete = !prev.completedLevels[worldId]?.includes(levelId);
      const updatedLevels = isNewComplete
        ? [...(prev.completedLevels[worldId] || []), levelId]
        : prev.completedLevels[worldId];

      // Calculate incremental difference to avoid duplicate stars/XP when replaying
      const starDiff = Math.max(0, starsEarned - existing.stars);
      const scoreDiff = Math.max(0, score - existing.highScore);
      
      // XP is derived directly from score (min 50 XP)
      const xpEarned = Math.max(50, Math.floor(score / 10));
      const existingXp = Math.max(50, Math.floor(existing.highScore / 10));
      const xpDiff = Math.max(0, xpEarned - existingXp);

      const newStats = {
        ...currentStats,
        [statsKey]: {
          stars: Math.max(existing.stars, starsEarned),
          highScore: Math.max(existing.highScore, score),
        }
      };

      const newProgress = {
        ...prev,
        completedLevels: {
          ...prev.completedLevels,
          [worldId]: updatedLevels,
        },
        levelStats: newStats,
        stars: prev.stars + starDiff,
        xp: prev.xp + xpDiff,
      };

      // Check if world is complete (all 3 levels completed) and unlock next world
      if (updatedLevels.length >= 3 && worldId < 3) {
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
