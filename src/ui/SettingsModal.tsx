import React, { useState } from 'react';
import { Volume2, Music, Monitor, Palette, X, Check } from 'lucide-react';
import { Storage } from '../utils/storage';
import { MusicManager } from '../audio/MusicManager';
import { SoundEffects } from '../audio/SoundEffects';
import { GraphicsQuality, ShipSkin } from '../types/game';
import { EventBus } from '../utils/EventBus';

interface SettingsModalProps {
  onClose: () => void;
}

const SHIP_SKINS: ShipSkin[] = [
  {
    id: 'neon',
    name: 'NEON PROTOCOL',
    description: 'Standard elite starfighter with high-coherence cyan plasma conduits.',
    color: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.6)',
  },
  {
    id: 'void',
    name: 'VOID PHANTOM',
    description: 'Black carbon-stealth hull coated in dark-matter purple radiation.',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
  },
  {
    id: 'solar',
    name: 'SOLAR FLARE',
    description: 'Titanium-gold plated hull forged near energetic stellar cores.',
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.6)',
  },
  {
    id: 'crimson',
    name: 'CRIMSON BERSERKER',
    description: 'Aggressive reinforced warframe designed for intense vanguard combat.',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.6)',
  },
  {
    id: 'cyber',
    name: 'CYBER MATRIX',
    description: 'Experimental emerald quantum-core vessel built for neural overclocking.',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [musicVol, setMusicVol] = useState<number>(() => Math.round(Storage.getMusicVolume() * 100));
  const [sfxVol, setSfxVol] = useState<number>(() => Math.round(Storage.getSoundVolume() * 100));
  const [quality, setQuality] = useState<GraphicsQuality>(() => Storage.getQuality());
  const [selectedSkin, setSelectedSkin] = useState<ShipSkin>(() => Storage.getSkin());

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setMusicVol(val);
    const normalized = val / 100;
    MusicManager.setMusicVolume(normalized);
    Storage.setMusicVolume(normalized);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSfxVol(val);
    const normalized = val / 100;
    SoundEffects.setVolume(normalized);
    Storage.setSoundVolume(normalized);
  };

  const handleQualityChange = (q: GraphicsQuality) => {
    SoundEffects.playClick();
    setQuality(q);
    Storage.setQuality(q);
  };

  const handleSkinSelect = (skin: ShipSkin) => {
    SoundEffects.playClick();
    setSelectedSkin(skin);
    Storage.setSkin(skin);
    EventBus.emit('player:skinChanged', skin.id);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none pointer-events-auto">
      <div className="cyber-panel w-full max-w-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-cyan-500/30 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black font-['Orbitron'] tracking-widest text-cyan-300 neon-glow-cyan">
              SYSTEM SETTINGS
            </h2>
          </div>
          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="flex flex-col gap-6">
          {/* Audio Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase flex items-center gap-2">
              <Music className="w-4 h-4" /> AUDIO CONFIGURATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Music Volume */}
              <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-3">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-cyan-400" /> MUSIC VOLUME
                  </span>
                  <span className="text-cyan-400 font-bold">{musicVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVol}
                  onChange={handleMusicChange}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* SFX Volume */}
              <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-3">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> SFX VOLUME
                  </span>
                  <span className="text-cyan-400 font-bold">{sfxVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVol}
                  onChange={handleSfxChange}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Graphics Quality */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase flex items-center gap-2">
              <Monitor className="w-4 h-4" /> GRAPHICS PRESET
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold tracking-wider transition-all ${
                    quality === q
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'bg-black/40 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Ship Skins */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase flex items-center gap-2">
              <Palette className="w-4 h-4" /> VESSEL HULL SKINS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SHIP_SKINS.map((skin) => {
                const isSelected = selectedSkin.id === skin.id;
                return (
                  <button
                    key={skin.id}
                    onClick={() => handleSkinSelect(skin)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all bg-black/60 ${
                      isSelected
                        ? 'border-2 shadow-[0_0_20px_var(--glow)]'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                    style={
                      {
                        borderColor: isSelected ? skin.color : undefined,
                        '--glow': skin.glowColor,
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: skin.color, boxShadow: `0 0 10px ${skin.color}` }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold font-mono text-white tracking-wider">
                          {skin.name}
                        </span>
                        <span className="text-[10px] font-sans text-gray-400 line-clamp-1">
                          {skin.description}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-8 pt-4 border-t border-cyan-500/30 flex justify-end">
          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="cyber-btn py-2.5 px-6 text-sm font-bold tracking-widest"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
