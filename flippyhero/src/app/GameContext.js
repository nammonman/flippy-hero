import { createContext, useContext, useState } from 'react';

const GameState = createContext();

export function GameStateProvider({ children }) {
  const [isWideScreen, setIsWideScreen] = useState(true);
  const [isZoomed, setIsZoomed] = useState(true);
  const [currentColor, setCurrentColor] = useState("#FFFFFF");

  var gameGridData = Array.from({ length: 100 }, (_, row) =>
      Array.from({ length: 100 }, (_, col) => ({
        color: "#FFFFFF",
      }))
    );
  

  const value = {
    isWideScreen,
    setIsWideScreen,
    isZoomed,
    setIsZoomed,
    gameGridData
  };

  return (
    <GameState.Provider value={value}>
      {children}
    </GameState.Provider>
  );
}

export const useGameState = () => useContext(GameState);