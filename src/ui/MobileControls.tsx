import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crosshair, Zap } from 'lucide-react';
import { EventBus } from '../utils/EventBus';
import { Storage } from '../utils/storage';
import { SoundEffects } from '../audio/SoundEffects';

const MobileControlsComponent: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const fireButtonRef = useRef<HTMLButtonElement>(null);
  const moveVectorRef = useRef({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [isAutoFire, setIsAutoFire] = useState<boolean>(() => Storage.getAutoFire());

  // Independent pointer tracking for true Android multi-touch reliability
  const joystickPointerIdRef = useRef<number | null>(null);
  const firePointerIdRef = useRef<number | null>(null);

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

  // Sync external Auto Fire state changes (e.g. keyboard toggle on desktop or scene reset)
  useEffect(() => {
    const handleAutoFireChanged = (enabled: boolean) => {
      setIsAutoFire(enabled);
    };
    EventBus.on('input:autoFireChanged', handleAutoFireChanged);
    return () => {
      EventBus.off('input:autoFireChanged', handleAutoFireChanged);
    };
  }, []);

  // Safe global reset on window blur or unmount
  useEffect(() => {
    const resetAllInputs = () => {
      joystickPointerIdRef.current = null;
      firePointerIdRef.current = null;
      setIsDragging(false);
      setIsShooting(false);
      if (knobRef.current) {
        knobRef.current.style.transform = 'translate3d(0px, 0px, 0)';
      }
      moveVectorRef.current.x = 0;
      moveVectorRef.current.y = 0;
      EventBus.emit('input:mobileMove', moveVectorRef.current);
      EventBus.emit('input:mobileShoot', false);
    };

    window.addEventListener('blur', resetAllInputs);
    return () => {
      window.removeEventListener('blur', resetAllInputs);
      resetAllInputs();
    };
  }, []);

  // Joystick Math & Vector Normalization
  const updateJoystick = useCallback((clientX: number, clientY: number) => {
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

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    if (knobRef.current) {
      knobRef.current.style.transform = `translate3d(${kx}px, ${ky}px, 0)`;
    }

    const nx = kx / maxRadius;
    const ny = ky / maxRadius;

    moveVectorRef.current.x = nx;
    moveVectorRef.current.y = ny;
    EventBus.emit('input:mobileMove', moveVectorRef.current);
  }, []);

  // ============================================================
  // JOYSTICK POINTER HANDLERS (Independent joystickPointerIdRef)
  // ============================================================
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Accept only the first pointer on the joystick
    if (joystickPointerIdRef.current !== null) return;

    joystickPointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    setIsDragging(true);
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== joystickPointerIdRef.current) return;
    e.preventDefault();
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== joystickPointerIdRef.current) return;
    e.preventDefault();

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    joystickPointerIdRef.current = null;
    setIsDragging(false);
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
    moveVectorRef.current.x = 0;
    moveVectorRef.current.y = 0;
    EventBus.emit('input:mobileMove', moveVectorRef.current);
  };

  // ============================================================
  // MANUAL FIRE POINTER HANDLERS (Independent firePointerIdRef)
  // ============================================================
  const handleFirePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (firePointerIdRef.current !== null) return;

    firePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    setIsShooting(true);
    EventBus.emit('input:mobileShoot', true);
  };

  const handleFirePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerId !== firePointerIdRef.current) return;
    e.preventDefault();

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    firePointerIdRef.current = null;
    setIsShooting(false);
    EventBus.emit('input:mobileShoot', false);
  };

  // ============================================================
  // AUTO FIRE TOGGLE HANDLER (Independent tap, doesn't lock pointer)
  // ============================================================
  const handleToggleAutoFire = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    SoundEffects.playClick();
    const next = !isAutoFire;
    setIsAutoFire(next);
    Storage.setAutoFire(next);
    EventBus.emit('input:setAutoFire', next);
  };

  if (!isTouchDevice) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 px-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex justify-between items-end pointer-events-none z-30 select-none touch-none">
      {/* Virtual Joystick (Bottom Left, Semi-Transparent, High-Forward Visibility) */}
      <div
        ref={joystickBaseRef}
        onPointerDown={handleJoystickPointerDown}
        onPointerMove={handleJoystickPointerMove}
        onPointerUp={handleJoystickPointerUp}
        onPointerCancel={handleJoystickPointerUp}
        onLostPointerCapture={handleJoystickPointerUp}
        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-red-500/35 bg-black/75 relative flex items-center justify-center pointer-events-auto touch-none shadow-[0_0_15px_rgba(255,0,51,0.15)] transition-all cursor-crosshair"
      >
        {/* Outer Ring Accent */}
        <div className="absolute inset-1.5 rounded-full border border-dashed border-red-500/20 pointer-events-none" />

        {/* Center Guide Cross */}
        <div className="absolute w-2 h-0.5 bg-red-500/30 pointer-events-none" />
        <div className="absolute w-0.5 h-2 bg-red-500/30 pointer-events-none" />

        {/* Joystick Knob */}
        <div
          ref={knobRef}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border transition-transform pointer-events-none ${
            isDragging
              ? 'bg-red-600/80 border-rose-300 shadow-[0_0_20px_rgba(255,0,51,0.8)] scale-105'
              : 'bg-red-950/40 border-red-500/50'
          }`}
          style={{
            transform: 'translate3d(0px, 0px, 0)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Right Combat Controls: Auto Fire Toggle + Primary Fire Button */}
      <div className="flex flex-col items-end gap-2.5 pointer-events-auto touch-none">
        {/* Auto Fire Toggle Pill (Above Fire Button for Comfortable Thumb Reach) */}
        <button
          type="button"
          onPointerDown={handleToggleAutoFire}
          className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 pointer-events-auto touch-none transition-all active:scale-95 shadow-md cursor-pointer ${
            isAutoFire
              ? 'bg-red-950/80 border-rose-400 text-rose-100 shadow-[0_0_18px_rgba(255,0,51,0.5)]'
              : 'bg-black/70 border-red-500/40 text-gray-400 hover:text-white hover:border-red-400/60'
          }`}
          title="Toggle Auto Fire Mode"
        >
          <Zap className={`w-3.5 h-3.5 ${isAutoFire ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`} />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-black font-['Orbitron'] tracking-wider">
              AUTO FIRE
            </span>
            <span
              className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                isAutoFire
                  ? 'bg-red-600/60 border-rose-300 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-400'
              }`}
            >
              {isAutoFire ? 'ON' : 'OFF'}
            </span>
          </div>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAutoFire ? 'bg-rose-400 shadow-[0_0_8px_#ff0055] animate-ping' : 'bg-gray-600'
            }`}
          />
        </button>

        {/* Touch Fire Button (Bottom Right) */}
        <button
          ref={fireButtonRef}
          type="button"
          onPointerDown={handleFirePointerDown}
          onPointerUp={handleFirePointerUp}
          onPointerCancel={handleFirePointerUp}
          onLostPointerCapture={handleFirePointerUp}
          className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full border-2 flex flex-col items-center justify-center pointer-events-auto touch-none transition-all relative cursor-pointer ${
            isShooting
              ? 'bg-red-600/80 border-rose-300 scale-95 shadow-[0_0_32px_rgba(255,0,51,0.95)]'
              : isAutoFire
              ? 'bg-red-950/80 border-rose-500/70 shadow-[0_0_20px_rgba(255,0,51,0.35)]'
              : 'bg-black/75 border-red-500/60 shadow-[0_0_18px_rgba(255,0,51,0.25)] active:scale-95'
          }`}
          title="Fire Primary Weapons (or Auto-Fire active)"
        >
          {/* Subtle Rotating Accent Ring when Auto Fire is Active */}
          {isAutoFire && (
            <div className="absolute inset-1 rounded-full border border-dashed border-rose-400/40 pointer-events-none animate-spin" />
          )}

          <Crosshair
            className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
              isShooting ? 'text-white' : isAutoFire ? 'text-rose-300' : 'text-rose-400'
            }`}
          />
          <span className="text-[9px] sm:text-[10px] font-black font-['Orbitron'] tracking-wider text-rose-100 mt-0.5">
            {isShooting ? 'FIRING' : isAutoFire ? 'AUTO' : 'FIRE'}
          </span>
        </button>
      </div>
    </div>
  );
};

export const MobileControls = React.memo(MobileControlsComponent);

