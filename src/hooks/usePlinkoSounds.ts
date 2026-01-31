import { useRef, useCallback, useEffect } from 'react';

// Web Audio API 音效系统
export function usePlinkoSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(false);
  const volumeRef = useRef(0.5);

  // 初始化音频上下文
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // 恢复被暂停的上下文
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // 创建主增益节点
  const createGain = useCallback((ctx: AudioContext) => {
    const gain = ctx.createGain();
    gain.gain.value = isMutedRef.current ? 0 : volumeRef.current;
    gain.connect(ctx.destination);
    return gain;
  }, []);

  // 投球音效 - 清脆的弹射声
  const playDropSound = useCallback(() => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const gain = createGain(ctx);
    gain.gain.value *= 0.4;

    // 主音调
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    // 噪声层
    const noise = ctx.createOscillator();
    noise.type = 'triangle';
    noise.frequency.setValueAtTime(1200, ctx.currentTime);
    noise.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    noise.connect(noiseGain);
    noiseGain.connect(gain);
    
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.start(ctx.currentTime);
    noise.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    noise.stop(ctx.currentTime + 0.15);
  }, [getAudioContext, createGain]);

  // 碰撞音效 - 金属撞击声（增强版）
  const playCollisionSound = useCallback((intensity: number = 0.5) => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.value = volumeRef.current * 0.6 * intensity;
    masterGain.connect(ctx.destination);

    // 金属撞击音 - 更清脆响亮
    const frequencies = [1800, 2800, 4200];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + Math.random() * 300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + 0.08);
      
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.5 / (i + 1), ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06 + i * 0.02);
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    });
  }, [getAudioContext]);

  // 落槽音效 - 根据倍率变化（增强版）
  const playSlotSound = useCallback((multiplier: number) => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    
    // 根据倍率决定音效特性
    const isBigWin = multiplier >= 10;
    const isMediumWin = multiplier >= 3;
    const baseFreq = isBigWin ? 600 : isMediumWin ? 500 : 400;
    
    masterGain.gain.value = volumeRef.current * (isBigWin ? 0.8 : isMediumWin ? 0.6 : 0.5);
    masterGain.connect(ctx.destination);

    // 主音调
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    
    if (isBigWin) {
      // 上升音效
      osc.frequency.linearRampToValueAtTime(baseFreq * 2, ctx.currentTime + 0.25);
    } else if (isMediumWin) {
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);
    } else {
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.1);
    }
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.8, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isBigWin ? 0.35 : 0.2));
    
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (isBigWin ? 0.35 : 0.2));
    
    // 添加和声
    if (isMediumWin) {
      const harmony = ctx.createOscillator();
      harmony.type = 'sine';
      harmony.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
      harmony.frequency.linearRampToValueAtTime(baseFreq * 2, ctx.currentTime + 0.2);
      
      const harmonyGain = ctx.createGain();
      harmonyGain.gain.setValueAtTime(0.3, ctx.currentTime);
      harmonyGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      harmony.connect(harmonyGain);
      harmonyGain.connect(masterGain);
      harmony.start(ctx.currentTime);
      harmony.stop(ctx.currentTime + 0.2);
    }
  }, [getAudioContext]);

  // 大奖音效 - 华丽的庆祝声
  const playWinSound = useCallback((multiplier: number) => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    
    // 和弦音符
    const notes = multiplier >= 41 
      ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // C大调和弦 + 高八度
      : [523.25, 659.25, 783.99]; // 基础和弦
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
      gain.gain.linearRampToValueAtTime(volumeRef.current * 0.3, ctx.currentTime + i * 0.05 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.5);
    });

    // 闪亮音效
    setTimeout(() => {
      if (isMutedRef.current) return;
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(2000, ctx.currentTime);
      shimmer.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.2);
      
      shimmerGain.gain.setValueAtTime(volumeRef.current * 0.15, ctx.currentTime);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      
      shimmer.start(ctx.currentTime);
      shimmer.stop(ctx.currentTime + 0.3);
    }, 200);
  }, [getAudioContext]);

  // 超级大奖音效
  const playJackpotSound = useCallback(() => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    
    // 上升扫频
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(200, ctx.currentTime);
    sweep.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.5);
    
    sweepGain.gain.setValueAtTime(volumeRef.current * 0.2, ctx.currentTime);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    
    sweep.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    
    sweep.start(ctx.currentTime);
    sweep.stop(ctx.currentTime + 0.6);
    
    // 延迟播放胜利和弦
    setTimeout(() => playWinSound(100), 400);
    
    // 额外的闪烁音效
    [0.5, 0.7, 0.9, 1.1].forEach((delay) => {
      setTimeout(() => {
        if (isMutedRef.current) return;
        const ping = ctx.createOscillator();
        const pingGain = ctx.createGain();
        
        ping.type = 'sine';
        ping.frequency.setValueAtTime(3000 + Math.random() * 1000, ctx.currentTime);
        
        pingGain.gain.setValueAtTime(volumeRef.current * 0.1, ctx.currentTime);
        pingGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        
        ping.connect(pingGain);
        pingGain.connect(ctx.destination);
        
        ping.start(ctx.currentTime);
        ping.stop(ctx.currentTime + 0.1);
      }, delay * 1000);
    });
  }, [getAudioContext, playWinSound]);

  // 按钮点击音效
  const playClickSound = useCallback(() => {
    if (isMutedRef.current) return;
    
    const ctx = getAudioContext();
    const gain = createGain(ctx);
    gain.gain.value *= 0.2;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, [getAudioContext, createGain]);

  // 音量控制
  const setVolume = useCallback((vol: number) => {
    volumeRef.current = Math.max(0, Math.min(1, vol));
  }, []);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    return isMutedRef.current;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playDropSound,
    playCollisionSound,
    playSlotSound,
    playWinSound,
    playJackpotSound,
    playClickSound,
    setVolume,
    toggleMute,
    setMuted,
    isMuted: () => isMutedRef.current,
    getVolume: () => volumeRef.current,
  };
}
