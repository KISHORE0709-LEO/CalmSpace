import React, { createContext, useContext, useState, ReactNode } from "react";

export type EmotionState = "Calm" | "Anxious" | "Overloaded";

interface EmotionContextType {
  emotion: EmotionState;
  setEmotion: (e: EmotionState) => void;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const EmotionProvider = ({ children }: { children: ReactNode }) => {
  const [emotion, setEmotion] = useState<EmotionState>("Calm");

  return (
    <EmotionContext.Provider value={{ emotion, setEmotion }}>
      <div
        className={`transition-all duration-700 ease-in-out w-full h-full ${
          emotion === "Overloaded"
            ? "grayscale-[30%] opacity-90 backdrop-blur-[2px]"
            : emotion === "Anxious"
            ? "saturate-50 bg-background/50"
            : ""
        }`}
      >
        {children}
      </div>
    </EmotionContext.Provider>
  );
};

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) throw new Error("useEmotion must be used within an EmotionProvider");
  return context;
};
