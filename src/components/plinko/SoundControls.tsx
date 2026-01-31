import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

interface SoundControlsProps {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
}

export function SoundControls({ isMuted, volume, onToggleMute, onVolumeChange }: SoundControlsProps) {
  const [showSlider, setShowSlider] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleMute}
        className="p-2 rounded-lg transition-all"
        style={{
          background: 'rgba(201, 163, 71, 0.1)',
          border: '1px solid rgba(201, 163, 71, 0.3)',
          color: isMuted ? '#666' : '#C9A347',
        }}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </motion.button>

      {/* 音量滑块 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: showSlider ? 1 : 0, y: showSlider ? 0 : 10 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg pointer-events-none"
        style={{
          background: 'rgba(15, 12, 8, 0.95)',
          border: '1px solid rgba(201, 163, 71, 0.3)',
          pointerEvents: showSlider ? 'auto' : 'none',
        }}
      >
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="w-24 h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #C9A347 0%, #C9A347 ${volume * 100}%, #333 ${volume * 100}%, #333 100%)`,
          }}
        />
        <div className="text-center text-xs text-[#C9A347]/60 mt-1">
          {Math.round(volume * 100)}%
        </div>
      </motion.div>
    </div>
  );
}
