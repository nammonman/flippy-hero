import { createContext, useContext, useState } from 'react';

const GameState = createContext();

export function GameStateProvider({ children }) {
  const [isWideScreen, setIsWideScreen] = useState(true);
  const [isZoomed, setIsZoomed] = useState(true);
  const [currentColor, setCurrentColor] = useState("#FFFFFF");
  const [playerDirection, setPlayerDirection] = useState(0) /* angle*/
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 }) /* position of top left tile in the 100x100 grid that the camera is displaying */

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
    gameGridData,
    currentColor,
    setCurrentColor,
    playerDirection,
    setPlayerDirection,
    playerPosition,
    setPlayerPosition,
    cameraPosition,
    setCameraPosition
  };

  return (
    <GameState.Provider value={value}>
      {children}
    </GameState.Provider>
  );
}

export const useGameState = () => useContext(GameState);