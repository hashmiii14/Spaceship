import React from 'react';
import { X, Shield, Zap, Crosshair, Activity, Award, Target, Clock, AlertTriangle, Cpu } from 'lucide-react';
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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none pointer-events-auto">
      <div className="cyber-panel-military w-full max-w-3xl max-h-[90vh] flex flex-col p-6 sm:p-8 overflow-hidden border-red-500/50 shadow-[0_0_50px_rgba(255,0,51,0.35)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-red-500/30">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Orbitron'] tracking-widest text-white neon-glow-red">
              PILOT MANUAL
            </h2>
            <p className="text-xs font-mono text-red-400/80 tracking-wider">
              STARFALL COMBAT PROTOCOLS & SECTOR BRIEFING
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg border border-red-500/30 text-gray-400 hover:text-white hover:bg-red-500/20 transition-all"
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

              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3 flex flex-col items-center text-center">
                <span className="text-cyan-300 font-bold mb-2 uppercase">PRIMARY CANNONS</span>
                <span className="px-4 py-1.5 bg-cyan-950/70 border border-cyan-400/40 rounded text-cyan-300 font-bold mb-1">
                  SPACEBAR
                </span>
                <span className="text-gray-400 text-[10px]">Hold for continuous fire</span>
              </div>

              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3 flex flex-col items-center text-center">
                <span className="text-cyan-300 font-bold mb-2 uppercase">TOUCH & PAUSE</span>
                <span className="px-3 py-1 bg-cyan-950/70 border border-cyan-400/40 rounded text-cyan-300 font-bold mb-1">
                  ESC KEY
                </span>
                <span className="text-gray-400 text-[10px]">Virtual joystick on mobile</span>
              </div>
            </div>
          </div>

          {/* XP & Upgrades System */}
          <div>
            <h3 className="text-sm font-black font-mono tracking-widest text-purple-400 uppercase mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> XP & SYSTEM ENHANCEMENTS
            </h3>
            <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3 text-xs font-mono text-gray-300 space-y-1.5">
              <p>- Destroying enemies and asteroids releases purple XP Gems.</p>
              <p>- Ships feature an automatic Magnetic Harvester to vacuum nearby XP and power-ups.</p>
              <p>- Leveling up pauses combat to let you choose 1 of 3 randomized enhancements: Spread Cannon, Plasma Mortar, Hyperbeam Core, Hull Plating, or Thruster Overdrive.</p>
            </div>
          </div>

          {/* Kill Combo Multipliers */}
          <div>
            <h3 className="text-sm font-black font-mono tracking-widest text-yellow-400 uppercase mb-3 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-yellow-400" /> COMBAT KILL COMBOS
            </h3>
            <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3 text-xs font-mono text-gray-300 space-y-1.5">
              <p>- Chain rapid kills within 2.5 seconds to build your combo multiplier up to 20x score!</p>
              <p>- Higher combos trigger arcade audio fanfares and massive score boosts.</p>
            </div>
          </div>

          {/* Power-Up Arsenal */}
          <div>
            <h3 className="text-sm font-black font-mono tracking-widest text-cyan-400 uppercase mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> POWER-UP ARSENAL
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-cyan-300">SHIELD DOME</div>
                  <div className="text-[10px] text-gray-400">Recharges 100% forcefield barrier</div>
                </div>
              </div>

              <div className="bg-black/50 border border-yellow-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-yellow-300">RAPID FIRE</div>
                  <div className="text-[10px] text-gray-400">Extreme high-frequency laser barrage</div>
                </div>
              </div>

              <div className="bg-black/50 border border-pink-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Zap className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-pink-300">OVERDRIVE</div>
                  <div className="text-[10px] text-gray-400">2.5x damage booster on all attacks</div>
                </div>
              </div>

              <div className="bg-black/50 border border-indigo-400/30 rounded-lg p-2.5 flex items-start gap-2">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-indigo-300">CHRONO SHIFT</div>
                  <div className="text-[10px] text-gray-400">Slows all enemies and bullets by 50%</div>
                </div>
              </div>

              <div className="bg-black/50 border border-red-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-300">ELECTRO NUKE</div>
                  <div className="text-[10px] text-gray-400">Instantly wipes all hostiles on screen</div>
                </div>
              </div>

              <div className="bg-black/50 border border-green-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <Activity className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-green-300">HULL REPAIR</div>
                  <div className="text-[10px] text-gray-400">Restores +35 HP hull integrity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enemy Threats & Bosses */}
          <div>
            <h3 className="text-sm font-black font-mono tracking-widest text-cyan-400 uppercase mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" /> 7 SECTOR PROGRESSION & BOSSES
            </h3>
            <div className="space-y-2 text-xs font-mono text-gray-300">
              <div className="bg-black/50 border border-red-500/20 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-bold text-red-400">SECTOR 1 - 3:</span>
                <span className="text-gray-400 text-right">Scouts, Interceptors with homing dives, Heavy Tanks, and Shooters</span>
              </div>
              <div className="bg-black/50 border border-red-500/20 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-bold text-purple-400">LEVEL 4 BOSS:</span>
                <span className="text-gray-400 text-right">Void Destroyer (Heavy armor, railgun salvos)</span>
              </div>
              <div className="bg-black/50 border border-red-500/20 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-bold text-yellow-400">SECTOR 5:</span>
                <span className="text-gray-400 text-right">Bombers dropping proximity mines + Shielded Elites</span>
              </div>
              <div className="bg-black/50 border border-red-500/40 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-bold text-pink-400">LEVEL 6 & 7 BOSSES:</span>
                <span className="text-gray-400 text-right">Nebula Queen, Star Eater & Galactic Core multi-phase battles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-cyan-500/30 flex justify-end">
          <button
            onClick={handleClose}
            className="cyber-btn py-2.5 px-6 text-sm font-bold tracking-widest"
          >
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
