import React, { useState } from 'react';
import { Volume2, Music, Monitor, Palette, X, Check } from 'lucide-react';
import { Storage } from '../utils/storage';
import { MusicManager, PLAYLIST } from '../audio/MusicManager';
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
    description: 'Solar-charged prototype with blazing orange thermal shielding.',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.6)',
  },
  {
    id: 'crimson',
    name: 'CRIMSON CORSAIR',
    description: 'Pirate-modified interceptor with aggressive ruby-red hyperdrive.',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
  },
  {
    id: 'cyber',
    name: 'CYBER TITAN',
    description: 'Heavy vanguard gunship with radioactive emerald energy core.',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [musicVol, setMusicVol] = useState<number>(() => Math.round(Storage.getMusicVolume() * 100));
  const [sfxVol, setSfxVol] = useState<number>(() => Math.round(Storage.getSoundVolume() * 100));
  const [quality, setQuality] = useState<GraphicsQuality>(() => Storage.getQuality());
  const [selectedSkin, setSelectedSkin] = useState<ShipSkin>(() => Storage.getSkin());
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => MusicManager.getCurrentTrackIndex());

  const handleTrackSelect = (index: number) => {
    SoundEffects.playClick();
    setCurrentTrackIndex(index);
    MusicManager.playTrack(index);
  };

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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none pointer-events-auto">
      <div className="cyber-panel-military w-full max-w-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto border-red-500/50 shadow-[0_0_50px_rgba(255,0,51,0.35)]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-red-500/30 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black font-['Orbitron'] tracking-widest text-white neon-glow-red">
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
            <h3 className="text-xs font-mono font-bold tracking-[0.25em] text-red-400 uppercase flex items-center gap-2">
              <Music className="w-4 h-4" /> AUDIO CONFIGURATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Music Volume */}
              <div className="bg-black/60 border border-red-500/20 rounded-lg p-3">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-red-400" /> MUSIC VOLUME
                  </span>
                  <span className="text-red-400 font-bold">{musicVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVol}
                  onChange={handleMusicChange}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              {/* SFX Volume */}
              <div className="bg-black/60 border border-red-500/20 rounded-lg p-3">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-red-400" /> SFX VOLUME
                  </span>
                  <span className="text-red-400 font-bold">{sfxVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVol}
                  onChange={handleSfxChange}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Soundtrack Selector */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                SELECT SOUNDTRACK ({PLAYLIST.length} TRACKS)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {PLAYLIST.map((track, idx) => {
                  const isCurrent = currentTrackIndex === idx;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleTrackSelect(idx)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-red-950/70 border-red-500 shadow-[0_0_15px_rgba(255,0,51,0.35)]'
                          : 'bg-black/50 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex flex-col truncate">
                        <span className={`text-xs font-mono font-bold truncate ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                          {track.title}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 truncate">
                          {track.artist}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Graphics Quality */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono font-bold tracking-[0.25em] text-red-400 uppercase flex items-center gap-2">
              <Monitor className="w-4 h-4" /> GRAPHICS PRESET
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold tracking-wider transition-all ${
                    quality === q
                      ? 'bg-red-950/60 border-red-500 text-red-200 shadow-[0_0_15px_rgba(255,0,51,0.4)]'
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
            <h3 className="text-xs font-mono font-bold tracking-[0.25em] text-red-400 uppercase flex items-center gap-2">
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
                    {isSelected && <Check className="w-4 h-4 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-8 pt-4 border-t border-red-500/30 flex justify-end">
          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="cyber-btn-red py-2.5 px-6 text-sm font-bold tracking-widest"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
