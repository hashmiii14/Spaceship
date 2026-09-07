import React from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Zap, Flame, Crosshair, Heart, Award, Skull, Target } from 'lucide-react';
import { SoundEffects } from '../audio/SoundEffects';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const handleClose = () => {
    SoundEffects.playClick();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none pointer-events-auto">
      <div className="cyber-panel w-full max-w-2xl max-h-[90vh] flex flex-col p-6 sm:p-8 overflow-hidden border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Orbitron'] tracking-widest text-cyan-300 neon-glow-cyan">
              PILOT MANUAL
            </h2>
            <p className="text-xs font-mono text-cyan-400/80 tracking-wider">
              TACTICAL COMBAT & FLIGHT PROTOCOLS
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg border border-cyan-500/30 text-gray-400 hover:text-white hover:bg-cyan-500/20 transition-all"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
          {/* Controls Section */}
          <div>
            <h3 className="text-sm font-black font-mono tracking-widest text-cyan-400 uppercase mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> FLIGHT CONTROLS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              {/* Movement */}
              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3 flex flex-col items-center text-center">
                <span className="text-cyan-300 font-bold mb-2 uppercase">NAVIGATION</span>
                <div className="flex gap-1 mb-1">
                  <span className="px-2 py-1 bg-cyan-950/70 border border-cyan-400/40 rounded text-cyan-300 font-bold">W</span>
                  <span className="px-2 py-1 bg-cyan-950/70 border border-cyan-400/40 rounded text-cyan-300 font-bold">A</span>
                  <span className="px-2 py-1 bg-cyan-950/70 border border-cyan-400/40 rounded text-cyan-300 font-bold">S</span>
                  <span className="px-2 py-1 bg-cyan-950/70 border border-cyan-400/40 rounded text-cyan-300 font-bold">D</span>
                </div>
                <span className="text-gray-400 text-[10px]">or Arrow Keys</span>
              </div>

              {/* Fire */}
              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3 flex flex-col items-center text-center">
                <span className="text-cyan-300 font-bold mb-2 uppercase">FIRE WEAPONS</span>
                <span className="px-4 py-1.5 bg-cyan-950/70 border border-cyan-400/40 rounded text-cyan-300 font-bold mb-1">
                  SPACEBAR
                </span>
                <span className="text-gray-400 text-[10px]">Hold for continuous fire</span>
              </div>

              {/* Pause / Mobile */}
              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3 flex flex-col items-center text-center">
                <span className="text-cyan-300 font-bold mb-2 uppercase">PAUSE & TOUCH</span>
                <span className="px-3 py-1 bg-cyan-950/70 border border-cyan-400/40 rounded text-cyan-300 font-bold mb-1">
                  ESC KEY
                </span>
                <span className="text-gray-400 text-[10px]">Virtual joystick on mobile</span>
              </div>
            </div>
          </div>

          {/* Tactical Power-Ups */}
          <div>
            <h3 className="text-sm font-black font-mono tracking-widest text-cyan-400 uppercase mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> POWER-UP ARSENAL
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-cyan-300">SHIELD DOME</div>
                  <div className="text-[10px] text-gray-400">Absorbs 3 direct hits before hull damage</div>
                </div>
              </div>

              <div className="bg-black/50 border border-yellow-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-yellow-300">RAPID FIRE</div>
                  <div className="text-[10px] text-gray-400">Quadruples laser cannon fire rate</div>
                </div>
              </div>

              <div className="bg-black/50 border border-pink-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Flame className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-pink-300">OVERCHARGE</div>
                  <div className="text-[10px] text-gray-400">Heavy piercing plasma dealing 3x damage</div>
                </div>
              </div>

              <div className="bg-black/50 border border-orange-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Crosshair className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-orange-300">TRIPLE SPREAD</div>
                  <div className="text-[10px] text-gray-400">3-way multi-directional fan lasers</div>
                </div>
              </div>

              <div className="bg-black/50 border border-green-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Heart className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-green-300">HULL REPAIR</div>
                  <div className="text-[10px] text-gray-400">Instantly restores +35 ship health</div>
                </div>
              </div>

              <div className="bg-black/50 border border-purple-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-300">2X SCORE BOOST</div>
                  <div className="text-[10px] text-gray-400">Doubles all combat bounty points</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enemy Threats & Bosses */}
          <div>
            <h3 className="text-sm font-black font-mono tracking-widest text-cyan-400 uppercase mb-3 flex items-center gap-2">
              <Skull className="w-4 h-4" /> HOSTILE INTELLIGENCE
            </h3>
            <div className="space-y-2 text-xs font-mono text-gray-300">
              <div className="bg-black/50 border border-red-500/20 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-bold text-red-400">SCOUT & STRIKER FIGHTERS:</span>
                <span className="text-gray-400 text-right">Agile attack ships with sine and evasive zig-zag routes</span>
              </div>
              <div className="bg-black/50 border border-red-500/20 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-bold text-purple-400">CRUISERS & GUNSHIPS:</span>
                <span className="text-gray-400 text-right">Armored warships with tracking cannons and plasma volleys</span>
              </div>
              <div className="bg-black/50 border border-red-500/20 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-bold text-yellow-400">ASTEROID FIELDS:</span>
                <span className="text-gray-400 text-right">Large asteroids split into medium & small chunks on impact</span>
              </div>
              <div className="bg-black/50 border border-red-500/40 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-bold text-pink-400">OMEGA MOTHERSHIP (BOSS):</span>
                <span className="text-gray-400 text-right">Appears every 6 waves. 2 combat phases with rage overdrive!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-cyan-500/30 flex justify-end">
          <button
            onClick={handleClose}
            className="cyber-btn py-2.5 px-6 text-sm"
          >
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
