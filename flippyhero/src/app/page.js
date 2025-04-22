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

function changeTileColor(tileElement, color) {

  let rotation = parseInt(tileElement.dataset.rotation || 0);

  if (rotation < 180) {
    rotation += 180;
  }
  else {
    rotation -= 180;
  }
  tileElement.dataset.rotation = rotation;
  tileElement.style.backgroundColor = color;
  tileElement.style.transition = 'transform 0.5s';
  tileElement.style.transform = `rotateX(${rotation}deg)`;


  
}

function DebugText() {
  const { isWideScreen,
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
    gameGridHistory,
    updateGameGridHistory,
    undo,
    redo,
    historyIndex} = useGameState();
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId;

    const loop = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className={`absolute z-100 top-0 left-0 text-amber-50 text-shadow-lg font-mono bg-amber-950 opacity-90 w-60 wrap-break-word pointer-events-none`}>
      hello im debug<br/><br/>
      FPS: {fps}<br/><br/>
      currentColor:<br/>{currentColor}<br/><br/>
      cameraPosition:<br/>{JSON.stringify(cameraPosition)}<br/><br/>
      gameGridHistory's length:<br/>{gameGridHistory.length - 1}<br/><br/>
      historyIndex:<br/>{historyIndex}<br/>
    </div>
  );
}

function AlertText({ text }) {
  const { isWideScreen, isZoomed } = useGameState();
  return (
    <div 
      className="absolute top-[50%] z-100 text-center h-fit py-[2vh] bg-violet-700 w-[100.1%] transform -translate-y-1/2 opacity-0 transition-opacity duration-500 pointer-events-none"
      style={{ fontSize: 'calc(2vh)' }}
    >{text}</div>
  );
}

