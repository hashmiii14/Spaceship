import React, { useState, useEffect, useRef } from 'react';
import {
  Crosshair,
  Navigation,
  Volume2,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { SoundEffects } from '../audio/SoundEffects';

interface IntroOverlayProps {
  onComplete: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isEngaged, setIsEngaged] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const completedRef = useRef(false);

  useEffect(() => {
    // Detect mobile touch interface accurately
    const checkDevice = () => {
      const touch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 840;
      setIsMobile(touch);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const triggerEngagement = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsEngaged(true);
    SoundEffects.playClick();

    setTimeout(() => {
      onComplete();
    }, 450);
  };

  useEffect(() => {
    // Countdown timer: 5 -> 4 -> 3 -> 2 -> 1 -> GO
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerEngagement();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Keyboard listener: Space or Enter to skip directly
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'Enter'].includes(e.code)) {
        e.preventDefault();
        triggerEngagement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      onClick={triggerEngagement}
      className="absolute inset-0 z-40 flex flex-col items-center justify-between p-4 sm:p-8 bg-black/85 backdrop-blur-md select-none pointer-events-auto cursor-pointer"
    >
      {/* Top Protocol Status Header */}
      <div className="flex flex-col items-center pt-2 sm:pt-4 text-center">
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/80 border border-red-500/60 shadow-[0_0_15px_rgba(255,0,51,0.4)]">
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-red-200 uppercase">
            FLIGHT CONTROL TELEMETRY
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-['Orbitron'] tracking-widest text-white neon-glow-red mt-2 sm:mt-3">
          MISSION BRIEFING
        </h2>
        <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-red-500 to-transparent mt-1.5" />
      </div>

      {/* Center Controls Tutorial Cards (Responsive: Mobile vs Desktop) */}
      <div className="w-full max-w-2xl my-auto">
        {isMobile ? (
          /* ========================================================= */
          /* MOBILE CONTROLS OVERVIEW                                  */
          /* ========================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Mobile Movement Card */}
            <div className="cyber-panel-military p-4 sm:p-5 flex flex-col items-center text-center border-red-500/40 bg-black/70">
              <div className="w-12 h-12 rounded-full border border-red-500/60 bg-red-950/40 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(255,0,51,0.3)]">
                <Navigation className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-xs font-mono font-bold text-red-400 tracking-widest uppercase">
                THRUST & VECTOR
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] text-white tracking-wider mt-1">
                VIRTUAL JOYSTICK
              </h3>
              <p className="text-[11px] font-mono text-gray-400 mt-2 leading-relaxed">
                Drag the virtual stick on the bottom-left corner to steer your starfighter in any direction.
              </p>
            </div>

            {/* Mobile Shooting Card */}
            <div className="cyber-panel-military p-4 sm:p-5 flex flex-col items-center text-center border-red-500/40 bg-black/70">
              <div className="w-12 h-12 rounded-full border border-red-500/60 bg-red-950/40 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(255,0,51,0.3)]">
                <Crosshair className="w-6 h-6 text-rose-300" />
              </div>
              <span className="text-xs font-mono font-bold text-red-400 tracking-widest uppercase">
                NEON WEAPONS
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] text-white tracking-wider mt-1">
                FIRE / AUTO-FIRE
              </h3>
              <p className="text-[11px] font-mono text-gray-400 mt-2 leading-relaxed">
                Tap FIRE on the bottom-right or activate AUTO-FIRE for non-stop automatic plasma barrage.
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* DESKTOP CONTROLS OVERVIEW                                 */
          /* ========================================================= */
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Desktop Movement Card */}
              <div className="cyber-panel-military p-4 sm:p-5 flex flex-col items-center text-center border-red-500/40 bg-black/70">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400 tracking-[0.2em] uppercase">
                  MANEUVERING CONTROLS
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] text-white tracking-wider mt-1 mb-3">
                  ARROW KEYS / WASD
                </h3>

                {/* Visual Keycaps */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex gap-1.5">
                    <span className="w-8 h-8 rounded border border-red-500/60 bg-red-950/40 flex items-center justify-center font-mono font-bold text-xs text-white shadow-[0_0_8px_rgba(255,0,51,0.3)]">
                      W
                    </span>
                    <span className="w-8 h-8 rounded border border-red-500/60 bg-red-950/40 flex items-center justify-center font-mono font-bold text-xs text-white shadow-[0_0_8px_rgba(255,0,51,0.3)]">
                      ↑
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-8 h-8 rounded border border-red-500/60 bg-red-950/40 flex items-center justify-center font-mono font-bold text-xs text-white">
                      A
                    </span>
                    <span className="w-8 h-8 rounded border border-red-500/60 bg-red-950/40 flex items-center justify-center font-mono font-bold text-xs text-white">
                      S
                    </span>
                    <span className="w-8 h-8 rounded border border-red-500/60 bg-red-950/40 flex items-center justify-center font-mono font-bold text-xs text-white">
                      D
                    </span>
                    <span className="w-8 h-8 rounded border border-red-500/60 bg-red-950/40 flex items-center justify-center font-mono font-bold text-xs text-white">
                      ←
                    </span>
                    <span className="w-8 h-8 rounded border border-red-500/60 bg-red-950/40 flex items-center justify-center font-mono font-bold text-xs text-white">
                      ↓
                    </span>
                    <span className="w-8 h-8 rounded border border-red-500/60 bg-red-950/40 flex items-center justify-center font-mono font-bold text-xs text-white">
                      →
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-gray-400 mt-3">
                  Full 2D agile combat flight. Roll and pitch with high inertia damping.
                </p>
              </div>

              {/* Desktop Shooting Card */}
              <div className="cyber-panel-military p-4 sm:p-5 flex flex-col items-center text-center border-red-500/40 bg-black/70">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400 tracking-[0.2em] uppercase">
                  PRIMARY WEAPON
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] text-white tracking-wider mt-1 mb-3">
                  SPACEBAR
                </h3>

                {/* Visual Spacebar Keycap */}
                <div className="my-1.5">
                  <div className="w-48 sm:w-56 h-8 rounded border border-red-500/60 bg-red-950/50 flex items-center justify-center font-mono font-bold text-xs text-white shadow-[0_0_12px_rgba(255,0,51,0.4)]">
                    [ SPACEBAR : CONTINUOUS FIRE ]
                  </div>
                </div>

                <p className="text-[11px] font-mono text-gray-400 mt-4">
                  Hold Spacebar for sustained rapid-fire energy bolts. No reloading required.
                </p>
              </div>
            </div>

            {/* Desktop Tactical Hotkeys Row */}
            <div className="cyber-panel-military px-4 py-2.5 flex items-center justify-around text-center border-red-500/30 bg-black/60 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/60 font-bold text-white">
                  M
                </span>
                <span className="text-gray-300">MUTE AUDIO</span>
              </div>
              <div className="h-4 w-px bg-red-900/50" />
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/60 font-bold text-white">
                  N
                </span>
                <span className="text-gray-300">NEXT TRACK</span>
              </div>
              <div className="h-4 w-px bg-red-900/50" />
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/60 font-bold text-white">
                  ESC
                </span>
                <span className="text-gray-300">PAUSE</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Countdown & Immediate Engagement Prompt */}
      <div className="flex flex-col items-center pb-2 sm:pb-4">
        {/* Countdown Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center transition-all ${
              isEngaged || countdown === 0
                ? 'border-emerald-400 bg-emerald-950/80 shadow-[0_0_30px_rgba(52,211,153,0.9)] scale-110'
                : 'border-red-500 bg-red-950/70 shadow-[0_0_25px_rgba(255,0,51,0.7)] animate-pulse'
            }`}
          >
            <span
              className={`font-['Orbitron'] font-black tracking-wider ${
                isEngaged || countdown === 0
                  ? 'text-sm sm:text-base text-emerald-200'
                  : 'text-2xl sm:text-3xl text-white neon-glow-red'
              }`}
            >
              {isEngaged || countdown === 0 ? 'GO!' : countdown}
            </span>
          </div>
        </div>

        {/* Skip action hint */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerEngagement();
          }}
          className="mt-3 text-xs font-mono font-bold text-red-300 hover:text-white tracking-widest uppercase flex items-center gap-1 transition-colors px-3 py-1 rounded border border-red-500/30 bg-black/50 hover:bg-red-950/60 cursor-pointer"
        >
          <span>{isMobile ? 'TAP TO ENGAGE' : 'PRESS SPACE OR CLICK TO ENGAGE'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        </button>
      </div>
    </div>
  );
};
