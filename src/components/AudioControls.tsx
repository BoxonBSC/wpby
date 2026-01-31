import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function AudioControls() {
  const { 
    isMuted, 
    volume, 
    isBgMusicPlaying,
    setVolume, 
    toggleMute,
    startBgMusic,
    stopBgMusic,
    playClickSound,
  } = useAudioContext();
  const { t } = useLanguage();

  const handleMuteClick = () => {
    playClickSound();
    toggleMute();
  };

  const handleMusicToggle = () => {
    playClickSound();
    if (isBgMusicPlaying) {
      stopBgMusic();
    } else {
      startBgMusic();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      {/* 静音按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMuteClick}
        className="p-2 rounded-lg transition-all duration-300"
        style={{
          background: isMuted 
            ? 'rgba(220, 38, 38, 0.2)' 
            : 'rgba(201, 163, 71, 0.1)',
          border: `1px solid ${isMuted ? 'rgba(220, 38, 38, 0.4)' : 'rgba(201, 163, 71, 0.3)'}`,
          color: isMuted ? '#dc2626' : '#C9A347',
        }}
        title={isMuted ? t('audio.unmute') : t('audio.mute')}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </motion.button>

      {/* 音量滑块 */}
      <div className="relative group">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #C9A347 0%, #C9A347 ${volume * 100}%, rgba(201, 163, 71, 0.2) ${volume * 100}%, rgba(201, 163, 71, 0.2) 100%)`,
          }}
          disabled={isMuted}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: linear-gradient(135deg, #FFD700 0%, #C9A347 100%);
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
            cursor: pointer;
            transition: transform 0.2s;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
        `}</style>
      </div>

      {/* 背景音乐按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMusicToggle}
        disabled={isMuted}
        className="p-2 rounded-lg transition-all duration-300 relative"
        style={{
          background: isMuted 
            ? 'rgba(201, 163, 71, 0.05)' 
            : isBgMusicPlaying
              ? 'rgba(255, 215, 0, 0.15)'
              : 'rgba(201, 163, 71, 0.1)',
          border: `1px solid ${isMuted ? 'rgba(201, 163, 71, 0.1)' : isBgMusicPlaying ? 'rgba(255, 215, 0, 0.5)' : 'rgba(201, 163, 71, 0.3)'}`,
          color: isMuted ? 'rgba(201, 163, 71, 0.3)' : isBgMusicPlaying ? '#FFD700' : '#C9A347',
          boxShadow: isBgMusicPlaying ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none',
          cursor: isMuted ? 'not-allowed' : 'pointer',
        }}
        title={isBgMusicPlaying ? t('audio.bgMusicOff') : t('audio.bgMusicOn')}
      >
        {isBgMusicPlaying ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Music2 className="w-5 h-5" />
          </motion.div>
        ) : (
          <Music className="w-5 h-5" />
        )}
        
        {/* 音乐播放指示器 */}
        {isBgMusicPlaying && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: '#FFD700', boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)' }}
          />
        )}
      </motion.button>
    </motion.div>
  );
}
