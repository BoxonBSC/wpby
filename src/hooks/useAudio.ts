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
  const [isWaitingSoundPlaying, setIsWaitingSoundPlaying] = useState(false);
  
  const bgMusicOscillators = useRef<OscillatorNode[]>([]);
  const bgMusicGain = useRef<GainNode | null>(null);
  const bgMusicIntervals = useRef<NodeJS.Timeout[]>([]);
  
  // 等待音效相关
  const waitingSoundRef = useRef<{
    oscillators: OscillatorNode[];
    gainNode: GainNode | null;
    intervalId: NodeJS.Timeout | null;
    isPlaying: boolean;
  }>({
    oscillators: [],
    gainNode: null,
    intervalId: null,
    isPlaying: false,
  });

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

  // ============ 扑克游戏专用音效 ============

  // 翻牌音效 - 清脆的卡牌翻转声
  const playCardFlipSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 卡牌滑动声
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(800, ctx.currentTime);
    noise.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2000, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1, ctx.currentTime);
    
    noiseGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start();
    noise.stop(ctx.currentTime + 0.1);
    
    // 落牌声
    setTimeout(() => {
      const tap = ctx.createOscillator();
      const tapGain = ctx.createGain();
      
      tap.type = 'triangle';
      tap.frequency.setValueAtTime(150, ctx.currentTime);
      tap.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);
      
      tapGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      tapGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      tap.connect(tapGain);
      tapGain.connect(ctx.destination);
      
      tap.start();
      tap.stop(ctx.currentTime + 0.08);
    }, 80);
  }, [isMuted, volume]);

  // 选择门槛音效 - 金币投入声
  const playSelectTierSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 金属碰撞声
    const notes = [1200, 1800, 2400];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
      
      gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.15);
    });
  }, [isMuted, volume]);

  // 猜对音效 - 欢快上升音
  const playCorrectGuessSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 上升音阶
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.2);
    });
    
    // 添加和声
    setTimeout(() => {
      playTone(1046.50, 0.3, 'triangle', 0, 0.2);
      playTone(1318.51, 0.3, 'triangle', 0, 0.15);
    }, 300);
  }, [isMuted, volume, playTone]);

  // 猜错音效 - 下降低沉音
  const playWrongGuessSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 下降音
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    
    gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    
    // 低沉撞击
    const bump = ctx.createOscillator();
    const bumpGain = ctx.createGain();
    
    bump.type = 'sine';
    bump.frequency.setValueAtTime(60, ctx.currentTime + 0.1);
    
    bumpGain.gain.setValueAtTime(volume * 0.5, ctx.currentTime + 0.1);
    bumpGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    bump.connect(bumpGain);
    bumpGain.connect(ctx.destination);
    
    bump.start(ctx.currentTime + 0.1);
    bump.stop(ctx.currentTime + 0.3);
  }, [isMuted, volume]);

  // 收手兑现音效 - 金币收集声
  const playCashOutSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 金币掉落
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        const freq = 2000 + Math.random() * 1500;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }, i * 60 + Math.random() * 20);
    }
    
    // 成功音
    setTimeout(() => {
      const notes = [659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        playTone(freq, 0.25, 'sine', i * 0.1, 0.35);
      });
    }, 400);
  }, [isMuted, volume, playTone]);

  // 连胜里程碑音效 - 华丽庆祝
  const playMilestoneSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 华丽和弦
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    });
    
    // 闪烁星光音效
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const sparkle = ctx.createOscillator();
        const sparkleGain = ctx.createGain();
        
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(2500 + Math.random() * 2000, ctx.currentTime);
        
        sparkleGain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
        sparkleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        
        sparkle.connect(sparkleGain);
        sparkleGain.connect(ctx.destination);
        
        sparkle.start();
        sparkle.stop(ctx.currentTime + 0.06);
      }, i * 70);
    }
  }, [isMuted, volume]);

  // 清空奖池音效 - 终极胜利
  const playJackpotSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // 史诗开场
    const fanfare = [
      { freq: 261.63, delay: 0 },
      { freq: 329.63, delay: 0.1 },
      { freq: 392.00, delay: 0.2 },
      { freq: 523.25, delay: 0.3 },
      { freq: 659.25, delay: 0.5 },
      { freq: 783.99, delay: 0.6 },
      { freq: 1046.50, delay: 0.8 },
    ];
    
    fanfare.forEach(({ freq, delay }) => {
      playTone(freq, 0.5, 'sine', delay, 0.5);
      playTone(freq * 0.5, 0.6, 'triangle', delay, 0.25);
      playTone(freq * 2, 0.25, 'sine', delay, 0.15);
    });
    
    // 大量金币
    setTimeout(() => {
      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle';
          const freq = 1800 + Math.random() * 2500;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.15);
          
          gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }, i * 40 + Math.random() * 20);
      }
    }, 1000);
  }, [isMuted, volume, playTone]);

  // 等待VRF音效 - 紧张悬念
  const startWaitingSound = useCallback(() => {
    if (isMuted || waitingSoundRef.current.isPlaying) return;
    
    const ctx = getAudioContext();
    waitingSoundRef.current.isPlaying = true;
    setIsWaitingSoundPlaying(true);
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
    masterGain.connect(ctx.destination);
    waitingSoundRef.current.gainNode = masterGain;
    
    // 心跳般的低频
    const pulseOsc = ctx.createOscillator();
    const pulseGain = ctx.createGain();
    
    pulseOsc.type = 'sine';
    pulseOsc.frequency.setValueAtTime(50, ctx.currentTime);
    pulseGain.gain.setValueAtTime(0.5, ctx.currentTime);
    
    pulseOsc.connect(pulseGain);
    pulseGain.connect(masterGain);
    pulseOsc.start();
    waitingSoundRef.current.oscillators.push(pulseOsc);
    
    // 心跳节奏
    const pulseLfo = ctx.createOscillator();
    const pulseLfoGain = ctx.createGain();
    pulseLfo.type = 'sine';
    pulseLfo.frequency.setValueAtTime(1.2, ctx.currentTime);
    pulseLfoGain.gain.setValueAtTime(0.4, ctx.currentTime);
    pulseLfo.connect(pulseLfoGain);
    pulseLfoGain.connect(pulseGain.gain);
    pulseLfo.start();
    waitingSoundRef.current.oscillators.push(pulseLfo);
    
    // 悬念滴答声
    let tickPhase = 0;
    const tickInterval = setInterval(() => {
      if (!waitingSoundRef.current.isPlaying) {
        clearInterval(tickInterval);
        return;
      }
      
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      
      tickOsc.type = 'sine';
      tickOsc.frequency.setValueAtTime(800 + (tickPhase % 2) * 200, ctx.currentTime);
      
      tickGain.gain.setValueAtTime(0, ctx.currentTime);
      tickGain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.01);
      tickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      tickOsc.connect(tickGain);
      tickGain.connect(masterGain);
      
      tickOsc.start();
      tickOsc.stop(ctx.currentTime + 0.1);
      
      tickPhase++;
    }, 300);
    
    waitingSoundRef.current.intervalId = tickInterval;
  }, [isMuted, volume]);

  // 停止等待音效
  const stopWaitingSound = useCallback(() => {
    if (!waitingSoundRef.current.isPlaying) return;
    
    waitingSoundRef.current.isPlaying = false;
    setIsWaitingSoundPlaying(false);
    
    waitingSoundRef.current.oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    waitingSoundRef.current.oscillators = [];
    
    if (waitingSoundRef.current.intervalId) {
      clearInterval(waitingSoundRef.current.intervalId);
      waitingSoundRef.current.intervalId = null;
    }
    
    if (waitingSoundRef.current.gainNode) {
      waitingSoundRef.current.gainNode.disconnect();
      waitingSoundRef.current.gainNode = null;
    }
  }, []);

  // 按钮点击音效
  const playClickSound = useCallback(() => {
    if (isMuted) return;
    playTone(600, 0.04, 'sine', 0, 0.25);
    playTone(900, 0.03, 'triangle', 0.02, 0.15);
  }, [isMuted, playTone]);

  // 背景音乐 - 优雅赌场氛围
  const startBgMusic = useCallback(() => {
    if (isMuted || isBgMusicPlaying) return;
    
    const ctx = getAudioContext();
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);
    bgMusicGain.current = masterGain;
    
    // 优雅的低音线
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();
    
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
    
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(150, ctx.currentTime);
    
    bassGain.gain.setValueAtTime(0.5, ctx.currentTime);
    
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterGain);
    bassOsc.start();
    bgMusicOscillators.current.push(bassOsc);
    
    // 低音变化
    const bassNotes = [65.41, 65.41, 87.31, 65.41, 98.00, 65.41, 87.31, 73.42]; // C2 progression
    let bassIndex = 0;
    const bassInterval = setInterval(() => {
      if (!isBgMusicPlaying) return;
      bassOsc.frequency.setValueAtTime(bassNotes[bassIndex % bassNotes.length], ctx.currentTime);
      bassIndex++;
    }, 800);
    bgMusicIntervals.current.push(bassInterval);
    
    // 温暖的和弦垫音
    const padFreqs = [261.63, 329.63, 392.00]; // C4, E4, G4 - C major
    padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // 轻微颤音
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(3 + i * 0.5, ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      bgMusicOscillators.current.push(lfo);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();
      bgMusicOscillators.current.push(osc);
    });
    
    // 优雅的琶音
    const arpNotes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25];
    let arpIndex = 0;
    const arpInterval = setInterval(() => {
      if (!isBgMusicPlaying) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(arpNotes[arpIndex % arpNotes.length], ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      
      arpIndex++;
    }, 400);
    bgMusicIntervals.current.push(arpInterval);
    
    setIsBgMusicPlaying(true);
  }, [isMuted, isBgMusicPlaying, volume]);

  const stopBgMusic = useCallback(() => {
    bgMusicOscillators.current.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    bgMusicOscillators.current = [];
    
    bgMusicIntervals.current.forEach(interval => clearInterval(interval));
    bgMusicIntervals.current = [];
    
    if (bgMusicGain.current) {
      bgMusicGain.current.disconnect();
      bgMusicGain.current = null;
    }
    
    setIsBgMusicPlaying(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        stopBgMusic();
        stopWaitingSound();
      }
      return !prev;
    });
  }, [stopBgMusic, stopWaitingSound]);

  useEffect(() => {
    if (bgMusicGain.current) {
      bgMusicGain.current.gain.setValueAtTime(volume * 0.12, getAudioContext().currentTime);
    }
    if (waitingSoundRef.current.gainNode) {
      waitingSoundRef.current.gainNode.gain.setValueAtTime(volume * 0.2, getAudioContext().currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopBgMusic();
      stopWaitingSound();
    };
  }, [stopBgMusic, stopWaitingSound]);

  return {
    isMuted,
    volume,
    isBgMusicPlaying,
    isWaitingSoundPlaying,
    setVolume,
    toggleMute,
    // 扑克游戏专用音效
    playCardFlipSound,
    playSelectTierSound,
    playCorrectGuessSound,
    playWrongGuessSound,
    playCashOutSound,
    playMilestoneSound,
    playJackpotSound,
    // 通用音效
    startWaitingSound,
    stopWaitingSound,
    playClickSound,
    startBgMusic,
    stopBgMusic,
    // 兼容旧老虎机组件的别名
    playSpinSound: startWaitingSound,
    playSmallWinSound: playCorrectGuessSound,
    playMediumWinSound: playMilestoneSound,
  };
}
