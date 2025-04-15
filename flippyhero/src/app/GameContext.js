import { createContext, useContext, useState } from 'react';

const GameState = createContext();

export function GameStateProvider({ children }) {
  const [isWideScreen, setIsWideScreen] = useState(true);
  const [isZoomed, setIsZoomed] = useState(true);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [playerDirection, setPlayerDirection] = useState(0) /* angle*/
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 }) /* position of top left tile in the 100x100 grid that the camera is displaying */
  const [canMove, setCanMove] = useState(true);

  const [gameGridData, setGameGridData] = useState(
    Array.from({ length: 100 }, () =>
      Array.from({ length: 100 }, () => ({
        color: "#FFFFFF",
      }))
    )
  );

  const updateGameGridData = (x, y, color) => {
    setGameGridData(prev => {
      const newGrid = [...prev];
      newGrid[y][x] = { ...prev[y][x], color };
      return newGrid;
    });
  };

  // save up to 20 gameGridData(s) as undo and redo
  const [historyIndex, setHistoryIndex] = useState(0)
  const [gameGridHistory, setGameGridHistory] = useState(
    [
      Array.from({ length: 100 }, () =>
        Array.from({ length: 100 }, () => ({
          color: "#FFFFFF",
        }))
      )
    ]
  );

  const updateGameGridHistory = (gameGridData) => {
    
  };
  

  const value = {
    isWideScreen,
    setIsWideScreen,
    isZoomed,
    setIsZoomed,
    gameGridData,
    updateGameGridData,
    currentColor,
    setCurrentColor,
    playerDirection,
    setPlayerDirection,
    playerPosition,
    setPlayerPosition,
    cameraPosition,
    setCameraPosition,
    canMove,
    setCanMove,
    
  };

  return (
    <GameState.Provider value={value}>
      {children}
    </GameState.Provider>
  );
}

export const useGameState = () => useContext(GameState);