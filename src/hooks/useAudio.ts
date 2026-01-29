import { useRef, useCallback, useState, useEffect } from 'react';

// 音频上下文单例
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState(false);
  
  const bgMusicOscillators = useRef<OscillatorNode[]>([]);
  const bgMusicGain = useRef<GainNode | null>(null);

  // 播放单个音调
  const playTone = useCallback((
    frequency: number, 
    duration: number, 
    type: OscillatorType = 'sine',
    delay: number = 0,
    volumeMultiplier: number = 1
  ) => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume * volumeMultiplier, ctx.currentTime + delay + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  }, [isMuted, volume]);

  // 转轮滚动音效 - 持续的电子滴答声
  const playSpinSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    let tickCount = 0;
    const maxTicks = 50;
    
    const playTick = () => {
      if (tickCount >= maxTicks) return;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      // 随着时间推移，频率降低，间隔增加
      const progress = tickCount / maxTicks;
      const frequency = 800 - progress * 400;
      const interval = 30 + progress * 70;
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.005);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.03);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
      
      tickCount++;
      setTimeout(playTick, interval);
    };
    
    playTick();
  }, [isMuted, volume]);

  // 轮子停止音效
  const playReelStopSound = useCallback((reelIndex: number) => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const baseFreq = 200 + reelIndex * 50;
    
    // 停止时的"咔哒"声
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
    
    // 添加金属撞击声
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(150, ctx.currentTime);
    
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    
    noiseGain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.05);
  }, [isMuted, volume]);

  // 小奖音效 - 欢快的升调
  const playSmallWinSound = useCallback(() => {
    if (isMuted) return;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      playTone(freq, 0.15, 'sine', i * 0.1, 0.4);
      playTone(freq * 1.5, 0.1, 'triangle', i * 0.1, 0.2);
    });
  }, [isMuted, playTone]);

  // 二等奖音效 - 更丰富的和弦
  const playMediumWinSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 主旋律
    const melody = [523.25, 659.25, 783.99, 880, 1046.50, 1318.51];
    melody.forEach((freq, i) => {
      playTone(freq, 0.2, 'sine', i * 0.08, 0.5);
      playTone(freq * 0.5, 0.25, 'triangle', i * 0.08, 0.3);
    });
    
    // 添加闪烁效果音
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
        
        gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }, i * 80);
    }
  }, [isMuted, volume, playTone]);

  // 头奖音效 - 史诗级庆祝
  const playJackpotSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 史诗开场
    const fanfare = [
      { freq: 261.63, delay: 0 },     // C4
      { freq: 329.63, delay: 0.1 },   // E4
      { freq: 392.00, delay: 0.2 },   // G4
      { freq: 523.25, delay: 0.3 },   // C5
      { freq: 659.25, delay: 0.5 },   // E5
      { freq: 783.99, delay: 0.6 },   // G5
      { freq: 1046.50, delay: 0.8 },  // C6
    ];
    
    fanfare.forEach(({ freq, delay }) => {
      playTone(freq, 0.4, 'sine', delay, 0.6);
      playTone(freq * 0.5, 0.5, 'triangle', delay, 0.3);
      playTone(freq * 2, 0.2, 'sine', delay, 0.2);
    });
    
    // 持续的胜利音效
    setTimeout(() => {
      for (let i = 0; i < 20; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sine';
        const baseFreq = 800 + Math.sin(i * 0.5) * 400;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(baseFreq + 200, ctx.currentTime + 0.1);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, ctx.currentTime);
        filter.Q.setValueAtTime(5, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.02);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        setTimeout(() => {
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }, i * 100);
      }
    }, 1000);
    
    // 金币掉落音效
    setTimeout(() => {
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle';
          const freq = 2000 + Math.random() * 2000;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.1);
          
          gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        }, i * 50 + Math.random() * 30);
      }
    }, 1200);
  }, [isMuted, volume, playTone]);

  // 按钮点击音效
  const playClickSound = useCallback(() => {
    if (isMuted) return;
    
    playTone(800, 0.05, 'square', 0, 0.2);
    playTone(1200, 0.03, 'sine', 0.02, 0.15);
  }, [isMuted, playTone]);

  // 背景音乐 - 赛博朋克氛围
  const startBgMusic = useCallback(() => {
    if (isMuted || isBgMusicPlaying) return;
    
    const ctx = getAudioContext();
    
    // 主增益节点
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);
    bgMusicGain.current = masterGain;
    
    // 低频贝斯循环
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();
    
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(55, ctx.currentTime); // A1
    
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(200, ctx.currentTime);
    
    bassGain.gain.setValueAtTime(0.4, ctx.currentTime);
    
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterGain);
    bassOsc.start();
    bgMusicOscillators.current.push(bassOsc);
    
    // 贝斯音符变化
    const bassNotes = [55, 55, 73.42, 55, 82.41, 55, 73.42, 55];
    let bassIndex = 0;
    const bassInterval = setInterval(() => {
      if (!isBgMusicPlaying) {
        clearInterval(bassInterval);
        return;
      }
      bassOsc.frequency.setValueAtTime(bassNotes[bassIndex % bassNotes.length], ctx.currentTime);
      bassIndex++;
    }, 500);
    
    // 合成垫音
    const padFreqs = [220, 277.18, 329.63]; // A3, C#4, E4
    padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // 添加轻微颤音
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(4 + i, ctx.currentTime);
      lfoGain.gain.setValueAtTime(2, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      bgMusicOscillators.current.push(lfo);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();
      bgMusicOscillators.current.push(osc);
    });
    
    // 高频琶音
    const arpNotes = [440, 554.37, 659.25, 880, 659.25, 554.37];
    let arpIndex = 0;
    const arpInterval = setInterval(() => {
      if (!isBgMusicPlaying) {
        clearInterval(arpInterval);
        return;
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(arpNotes[arpIndex % arpNotes.length], ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      
      arpIndex++;
    }, 250);
    
    setIsBgMusicPlaying(true);
  }, [isMuted, isBgMusicPlaying, volume]);

  const stopBgMusic = useCallback(() => {
    bgMusicOscillators.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // 忽略已停止的振荡器
      }
    });
    bgMusicOscillators.current = [];
    
    if (bgMusicGain.current) {
      bgMusicGain.current.disconnect();
      bgMusicGain.current = null;
    }
    
    setIsBgMusicPlaying(false);
  }, []);

  // 切换静音
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        stopBgMusic();
      }
      return !prev;
    });
  }, [stopBgMusic]);

  // 更新背景音乐音量
  useEffect(() => {
    if (bgMusicGain.current) {
      bgMusicGain.current.gain.setValueAtTime(volume * 0.15, getAudioContext().currentTime);
    }
  }, [volume]);

  // 清理
  useEffect(() => {
    return () => {
      stopBgMusic();
    };
  }, [stopBgMusic]);

  return {
    isMuted,
    volume,
    isBgMusicPlaying,
    setVolume,
    toggleMute,
    playSpinSound,
    playReelStopSound,
    playSmallWinSound,
    playMediumWinSound,
    playJackpotSound,
    playClickSound,
    startBgMusic,
    stopBgMusic,
  };
}
