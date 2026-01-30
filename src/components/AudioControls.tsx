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
        className={`
          p-2 rounded-lg transition-colors
          ${isMuted 
            ? 'bg-destructive/20 text-destructive' 
            : 'bg-muted/50 text-neon-cyan hover:bg-muted'}
        `}
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
          className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-neon-cyan
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(180_100%_50%/0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125"
          disabled={isMuted}
        />
      </div>

      {/* 背景音乐按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMusicToggle}
        disabled={isMuted}
        className={`
          p-2 rounded-lg transition-colors relative
          ${isMuted 
            ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
            : isBgMusicPlaying
              ? 'bg-neon-purple/20 text-neon-purple neon-border-purple'
              : 'bg-muted/50 text-muted-foreground hover:text-neon-purple hover:bg-muted'}
        `}
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
            className="absolute -top-1 -right-1 w-2 h-2 bg-neon-purple rounded-full"
          />
        )}
      </motion.button>
    </motion.div>
  );
}
