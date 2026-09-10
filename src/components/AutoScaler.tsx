import React, { useEffect, useState, useRef } from 'react';
import { Smartphone } from 'lucide-react';

interface AutoScalerProps {
  children: React.ReactNode;
  targetWidth?: number;
  targetHeight?: number;
}

export const AutoScaler: React.FC<AutoScalerProps> = ({
  children,
  targetWidth = 1440,
  targetHeight = 900
}) => {
  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      setIsPortrait(windowHeight > windowWidth);

      const scaleX = windowWidth / targetWidth;
      const scaleY = windowHeight / targetHeight;

      setScale(Math.min(scaleX, scaleY));
    };

    // Attempt to lock orientation to landscape on mobile devices
    if (window.screen && window.screen.orientation && (window.screen.orientation as any).lock) {
      try {
        (window.screen.orientation as any).lock('landscape').catch(() => {
          // Ignore errors (not supported or not in fullscreen)
        });
      } catch (e) {}
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, [targetWidth, targetHeight]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 flex items-center justify-center relative select-none">
      {/* 
        This is the "virtual window" that scales smoothly based on the viewport.
        It strictly maintains the target aspect ratio so layout never breaks.
      */}
      <div
        ref={containerRef}
        style={{
          width: targetWidth,
          height: targetHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'absolute'
        }}
        className="bg-white overflow-hidden shadow-2xl"
      >
        {children}
      </div>

      {/* 
        Mobile Portrait Overlay
        CSS rotation breaks touch/mouse coordinate maps, so the best practice 
        for web games is to require the user to rotate their device. 
      */}
      {isPortrait && (
        <div className="absolute inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
          <Smartphone className="w-24 h-24 mb-8 animate-pulse rotate-90" />
          <h2 className="text-4xl font-black mb-4">Please Rotate Your Device</h2>
          <p className="text-xl text-slate-400 max-w-md">
            This game is designed to be played in landscape mode. Please turn your phone sideways to continue!
          </p>
        </div>
      )}
    </div>
  );
};
