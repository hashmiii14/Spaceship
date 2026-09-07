import React, { useState, useRef, useEffect } from 'react';
import { Crosshair, RotateCcw } from 'lucide-react';
import { EventBus } from '../utils/EventBus';

export const MobileControls: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect touch capability or mobile screen
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;
      setIsTouchDevice(hasTouch);
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth <= 840);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        EventBus.emit('input:mobileMove', { x: 0, y: 0 });
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = (Math.cos(angle) * clampedDist) / maxRadius;
    const ny = (Math.sin(angle) * clampedDist) / maxRadius;

    setKnobPos({ x: Math.cos(angle) * clampedDist, y: Math.sin(angle) * clampedDist });
    EventBus.emit('input:mobileMove', { x: nx, y: ny });
  };

  const handleShootStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsShooting(true);
    EventBus.emit('input:mobileShoot', true);
  };

  const handleShootEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsShooting(false);
    EventBus.emit('input:mobileShoot', false);
  };

  if (!isTouchDevice) return null;

  return (
    <>
      {/* Optional Portrait Warning Banner */}
      {isPortrait && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-mono font-bold px-3 py-1 rounded-full pointer-events-none z-40 animate-pulse flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,51,0.5)]">
          <RotateCcw className="w-3.5 h-3.5 text-red-400" />
          <span>ROTATE DEVICE FOR FULL COMBAT VIEW</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 flex justify-between items-end pointer-events-none z-30 select-none touch-none">
        {/* Virtual Joystick (Bottom Left) */}
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-red-500/50 bg-black/70 relative flex items-center justify-center pointer-events-auto touch-none shadow-[0_0_20px_rgba(255,0,51,0.2)]"
        >
          {/* Outer Ring Accent */}
          <div className="absolute inset-2 rounded-full border border-dashed border-red-500/30" />

          {/* Joystick Knob */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 transition-transform ${
              isDragging
                ? 'bg-red-600/70 border-red-400 shadow-[0_0_25px_rgba(255,0,51,0.9)]'
                : 'bg-red-950/60 border-red-500/70'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          />
        </div>

        {/* Touch Fire Button (Bottom Right) */}
        <button
          onTouchStart={handleShootStart}
          onTouchEnd={handleShootEnd}
          onTouchCancel={handleShootEnd}
          onMouseDown={handleShootStart}
          onMouseUp={handleShootEnd}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 flex flex-col items-center justify-center pointer-events-auto touch-none transition-all ${
            isShooting
              ? 'bg-red-600/80 border-rose-300 scale-95 shadow-[0_0_35px_rgba(255,0,51,1)]'
              : 'bg-red-950/70 border-red-500/80 shadow-[0_0_25px_rgba(255,0,51,0.4)] active:scale-95'
          }`}
        >
          <Crosshair className="w-8 h-8 text-rose-300 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-black font-['Orbitron'] tracking-wider text-rose-100 mt-0.5">
            FIRE
          </span>
        </button>
      </div>
    </>
  );
};
