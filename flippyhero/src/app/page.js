'use client';
import { useState, useEffect, useRef } from 'react';
import { GameStateProvider, useGameState } from './GameContext';

function PlayerCharacter() {
  const { isWideScreen, isZoomed, playerDirection, playerPosition } = useGameState();
  
  return (
    isZoomed && (
      <div 
        className={`absolute z-30 bg-violet-700 aspect-square ${isWideScreen ? 'h-[11vh]' : 'h-[7vh]'} shadow-lg`}
        style={{
          top: `${playerPosition.y}%`,
          left: `${playerPosition.x}%`,
          transform: `translate(-50%, -50%) rotate(${playerDirection}deg)`
        }}
      >player
        <div 
          className={`absolute top-[50%] left-[125%] z-40 bg-violet-500 aspect-square ${isWideScreen ? 'h-[5.5vh]' : 'h-[3.5vh]'} transform -translate-x-1/2 -translate-y-1/2`}>
        tap</div>
        <div 
          className={`absolute top-[50%] left-[50%] z-40 bg-violet-500 aspect-square ${isWideScreen ? 'h-[22vh]' : 'h-[14vh]'} transform -translate-x-1/2 -translate-y-1/2 opacity-50`}>
        hold1</div>
        <div 
          className={`absolute top-[50%] left-[50%] z-40 bg-violet-500 aspect-square ${isWideScreen ? 'h-[33vh]' : 'h-[21vh]'} transform -translate-x-1/2 -translate-y-1/2 opacity-25`}>
        hold2</div>
      </div>
    )
  );
}

function FlipGrid() {
  const { isWideScreen, isZoomed } = useGameState();
  return (
    isZoomed && (<div className={`absolute top-0 left-0 z-20 grid grid-cols-10 gap-0 aspect-square ${isWideScreen ? 'h-[77vh]' : 'h-[49vh]'}`}>
      {Array(100).fill().map((_, i) => {
        return (
          <div 
            key={i}
            className={`h-full aspect-square bg-white opacity-50`}
            tag='flippable'
            id=''
          ></div>
        );
      })}
      <PlayerCharacter/>
    </div>)
  );
}

function GameGrid() {
  const { isWideScreen, isZoomed } = useGameState();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const gridSize = isZoomed ? 10 : 100;

    const tileSize = (canvas.height / gridSize);

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const isEven = (row % 2 === 0 && col % 2 === 0) || (row % 2 === 1 && col % 2 === 1);
        ctx.fillStyle = isEven ? '#e5e7eb' : '#9ca3af';
        ctx.fillRect(col * tileSize, row * tileSize, tileSize+1, tileSize+1); // +1 to fix gaps
      }
    }
  }, [isZoomed]);

  return (
    <canvas
      ref={canvasRef}
      className={`relative aspect-square ${isWideScreen ? 'h-[77vh]' : 'h-[49vh]'}`}
    />
  );
}

function DPad() {
  const { isWideScreen, playerDirection, setPlayerDirection, playerPosition, setPlayerPosition } = useGameState();
  const btnSize = isWideScreen ? 'h-[8vh] w-[8vh]' : 'h-[7vh] w-[7vh]';

  const pressTimeRef = useRef(null);

  const startMove = (degrees, dx = 0, dy = 0) => {
    setPlayerDirection(degrees);
    const maxSpeed = 2;
    const acceleration = 0.25;
    let currentSpeed = 0;
    
    pressTimeRef.current = setInterval(() => {
      currentSpeed = Math.min(maxSpeed, currentSpeed + acceleration);
      const adjustedDx = (dx / 2) * currentSpeed;
      const adjustedDy = (dy / 2) * currentSpeed;
      if (currentSpeed > 0.2) {
        setPlayerPosition(prev => ({
          x: Math.max(0, Math.min(100, prev.x + adjustedDx)),
          y: Math.max(0, Math.min(100, prev.y + adjustedDy))
        }));
      }
      
    }, 33.33);

  };

  const stopMove = () => {
    clearInterval(pressTimeRef.current);
    pressTimeRef.current = null;
  };

  return (
    <div className={`relative w-[32vh] left-0 flex flex-col items-center sm:text-xl text-2xl font-black`}>
      <button 
        className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
        onMouseDown={() => startMove(270, 0, -2)}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchStart={() => startMove(90, 0, -2)}
        onTouchEnd={stopMove}
      >🠉</button>
      <div className="flex">
        <button 
          className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
          onMouseDown={() => startMove(180, -2, 0)}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          onTouchStart={() => startMove(180, -2, 0)}
          onTouchEnd={stopMove}
        >🠈</button>
        <div className={`relative z-10 ${btnSize} bg-gray-500`}></div>
        <button 
          className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
          onMouseDown={() => startMove(0, 2, 0)}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          onTouchStart={() => startMove(0, 2, 0)}
          onTouchEnd={stopMove}
        >🠊</button>
      </div>
      <button 
        className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
        onMouseDown={() => startMove(90, 0, 2)}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchStart={() => startMove(90, 0, 2)}
        onTouchEnd={stopMove}
      >🠋</button>
    </div>
  );
}

