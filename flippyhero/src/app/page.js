'use client';
import { useState, useEffect, useRef } from 'react';
import { GameStateProvider, useGameState } from './GameContext';

/*function GameGrid() {
  const { isWideScreen, isZoomed } = useGameState();
  return (
    <div className={`relative grid ${isZoomed? 'grid-cols-10' : 'grid-cols-100'} gap-0 aspect-square ${isWideScreen ? 'h-[78vh]' : 'h-[49vh]'} shadow-lg shadow-amber-200 `}>
      {Array(isZoomed? 100 : 10000).fill().map((_, i) => {
        const row = Math.floor(i / (isZoomed? 10 : 100));
        const isEven = (row % 2 === 0 && i % 2 === 0) || (row % 2 === 1 && i % 2 === 1);
        return (
          <div 
            key={i}
            className={`h-full aspect-square ${isEven ? 'bg-gray-200' : 'bg-gray-400'}`}
          ></div>
        );
      })}
      
    </div>
  );
}*/

function GameGrid() {
  const { isWideScreen, isZoomed } = useGameState();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gridSize = isZoomed ? 10 : 100;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const tileSize = Math.round(canvas.width / gridSize);

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const isEven = (row % 2 === 0 && col % 2 === 0) || (row % 2 === 1 && col % 2 === 1);
        ctx.fillStyle = isEven ? '#e5e7eb' : '#9ca3af';
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
  }, [isZoomed]);

  return (
    <canvas
      ref={canvasRef}
      className={`relative aspect-square ${isWideScreen ? 'h-[78vh]' : 'h-[49vh]'}`}
    />
  );
}

function DPad() {
  const { isWideScreen, isZoomed} = useGameState();
  const btnSize = isWideScreen ? 'h-[8vh] w-[8vh]' : 'h-[7vh] w-[7vh]';
  return (
    <div className={`relative w-[32vh] left-0 flex flex-col items-center sm:text-xl text-2xl font-black`}>
      <button className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}>🠉</button>
      <div className="flex">
        <button className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}>🠈</button>
        <div className={`relative z-10 ${btnSize} bg-gray-500`}></div>
        <button className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}>🠊</button>
      </div>
      <button className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}>🠋</button>
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
            <GameGrid/>
            <ActionButtons/>
          </div>
        </div>
      ) : (
        <div className='bg-amber-300 rounded-4xl h-[96vh] w-[54vh] justify-center items-center shadow-inner shadow-amber-700'>
          <div className='flex justify-between items-center m-[5%] '>
          <GameGrid/>
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