'use client';
import { useState, useEffect, useRef } from 'react';
import { GameStateProvider, useGameState } from './GameContext';
import { Inter } from 'next/font/google'
import { Sixtyfour } from 'next/font/google'

const sixtyfour = Sixtyfour({ subsets: ['latin'], weight: '400' })

function getOverlappingTile(attackElement) {
  const rect = attackElement.getBoundingClientRect();
  const centerPoint = [rect.left + rect.width/2, rect.top + rect.height/2] 

  const overlappingElements = document.elementsFromPoint(centerPoint[0], centerPoint[1]);
  const flippable = overlappingElements.find(el => el.getAttribute('tag') === 'flippable');
  return flippable ? flippable : null;
}

function isOverEdge(attackElement) {
  const rect = attackElement.getBoundingClientRect();
  const centerPoint = [rect.left + rect.width/2, rect.top + rect.height/2] 

  const overlappingElements = document.elementsFromPoint(centerPoint[0], centerPoint[1]);

  const flippable = overlappingElements.find(el => el.getAttribute('tag') === 'flippable');
  if (flippable) {
    return false
  }
  const canvas = overlappingElements.find(el => el.getAttribute('tag') === 'canvas');
  if (canvas) {
    return false
  }
  
  const edge = overlappingElements.find(el => el.getAttribute('tag') === 'edge');
  return edge ? true : false;
}

function getOverlappingTiles(attackElement) {
  const attackRect = attackElement.getBoundingClientRect();
  const tileElements = document.querySelectorAll('[tag="flippable"]');
  const overlappingTiles = [];

  tileElements.forEach(tileElement => {
    const tileRect = tileElement.getBoundingClientRect();
    
    if (!(attackRect.right < tileRect.left || 
          attackRect.left > tileRect.right || 
          attackRect.bottom < tileRect.top || 
          attackRect.top > tileRect.bottom)) {
      overlappingTiles.push(tileElement);
    }
  });

  return overlappingTiles.length > 0 ? overlappingTiles : null;
}

function changeTileColor(tileElement) {
  tileElement.style.backgroundColor = "blue";
  tileElement.classList.add('rotate-x-180');
  tileElement.style.transition = 'transform 0.5s';
  tileElement.style.transform = 'rotateX(180deg)';
}

