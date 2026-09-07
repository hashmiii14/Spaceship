import React, { useState, useRef, useEffect } from 'react';
import { Crosshair } from 'lucide-react';
import { EventBus } from '../utils/EventBus';

export const MobileControls: React.FC = () => {
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
    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 flex justify-between items-end pointer-events-none z-30 select-none">
      {/* Virtual Joystick (Bottom Left) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        onTouchCancel={handleJoystickTouchEnd}
        className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-cyan-500/40 bg-black/40 backdrop-blur-sm relative flex items-center justify-center pointer-events-auto touch-none shadow-[0_0_20px_rgba(0,240,255,0.15)]"
      >
        {/* Outer Ring Accent */}
        <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/20" />

        {/* Joystick Knob */}
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 transition-transform ${
            isDragging
              ? 'bg-cyan-500/60 border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.8)]'
              : 'bg-cyan-500/30 border-cyan-400'
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
            ? 'bg-pink-500/60 border-pink-300 scale-95 shadow-[0_0_30px_rgba(255,0,85,0.9)]'
            : 'bg-pink-600/30 border-pink-500/70 shadow-[0_0_20px_rgba(255,0,85,0.3)] active:scale-95'
        }`}
      >
        <Crosshair className="w-8 h-8 text-pink-300 animate-pulse" />
        <span className="text-[10px] sm:text-xs font-black font-['Orbitron'] tracking-wider text-pink-200 mt-0.5">
          FIRE
        </span>
      </button>
    </div>
  );
};