function ActionButtons() {
  const { isWideScreen, isZoomed, setIsZoomed } = useGameState();
  const btnSize = isWideScreen ? 'h-[14vh] w-[14vh]' : 'h-[10vh] w-[10vh]';
  return (
    <div className="flex flex-row gap-[5%] w-[32vh]"> 
      <div className="relative w-full right-0 flex flex-col items-center space-y-[20%] text-lg font-black">
      <button 
                className={` ${btnSize} bg-green-500 rounded-full shadow-amber-900 shadow-lg active:shadow-sm`}
                onClick={() => setIsZoomed(!isZoomed)}
        >Z</button>
        <button 
                className={` ${btnSize} bg-blue-500 rounded-full shadow-amber-900 shadow-lg active:shadow-sm`}
                
        >C</button>
      </div>
      <div className="relative w-full right-0 flex items-center space-y-[9%] space-x-[9%] text-lg font-black">
        <button className={` ${btnSize} bg-red-500 rounded-full shadow-amber-900 shadow-lg active:shadow-sm`}>A</button>
      </div>
    </div>
  );
}

function SizeIndicator() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none flex justify-center items-center text-6xl font-bold text-white">
      <span className="block sm:hidden">xs</span>
      <span className="hidden sm:block md:hidden">sm</span>
      <span className="hidden md:block lg:hidden">md</span>
      <span className="hidden lg:block">lg</span>
    </div>
  )
}

function Home() {
  const { isWideScreen, setIsWideScreen, setIsZoomed } = useGameState();

  useEffect(() => {
    const checkAspectRatio = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      setIsWideScreen(aspectRatio >= 14.5/9);
    };

    checkAspectRatio();
    window.addEventListener('resize', checkAspectRatio);
    return () => window.removeEventListener('resize', checkAspectRatio);
  }, [setIsWideScreen]);

  return (
    <main className="flex bg-gray-900 w-screen h-screen text-black overflow-hidden justify-center items-center ">
      {isWideScreen ? (
        <div className='bg-amber-300 rounded-4xl w-[160vh] h-[90vh] flex items-center shadow-inner shadow-amber-700'>
          <div className='flex justify-between items-center p-[3%] space-x-[3%] w-full h-full'>
            <DPad/>
            <div className="relative"> {/* Add this wrapper div */}
              <GameGrid/>
              <FlipGrid/>
            </div>
            <ActionButtons/>
          </div>
        </div>
      ) : (
        <div className='bg-amber-300 rounded-4xl h-[96vh] w-[54vh] justify-center items-center shadow-inner shadow-amber-700'>
          <div className='flex justify-between items-center m-[5%] '>
            <div className="relative"> {/* Add this wrapper div */}
              <GameGrid/>
              <FlipGrid/>
            </div>
          </div>
          <div className='flex justify-between items-center mx-[5%] space-x-[3%] my-[15%]'>
            <DPad/>
            <ActionButtons/>
          </div>
        </div>
      )}
    </main>    
  );
}

export default function HomeWrapped() {
  return (
    <GameStateProvider>
      <Home />
    </GameStateProvider>
  );
}