function DebugText() {
  return (
    <div className={`absolute z-100 top-0 left-0 text-amber-50 text-shadow-lg font-mono bg-amber-950 opacity-90 w-60 wrap-break-word pointer-events-none`}>
      {/*🠉🠉🠋🠋🠈🠊🠈🠊BA
      <br/>*/}
      hello im debug<br/>
      <br/>
      gridPosition:<br/>{"placeholder"}<br/>
      <br/>
      undoHistory:<br/>{"placeholder"}<br/>
      <br/>
      redoHistory:<br/>{"placeholder"}<br/>
    </div>
  );
}

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
      >
        <div 
          className={`absolute top-[50%] left-[130%] z-40 bg-violet-900 aspect-square ${isWideScreen ? 'h-[5.5vh]' : 'h-[3.5vh]'} transform -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
          tag="atk1"
        ></div>
        
        <div 
          className={`absolute top-[50%] left-[145%] z-40 bg-violet-900 ${isWideScreen ? 'h-[17.5vh] w-[8.8vh]' : 'h-[11.3vh] w-[5.8vh]'} transform -translate-x-1/2 -translate-y-1/2  pointer-events-none opacity-50`}
          tag="atk2"
        ></div>
        
        <div 
          className={`absolute top-[50%] left-[50%] z-40 bg-violet-900 aspect-square ${isWideScreen ? 'h-[30.5vh]' : 'h-[19.5vh]'} transform -translate-x-1/2 -translate-y-1/2  pointer-events-none opacity-40`}
          tag="atk3"
        ></div>
        
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
    canvas.width = canvas.offsetWidth *4; // quadruple resolution for saving png
    canvas.height = canvas.offsetHeight *4;
    
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
      tag="canvas"
    />
  );
}

function DPad() {
  const { isWideScreen, isZoomed, playerDirection, setPlayerDirection, playerPosition, setPlayerPosition } = useGameState();
  const btnSize = isWideScreen ? 'h-[8vh] w-[8vh]' : 'h-[7vh] w-[7vh]';

  const pressTimeRef = useRef(null);

  const startMove = (degrees, dx = 0, dy = 0) => {
    setPlayerDirection(degrees);
    const maxSpeed = 0.5;
    const acceleration = 0.015;
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
      
    }, 1);

  };

  const stopMove = () => {
    clearInterval(pressTimeRef.current);
    pressTimeRef.current = null;
  };

  
  useEffect(() => {
    const interval = setInterval(() => {
      const attackElement = document.querySelector(`[tag="atk1"]`);
      if (attackElement && isOverEdge(attackElement)) {
        // teleport the player to the opposite side based on the direction
        if (playerDirection === 0) {
          // r-l
          setPlayerPosition((prev) => ({ ...prev, x: 7 }));
        } else if (playerDirection === 180) {
          // l-r
          setPlayerPosition((prev) => ({ ...prev, x: 93 }));
        } else if (playerDirection === 90) {
          // b-t
          setPlayerPosition((prev) => ({ ...prev, y: 7 }));
        } else if (playerDirection === 270) {
          // t-b
          setPlayerPosition((prev) => ({ ...prev, y: 93 }));
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [playerDirection, setPlayerPosition]);

  return (
    <div className={`relative w-[32vh] left-0 flex flex-col items-center sm:text-xl text-2xl font-black`}>
      <button 
        className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
        onMouseDown={() => startMove(270, 0, -2)}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchStart={() => startMove(90, 0, -2)}
        onTouchEnd={stopMove}
        style={{ fontSize: 'calc(4vh)' }}
      >🠉</button>
      <div className="flex">
        <button 
          className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
          onMouseDown={() => startMove(180, -2, 0)}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          onTouchStart={() => startMove(180, -2, 0)}
          onTouchEnd={stopMove}
          style={{ fontSize: 'calc(4vh)' }}
        >🠈</button>
        <div className={`relative z-10 ${btnSize} bg-gray-500`}></div>
        <button 
          className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
          onMouseDown={() => startMove(0, 2, 0)}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          onTouchStart={() => startMove(0, 2, 0)}
          onTouchEnd={stopMove}
          style={{ fontSize: 'calc(4vh)' }}
        >🠊</button>
      </div>
      <button 
        className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
        onMouseDown={() => startMove(90, 0, 2)}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchStart={() => startMove(90, 0, 2)}
        onTouchEnd={stopMove}
        style={{ fontSize: 'calc(4vh)' }}
      >🠋</button>
    </div>
  );
}

function ActionButtons() {
  const { isWideScreen, isZoomed, setIsZoomed } = useGameState();
  const btnSize = isWideScreen ? 'h-[14vh] w-[14vh]' : 'h-[10vh] w-[10vh]';
  const attackPressRef = useRef(null);
  
  const attack = (attackTag) => {
    const attackElement = document.querySelector(`[tag="${attackTag}"]`);
    if (attackElement) {
      if (attackTag === 'atk1') {
        const tile = getOverlappingTile(attackElement);
        if (tile) {
          changeTileColor(tile)
        };
      } 
      else {
        const tiles = getOverlappingTiles(attackElement);
        if (tiles) {
          tiles.forEach(tile => changeTileColor(tile))
        };
      }
    }
  };

  const chargeAttack = () => {
    const atkbtn = document.querySelector(`[tag="atkbtn"]`);
    const startTime = Date.now();
    attackPressRef.current = {
      startTime,
      intervalId: setInterval(() => {
        const duration = Date.now() - startTime;
        if (duration < 500) {
          atkbtn.style.backgroundColor = "#fb2c36"; 
        } else if (duration < 1000) {
          atkbtn.style.backgroundColor = "salmon";
        } else {
          atkbtn.style.backgroundColor = "pink";
        }
      }, 50)
    };
  };

  const stopAttack = () => {
    if (!attackPressRef.current) return;
    
    clearInterval(attackPressRef.current.intervalId);

    const duration = Date.now() - attackPressRef.current.startTime;
    
    if (duration < 500) {
      attack("atk1");
    } else if (duration < 1000) {
      attack("atk2");
    } else {
      attack("atk3");
    }

    const atkbtn = document.querySelector(`[tag="atkbtn"]`);
    atkbtn.style.backgroundColor = "#fb2c36";
    attackPressRef.current = null;
  };

  return (
    <div className="flex flex-row gap-[5%] w-[32vh]"> 
      <div className="relative w-full right-0 flex flex-col items-center space-y-[20%] text-lg font-black">
        <button 
          className={` ${btnSize} bg-green-500 rounded-full shadow-amber-900 shadow-lg active:shadow-sm`}
          onClick={() => setIsZoomed(!isZoomed)}
          style={{ fontSize: 'calc(4vh)' }}
        >Z</button>
        <button 
          className={` ${btnSize} bg-blue-500 rounded-full shadow-amber-900 shadow-lg active:shadow-sm`}
          style={{ fontSize: 'calc(4vh)' }}
        >C</button>
      </div>
      <div className="relative w-full right-0 flex items-center space-y-[9%] space-x-[9%] text-lg font-black">
        <button 
          className={` ${btnSize} bg-red-500 rounded-full shadow-amber-900 shadow-lg active:shadow-sm`}
          onMouseDown={chargeAttack}
          onMouseUp={stopAttack}
          onMouseLeave={stopAttack}
          onTouchStart={chargeAttack}
          onTouchEnd={stopAttack}
          style={{ fontSize: 'calc(4vh)' }}
          tag="atkbtn"
        >A</button>
      </div>
    </div>
  );
}

function OptionButtons() {
  const { isWideScreen, isZoomed } = useGameState();
  if (isWideScreen) {
    return (
      <div className={`absolute bottom-[12vh] w-[160vh] flex items-center justify-center text-lg font-bold space-x-[1%]`}>
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(2vh)' }}>Show Position</div>
            <button className='bg-gray-400 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'></button>
        </div>
        <div className={`relative w-[90vh] h-[3vh] `}></div>
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(2vh)' }}>Undo</div>
            <button className='bg-gray-300 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'></button>
        </div>
        <div className={`relative w-[4vh] h-[3vh] `}></div>
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(2vh)' }}>Redo</div>
            <button className='bg-gray-300 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'></button>
        </div>
      </div>
      
    );
  }
  else {
    return (
      <div className='relative flex flex-row justify-center items-center w-full space-x-[10%] font-bold'>
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(1.5vh)' }}>Show Position</div>
            <button className='bg-gray-400 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'></button>
        </div>
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(1.5vh)' }}>Undo</div>
            <button className='bg-gray-300 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'></button>
        </div>
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(1.5vh)' }}>Redo</div>
            <button className='bg-gray-300 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'></button>
        </div>
      </div>
    );
  }
  
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
    <main className={`flex bg-gray-900 w-screen h-screen text-black overflow-hidden justify-center items-center  ${sixtyfour.className}`} tag="edge">
      {isWideScreen ? (
        <div className='bg-amber-300 rounded-4xl w-[160vh] h-[90vh] flex items-center shadow-inner shadow-amber-50' tag="edge">
          <div className='flex justify-between items-center p-[3%] space-x-[3%] w-full h-full'>
            <DPad/>
            <div className="relative">
              <GameGrid/>
              <FlipGrid/>
            </div>
            <ActionButtons/>
            
          </div>
          <OptionButtons/>
        </div>
      ) : (
        <div className='bg-amber-300 rounded-4xl h-[96vh] w-[54vh] justify-center items-center shadow-inner shadow-amber-700' tag="edge">
          <div className='flex justify-between items-center m-[5%] '>
            <div className="relative">
              <GameGrid/>
              <FlipGrid/>
            </div>
          </div>
          <div className='flex justify-between items-center mx-[5%] space-x-[3%] mt-[10%] mb-[10%]'>
            <DPad/>
            <ActionButtons/>
          </div>
          <OptionButtons/>
        </div>
      )}
      <DebugText/>
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