import { useEffect, useRef, useState, useCallback } from "react";
import { useEmotion } from "@/context/EmotionContext";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export const useGameLoop = (baseTickRateMs: number) => {
  const { emotion } = useEmotion();
  const isOverloaded = emotion === "Overloaded";
  
  // Slow down the game if overloaded to reduce sensory load
  const currentTickRate = isOverloaded ? baseTickRateMs * 2 : baseTickRateMs;

  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<Direction>("RIGHT");

  const latestDirection = useRef<Direction>("RIGHT");

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (latestDirection.current !== "DOWN") latestDirection.current = "UP";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (latestDirection.current !== "UP") latestDirection.current = "DOWN";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (latestDirection.current !== "RIGHT") latestDirection.current = "LEFT";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (latestDirection.current !== "LEFT") latestDirection.current = "RIGHT";
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  // Main game loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setDirection(latestDirection.current);
      setTick(t => t + 1);
    }, currentTickRate);
    return () => clearInterval(interval);
  }, [isPlaying, currentTickRate]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setTick(0);
  }, []);

  const stopGame = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return { tick, isPlaying, direction, isOverloaded, startGame, stopGame };
};