function PlayerCharacter() {
  const { isWideScreen, isZoomed, playerDirection, playerPosition } = useGameState();

  const directionImage = {
    0: 'right.png',  
    90: 'down.png',  
    180: 'left.png', 
    270: 'up.png',   
  };
  
  return (
    isZoomed && (
      <div 
        className={`absolute z-40 aspect-square ${isWideScreen ? 'h-[11vh]' : 'h-[7vh]'} `}
        style={{
          top: `${playerPosition.y}%`,
          left: `${playerPosition.x}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <img
          src={`player_attacking/${directionImage[playerDirection]}`}
          className="w-full h-full z-50 absolute pointer-events-none select-none"
          draggable={false}
          style={{ imageRendering: 'pixelated'}}
        />
        <div className='z-1 w-full h-full' style={{transform: `rotate(${playerDirection}deg)`}}>
          <div 
            className={`absolute top-[50%] left-[130%] z-40 bg-violet-900 aspect-square ${isWideScreen ? 'h-[1vh]' : 'h-[1vh]'} transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0`}
            tag="atk1"
          ></div>
          
          <div 
            className={`absolute top-[50%] left-[145%] z-40 bg-violet-900 ${isWideScreen ? 'h-[17.5vh] w-[8.8vh]' : 'h-[11.3vh] w-[5.8vh]'} transform -translate-x-1/2 -translate-y-1/2  pointer-events-none opacity-0`}
            tag="atk2"
          ></div>
          
          <div 
            className={`absolute top-[50%] left-[50%] z-40 bg-violet-900 aspect-square ${isWideScreen ? 'h-[30.5vh]' : 'h-[19.5vh]'} transform -translate-x-1/2 -translate-y-1/2  pointer-events-none opacity-0`}
            tag="atk3"
          ></div>
        </div>
        
      </div>
    )
  );
}

function FlipGrid() {
  const { isWideScreen, isZoomed, gameGridData, cameraPosition } = useGameState();
  if (isZoomed) {
    return (
      <div className={`absolute top-0 left-0 z-20 grid grid-cols-10 gap-0 aspect-square ${isWideScreen ? 'h-[77vh]' : 'h-[40.5vh]'}`}>
        {Array(100).fill().map((_, i) => {
          const col = i % 10;
          const row = Math.floor(i / 10);
          const x = col + (cameraPosition.x*10);
          const y = row + (cameraPosition.y*10);
          return (
            <div 
              key={i}
              className={`h-[101%] w-[101%]  opacity-88`}
              style={{ backgroundColor: gameGridData[y][x].color }}
              tag='flippable'
              coordinatex={col}
              coordinatey={row}
            ></div>
          );
        })}
        <PlayerCharacter/>
      </div>
    );
  }
  else {
    return (
      <div className={`absolute top-0 left-0 z-20 grid grid-cols-10 gap-0 aspect-square ${isWideScreen ? 'h-[77vh]' : 'h-[40.5vh]'} pointer-events-none`}>
        {Array(100).fill().map((_, i) => {
          const col = i % 10;
          const row = Math.floor(i / 10);
          return (
            <div 
              key={i}
              className={`h-[99%] w-[99%] bg-violet-700 opacity-0 pointer-events-none`}
              coordinatex={col}
              coordinatey={row}
            ></div>
          );
        })}
      </div>
    );
  }
}

function GameGrid() {
  const { isWideScreen, isZoomed, gameGridData } = useGameState();
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
        if (isZoomed) {
          const isEven = (row % 2 === 0 && col % 2 === 0) || (row % 2 === 1 && col % 2 === 1);
          ctx.fillStyle = isEven ? '#e5e7eb' : '#9ca3af';
        }
        else {
          ctx.fillStyle = gameGridData[row][col].color;
        }
        ctx.fillRect(col * tileSize, row * tileSize, tileSize+1, tileSize+1); // +1 to fix gaps
      }
    }
  }, [isZoomed, gameGridData]);

  return (
    <canvas
      ref={canvasRef}
      className={`relative aspect-square ${isWideScreen ? 'h-[77vh]' : 'h-[40.5vh]'}`}
      tag="canvas"
    />
  );
}

function DPad() {
  const { isWideScreen, isZoomed, playerDirection, setPlayerDirection, setPlayerPosition, cameraPosition, setCameraPosition, canMove, setCanMove } = useGameState();
  const btnSize = isWideScreen ? 'h-[8vh] w-[8vh]' : 'h-[6vh] w-[6vh]';

  const pressTimeRef = useRef(null);
  const activeInputRef = useRef(null);
  const canMoveRef = useRef(canMove);
  const playerDirectionRef = useRef(playerDirection);
  const cameraPositionRef = useRef(cameraPosition);

  useEffect(() => {
    canMoveRef.current = canMove;
    playerDirectionRef.current = playerDirection;
    cameraPositionRef.current = cameraPosition;
  }, [playerDirection, cameraPosition, canMove]);
  

  const startMove = (degrees, dx = 0, dy = 0) => {
    setPlayerDirection(degrees);
    setCanMove(true);
    const maxSpeed = 0.8;
    const acceleration = 0.08;
    let currentSpeed = 0;
    
    pressTimeRef.current = setInterval(() => {
      currentSpeed = Math.min(maxSpeed, currentSpeed + acceleration);
      const adjustedDx = (dx / 2) * currentSpeed;
      const adjustedDy = (dy / 2) * currentSpeed;
      if (canMoveRef.current && currentSpeed > 0.2) {
        const attackElement = document.querySelector(`[tag="atk1"]`);
        //console.log(canMove);
        if (attackElement && isOverEdge(attackElement)) {
          
          // teleport the player to the opposite side based on the direction
          if (playerDirectionRef.current === 0) {
            // r-l
            if (cameraPositionRef.current.x < 9) {
              setPlayerPosition((prev) => ({ ...prev, x: 7 }));
              setCameraPosition((prev) => ({ ...prev, x: prev.x + 1 }));
            }
            else {
              setCanMove(false)
            }
          } else if (playerDirectionRef.current === 180) {
            // l-r
            if (cameraPositionRef.current.x > 0) {
              setPlayerPosition((prev) => ({ ...prev, x: 93 }));
              setCameraPosition((prev) => ({ ...prev, x: prev.x - 1 }));
            }
            else {
              setCanMove(false)
            }
            
          } else if (playerDirectionRef.current === 90 ) {
            // b-t
            if (cameraPositionRef.current.y < 9) {
              setPlayerPosition((prev) => ({ ...prev, y: 7 }));
              setCameraPosition((prev) => ({ ...prev, y: prev.y + 1 }));
            } else {
              setCanMove(false)
            }
            
          } else if (playerDirectionRef.current === 270 ) {
            // t-b
            if (cameraPositionRef.current.y > 0) {
              setPlayerPosition((prev) => ({ ...prev, y: 93 }));
              setCameraPosition((prev) => ({ ...prev, y: prev.y - 1 }));
            } else {
              setCanMove(false)
            }
              
          }
        }
        setPlayerPosition(prev => ({
          x: Math.max(0, Math.min(100, prev.x + adjustedDx)),
          y: Math.max(0, Math.min(100, prev.y + adjustedDy))
        }));
      }
      
    }, 16 );

  };

  const stopMove = () => {
    clearInterval(pressTimeRef.current);
    pressTimeRef.current = null;
    setCanMove(true)
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
        style={{ fontSize: 'calc(4vh)' }}
        disabled={!isZoomed}
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
          disabled={!isZoomed}
        >🠈</button>
        <div className={`relative z-10 ${btnSize} bg-gray-500 text-center`}></div>
        <button 
          className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}
          onMouseDown={() => startMove(0, 2, 0)}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          onTouchStart={() => startMove(0, 2, 0)}
          onTouchEnd={stopMove}
          style={{ fontSize: 'calc(4vh)' }}
          disabled={!isZoomed}
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
        disabled={!isZoomed}
      >🠋</button>
    </div>
  );
}

function ActionButtons() {
  const { isWideScreen, isZoomed, setIsZoomed, currentColor, setCurrentColor, gameGridData, updateGameGridData, cameraPosition, updateGameGridHistory } = useGameState();
  const btnSize = isWideScreen ? 'h-[14vh] w-[14vh]' : 'h-[8vh] w-[8vh]';
  const attackPressRef = useRef(null);

  const attack = (attackTag) => {
    const attackElement = document.querySelector(`[tag="${attackTag}"]`);
    if (attackElement) {
      if (attackTag === 'atk1') {
        const tile = getOverlappingTile(attackElement);
        if (tile) {
          changeTileColor(tile, currentColor);
          const x = parseInt(tile.getAttribute('coordinatex')) + (cameraPosition.x*10);
          const y = parseInt(tile.getAttribute('coordinatey')) + (cameraPosition.y*10);
          updateGameGridData(x, y, currentColor);
        };
      } 
      else {
        const tiles = getOverlappingTiles(attackElement);
        if (tiles) {
          tiles.forEach(tile => {
            changeTileColor(tile, currentColor)
            const x = parseInt(tile.getAttribute('coordinatex')) + (cameraPosition.x*10);
            const y = parseInt(tile.getAttribute('coordinatey')) + (cameraPosition.y*10);
            updateGameGridData(x, y, currentColor);
          });
        };
      }
    }
    updateGameGridHistory(gameGridData);
  };

  const chargeAttack = () => {
    const atkbtn = document.querySelector(`[tag="atkbtn"]`);
    const atk1Element = document.querySelector(`[tag="atk1"]`);
    const atk2Element = document.querySelector(`[tag="atk2"]`);
    const atk3Element = document.querySelector(`[tag="atk3"]`);
    const startTime = Date.now();
    attackPressRef.current = {
      startTime,
      intervalId: setInterval(() => {
        const duration = Date.now() - startTime;
        if (duration < 500) {
          atkbtn.style.backgroundColor = "#fb2c36"; 
          atk1Element.style.opacity = 0.4;
        } else if (duration < 1000) {
          atkbtn.style.backgroundColor = "salmon";
          atk1Element.style.opacity = 0;
          atk2Element.style.opacity = 0.4;
        } else {
          atkbtn.style.backgroundColor = "pink";
          atk2Element.style.opacity = 0;
          atk3Element.style.opacity = 0.4;
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
    document.querySelector(`[tag="atk1"]`).style.opacity = 0;
    document.querySelector(`[tag="atk2"]`).style.opacity = 0;
    document.querySelector(`[tag="atk3"]`).style.opacity = 0;
  };

  const colorInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const debounceColorChange = (e) => {
    const value = e.target.value;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setCurrentColor(value);
    }, 1);
  };

  return (
    <div className="flex flex-row gap-[5%] w-[32vh]"> 
      <div className="relative w-full right-0 flex flex-col items-center space-y-[20%] text-lg font-black">
        <button 
          className={` ${btnSize} bg-green-500 rounded-full shadow-amber-900 shadow-lg active:shadow-sm`}
          onClick={() => setIsZoomed(!isZoomed)}
          style={{ fontSize: 'calc(4vh)' }}
        >Z</button>
        <div className="relative">
          <button
            className={` ${btnSize} rounded-[33%] border-gray-400 border-[1vh] shadow-amber-900 shadow-lg p-0 active:shadow-sm text-gray-400 text-shadow-lg`}
            onClick={() => colorInputRef.current.click()}
            style={{ fontSize: 'calc(4vh)', backgroundColor: currentColor }}
            tag="colbtn"
          >C</button>
          <input 
            type="color" 
            ref={colorInputRef}
            value={currentColor}
            onChange={debounceColorChange}
            className="absolute top-0 left-full w-0 h-0"
          />
        </div>
      </div>
      <div className="relative w-full right-0 flex items-center space-y-[9%] space-x-[9%] text-lg font-black">
        <button 
          disabled={!isZoomed}
          className={`${btnSize} bg-red-500 rounded-full shadow-amber-900 shadow-lg active:shadow-sm `}
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

function OptionButtons({ setEnableOptions, setEnableHelp }) {
  const { isWideScreen, isZoomed, cameraPosition, undo, redo } = useGameState();
  const [positionShown, setPositionShown] = useState(false);

  const showPosition = () => {
    if (!isZoomed) {
      const tileElement = document.querySelector(
        `[coordinatex="${cameraPosition.x}"][coordinatey="${cameraPosition.y}"]`
      );
      if (tileElement) {
        let rotation = parseInt(tileElement.dataset.rotation || 0);

        if (rotation < 180) {
          rotation += 180;
        }
        else {
          rotation -= 180;
        }
        tileElement.dataset.rotation = rotation;
        
        if (!positionShown) {
          tileElement.style.opacity = 0.7;
          setPositionShown(true);
        }
        else {
          tileElement.style.opacity = 0;
          setPositionShown(false);
        }
        tileElement.style.transition = 'transform 0.5s';
        tileElement.style.transform = `rotateX(${rotation}deg)`;
      }
      else {
        console.log("element not found");
        
      }
    }
  }

  if (isWideScreen) {
    return (
      <div className={`absolute bottom-[12vh] w-[160vh] flex items-center justify-center text-lg font-bold space-x-[1%]`}>
        <div className='absolute top-[8.4vh] flex opacity-80 space-x-[10vh]'>
        <div className='relative flex justify-center items-center text-center text-amber-600 space-x-[10%]'>
            <div className='text-nowrap' style={{ fontSize: 'calc(2.2vh)' }}>Help</div>
            <button 
              className='bg-amber-400 w-[8vh] h-[3vh] rounded-full shadow-amber-600 shadow-md active:shadow-sm'
              onClick={() => setEnableHelp(true)}
            ></button>
          </div>
          <div className='relative flex justify-center items-center text-center text-amber-600 space-x-[10%]'>

            <div className='text-nowrap' style={{ fontSize: 'calc(2.2vh)' }}>Options</div>
            <button 
              className='bg-amber-400 w-[8vh] h-[3vh] rounded-full shadow-amber-600 shadow-md active:shadow-sm'
              onClick={() => setEnableOptions(true)}
            ></button>
          </div>
          
        </div>
        
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(2.2vh)' }}>Show Position</div>
            <button 
              className='bg-gray-400 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'
              onClick={showPosition}
            ></button>
        </div>
        <div className={`relative w-[88vh] h-[3vh] `}></div>
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(2.2vh)' }} >Undo</div>
            <button 
              className='bg-gray-300 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'
              onClick={undo}
            ></button>
        </div>
        <div className={`relative w-[4vh] h-[3vh] `}></div>
        <div className='relative flex flex-col justify-center items-center text-center'>
            <div style={{ fontSize: 'calc(2.2vh)' }}>Redo</div>
            <button 
              className='bg-gray-300 w-[8vh] h-[3vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'
              onClick={redo}
            ></button>
        </div>
      </div>
    );
  }
  else {
    return (
      <div className='relative flex flex-row justify-center items-center w-full font-bold'>
        <div className='absolute bottom-[32vh] w-full flex justify-between px-[4.5vh] opacity-80 space-x-[20%]'>
          <div className='relative flex  items-center text-center text-amber-600 space-x-[10%]'>
            <div className='text-nowrap' style={{ fontSize: 'calc(1.4vh)' }}>Help</div>
            <button 
              className='bg-amber-400 w-[6vh] h-[2vh] rounded-full shadow-amber-600 shadow-md active:shadow-sm flex-shrink-0'
              onClick={() => setEnableHelp(true)}
            ></button>
          </div>
          <div className='relative flex  items-center text-center text-amber-600 space-x-[10%]'>
            <div className='text-nowrap' style={{ fontSize: 'calc(1.4vh)' }}>Options</div>
            <button 
              className='bg-amber-400 w-[6vh] h-[2vh] rounded-full shadow-amber-600 shadow-md active:shadow-sm flex-shrink-0'
              onClick={() => setEnableOptions(true)}
            ></button>
          </div>
        </div>
        <div className='relative flex flex-col justify-center items-center text-center mx-[5%]'>
            <div className='' style={{ fontSize: 'calc(1.4vh)' }}>Show Position</div>
            <button 
              className='bg-gray-400 w-[6vh] h-[2vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'
              onClick={showPosition}
            ></button>
        </div>
        <div className='relative flex flex-col justify-center items-center text-center mx-[5%]'>
            <div style={{ fontSize: 'calc(1.4vh)' }}>Undo</div>
            <button 
              className='bg-gray-300 w-[6vh] h-[2vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'
              onClick={undo}
            ></button>
        </div>
        <div className='relative flex flex-col justify-center items-center text-center mx-[5%]'>
            <div style={{ fontSize: 'calc(1.4vh)' }}>Redo</div>
            <button 
              className='bg-gray-300 w-[6vh] h-[2vh] rounded-full shadow-amber-900 shadow-md active:shadow-sm'
              onClick={redo}
            ></button>
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
  const { isWideScreen, setIsWideScreen, setIsZoomed, updateGameGridData, updateGameGridHistory, gameGridData } = useGameState();
  const [enableDebug, setEnableDebug] = useState(false);
  const [enableWelcome, setEnableWelcome] = useState(true);
  const [enableOptions, setEnableOptions] = useState(false);
  const [enableHelp, setEnableHelp] = useState(false);

  useEffect(() => {
    const checkAspectRatio = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      setIsWideScreen(aspectRatio >= 14.5/9);
    };

    checkAspectRatio();
    window.addEventListener('resize', checkAspectRatio);
    return () => window.removeEventListener('resize', checkAspectRatio);
  }, [setIsWideScreen]);

  const clearCanvas = () => {
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        updateGameGridData(x, y, "#FFFFFF");
      }
    }
    updateGameGridHistory(
      Array.from({ length: 100 }, (_, y) =>
        Array.from({ length: 100 }, (_, x) => ({
          color: "#FFFFFF",
        }))
      )
    );
  };

  const btnSize = isWideScreen ? 'h-[14vh] w-[14vh]' : 'h-[10vh] w-[10vh]';

  return (
    <main className={`flex bg-gray-900 w-screen h-screen text-black overflow-hidden justify-center items-center  ${sixtyfour.className}`} tag="edge">
      {enableWelcome ?(<div className='absolute z-100 h-full w-full backdrop-blur-lg flex items-center justify-center'>
        <div className={`h-fit ${isWideScreen ? 'w-fit' : ''} bg-amber-600 rounded-4xl shadow-2xl text-center p-[2vh] m-[2vh] text-amber-50`}>
          <div className='my-[4vh] mx-[2vh] '>Welcome to FLIPPYHERO!</div>
          <div className='my-[4vh] mx-[2vh] font-mono'>
            Paint but you are a hero! <br/><br/>
            This is a web based game where you can play as a hero who has the abliity to flip tiles on a grid to any color and create images in a unique way. <br/><br/>
            Your goal is to express your creativity on a 100x100 grid.<br/><br/>
            <button className='font-bold underline' onClick={() => setEnableWelcome(false)}>Let's go!</button>
          </div>
        </div>
      </div>) : null}
      {enableOptions ?(<div className='absolute z-100 h-full w-full backdrop-blur-lg flex items-center justify-center'>
        <div className={`h-fit ${isWideScreen ? 'w-fit' : ''} bg-amber-600 rounded-4xl shadow-2xl text-center p-[2vh] m-[2vh] text-amber-50`}>
          <div className='my-[4vh] mx-[2vh] '>Options</div>
          <div className='my-[4vh] mx-[2vh] flex justify-between font-mono'>
            Toggle fullscreen
            <button 
              className='font-bold underline ml-[10vh]' 
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }}
            >Click</button>
          </div>
          <div className='my-[4vh] mx-[2vh] flex justify-between font-mono'>
            Switch portrait/landscape
            <button 
              className='font-bold underline ml-[10vh]' 
              onClick={() => setIsWideScreen(!isWideScreen)}
            >Click</button>
          </div>
          <div className='my-[4vh] mx-[2vh] flex justify-between font-mono'>
            Clear canvas
            <button 
              className='font-bold underline ml-[10vh]' 
              onClick={clearCanvas}
            >Click</button>
          </div>
          <div className='my-[4vh] mx-[2vh] flex justify-between font-mono'>
            View source code
            <button 
              className='font-bold underline ml-[10vh]' 
              onClick={() => {
                window.open('https://github.com/nammonman/flippy-hero')
              }}
              >Click</button>
          </div>
          <div className='flex justify-center my-[4vh] mx-[2vh] '>
            <button className='font-bold underline font-mono' onClick={() => setEnableOptions(false)}>Return to game</button>
          </div>
        </div>
      </div>) : null}
      {enableHelp ?(<div className='absolute z-100 h-full w-full backdrop-blur-lg flex items-center justify-center'>
        <div className={`h-fit ${isWideScreen ? 'w-fit' : ''} bg-amber-600 rounded-4xl shadow-2xl text-center p-[2vh] m-[2vh] text-amber-50`}>
          <div className='my-[4vh] mx-[2vh] '>How to Play?</div>
          <div className='flex justify-left my-[4vh] mx-[2vh] '>
            <button 
              className={`w-15 h-15 bg-red-500 rounded-full shadow-xl mr-[4vh] flex-shrink-0`}
            >A</button>
            <div className='font-mono text-left '>This is the <b>Attack</b> button. <br/> <u>TAP</u> to flip a tile in front or <u>HOLD</u> up to 2 seconds to flip more tiles. </div>
          </div>
          <div className='flex justify-left my-[4vh] mx-[2vh] '>
            <button 
              className={`w-15 h-15 bg-green-500 rounded-full shadow-xl mr-[4vh] flex-shrink-0`}
            >Z</button>
            <div className='font-mono text-left '>This is the <b>Zoom</b> button. <br/> <u>TAP</u> to toggle between the full canvas view and the zoomed view. <br/> You can right click the canvas (or hold on mobile) to save the image.</div>
          </div>
          <div className='flex justify-left my-[4vh] mx-[2vh] '>
            <button 
              className={`w-15 h-15 bg-blue-700 rounded-[33%] border-gray-400 border-[1vh] shadow-xl p-0 text-gray-400 text-shadow-lg mr-[4vh] flex-shrink-0`}
            >C</button>
            <div className='font-mono text-left '>This is the <b>Color</b> button. <br/> <u>TAP</u> to select a color. </div>
          </div>
          <div className='flex justify-center my-[4vh] mx-[2vh] '>
            <button className='font-bold underline font-mono' onClick={() => setEnableHelp(false)}>Return to game</button>
          </div>
          
        </div>
      </div>) : null}
      {isWideScreen ? (
        <div className='bg-amber-300 rounded-4xl w-[160vh] h-[90vh] flex items-center shadow-inner shadow-amber-50 z-10' tag="edge">
          <div className='flex justify-between items-center p-[3%] space-x-[3%] w-full h-full'>
            <DPad/>
            <div className="relative">
              <GameGrid/>
              <FlipGrid/>
              <AlertText text="changes are outside of camera view"/>
            </div>
            <ActionButtons/>
            
          </div>
          <OptionButtons setEnableOptions={setEnableOptions} setEnableHelp={setEnableHelp}/>
        </div>
      ) : (
        <div className='bg-amber-300 rounded-4xl h-[84vh] w-[45vh] justify-center items-center shadow-inner shadow-amber-700 z-10' tag="edge">
          <div className='flex justify-between items-center m-[5%] '>
            <div className="relative">
              <GameGrid/>
              <FlipGrid/>
              <AlertText text="changes are outside of camera view"/>
            </div>
          </div>
          <div className='flex justify-between items-center mx-[5%] space-x-[3%] mt-[20%] mb-[10%]'>
            <DPad/>
            <ActionButtons/>
          </div>
          <OptionButtons setEnableOptions={setEnableOptions} setEnableHelp={setEnableHelp}/>
        </div>
      )}
      {enableDebug ? (<DebugText/>) : null}
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