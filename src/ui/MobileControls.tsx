import React, { useState, useRef, useEffect } from 'react';
import { Crosshair } from 'lucide-react';
import { EventBus } from '../utils/EventBus';

const MobileControlsComponent: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
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
    <div className="absolute inset-x-0 bottom-0 px-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex justify-between items-end pointer-events-none z-30 select-none touch-none">
      {/* Virtual Joystick (Bottom Left, Semi-Transparent, High-Forward Visibility) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        onTouchCancel={handleJoystickTouchEnd}
        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-red-500/35 bg-black/40 backdrop-blur-[2px] relative flex items-center justify-center pointer-events-auto touch-none shadow-[0_0_15px_rgba(255,0,51,0.15)] transition-all"
      >
        {/* Outer Ring Accent */}
        <div className="absolute inset-1.5 rounded-full border border-dashed border-red-500/20" />

        {/* Joystick Knob */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border transition-transform ${
            isDragging
              ? 'bg-red-600/80 border-rose-300 shadow-[0_0_20px_rgba(255,0,51,0.8)] scale-105'
              : 'bg-red-950/40 border-red-500/50'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Right Combat Controls: Primary Fire Button */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto touch-none">
        {/* Touch Fire Button (Bottom Right) */}
        <button
          onTouchStart={handleShootStart}
          onTouchEnd={handleShootEnd}
          onTouchCancel={handleShootEnd}
          onMouseDown={handleShootStart}
          onMouseUp={handleShootEnd}
          className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full border-2 flex flex-col items-center justify-center pointer-events-auto touch-none transition-all ${
            isShooting
              ? 'bg-red-600/80 border-rose-300 scale-95 shadow-[0_0_30px_rgba(255,0,51,0.9)]'
              : 'bg-black/50 border-red-500/60 backdrop-blur-[2px] shadow-[0_0_18px_rgba(255,0,51,0.25)] active:scale-95'
          }`}
          title="Fire Primary Weapons"
        >
          <Crosshair className="w-6 h-6 sm:w-7 sm:h-7 text-rose-300" />
          <span className="text-[9px] sm:text-[10px] font-black font-['Orbitron'] tracking-wider text-rose-100 mt-0.5">
            FIRE
          </span>
        </button>
      </div>
    </div>
  );
};

export const MobileControls = React.memo(MobileControlsComponent);

