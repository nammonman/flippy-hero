'use client';
import { useState, useEffect } from 'react';

function GameGrid({ isWideScreen }) {
  return (
    <div className={`relative grid grid-cols-100 gap-0 aspect-square ${isWideScreen ? 'h-[78vh]' : 'h-[49vh]'} shadow-lg shadow-amber-200`}>
      {Array(10000).fill().map((_, i) => {
        const row = Math.floor(i / 100);
        const isEven = (row % 2 === 0 && i % 2 === 0) || (row % 2 === 1 && i % 2 === 1);
        return (
          <div 
            key={i}
            className={`h-[1/2vh] w-[1/2vh] ${isEven ? 'bg-gray-200' : 'bg-gray-400'}`}
          ></div>
        );
      })}
    </div>
  );
}

function DPad({ isWideScreen }) {
  const btnSize = isWideScreen ? 'h-[8vh] w-[8vh]' : 'h-[7vh] w-[7vh]';
  return (
    <div className={`relative w-[32vh] left-0 flex flex-col items-center sm:text-xl text-lg font-black`}>
      <button className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}>U</button>
      <div className="flex">
        <button className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}>L</button>
        <div className={`relative z-10 ${btnSize} bg-gray-500`}></div>
        <button className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}>R</button>
      </div>
      <button className={`relative ${btnSize} bg-gray-500 rounded shadow-amber-900 shadow-md active:shadow-sm`}>D</button>
    </div>
  );
}

function ActionButtons({ isWideScreen }) {
  const btnSize = isWideScreen ? 'h-[14vh] w-[14vh]' : 'h-[10vh] w-[10vh]';
  return (
    <div className="flex flex-row gap-[5%] w-[32vh]"> 
      <div className="relative w-full right-0 flex flex-col items-center space-y-[20%] text-lg font-black">
        <button className={` ${btnSize} bg-green-500 rounded-full shadow-amber-900 shadow-md active:shadow-sm`}>Z</button>
        <button className={` ${btnSize} bg-blue-500 rounded-full shadow-amber-900 shadow-md active:shadow-sm`}>C</button>
      </div>
      <div className="relative w-full right-0 flex items-center space-y-[9%] space-x-[9%] text-lg font-black">
        <button className={` ${btnSize} bg-red-500 rounded-full shadow-amber-900 shadow-md active:shadow-sm`}>A</button>
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

export default function Home() {
  const [isWideScreen, setIsWideScreen] = useState(true);

  useEffect(() => {
    const checkAspectRatio = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      setIsWideScreen(aspectRatio >= 14.5/9);
    };

    checkAspectRatio();
    window.addEventListener('resize', checkAspectRatio);
    return () => window.removeEventListener('resize', checkAspectRatio);
  }, []);

  return (
    <main className="flex bg-gray-900 w-screen h-screen text-black overflow-hidden justify-center items-center">
      {isWideScreen ? (
        <div className='bg-amber-300 rounded-4xl w-[160vh] h-[90vh] flex items-center'>
          <div className='flex justify-between items-center p-[3%] space-x-[3%] w-full h-full'>
            <DPad isWideScreen={isWideScreen}/>
            <GameGrid isWideScreen={isWideScreen}/>
            <ActionButtons isWideScreen={isWideScreen}/>
          </div>
        </div>
      ) : (
        <div className='bg-amber-300 rounded-4xl h-[96vh] w-[54vh] justify-center items-center'>
          <div className='flex justify-between items-center m-[5%] '>
          <GameGrid isWideScreen={isWideScreen}/>
          </div>
          <div className='flex justify-between items-center mx-[5%] space-x-[3%] my-[15%]'>
            <DPad isWideScreen={isWideScreen}/>
            <ActionButtons isWideScreen={isWideScreen}/>
          </div>
          
          
        </div>
      )}
      <SizeIndicator/>
    </main>    
  );
}