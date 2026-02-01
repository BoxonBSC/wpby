import { useState, useEffect, useCallback } from 'react';
import { HiLoResult } from '@/config/hilo';

const STORAGE_KEY_PREFIX = 'cyberhilo_history_';

/**
 * 持久化存储 HiLo 游戏记录
 * 按钱包地址分别保存，支持跨会话保留
 */
export function useHiLoHistory(walletAddress: string | null) {
  const [results, setResults] = useState<HiLoResult[]>([]);

  // 获取当前钱包的存储 key
  const getStorageKey = useCallback(() => {
    if (!walletAddress) return null;
    return `${STORAGE_KEY_PREFIX}${walletAddress.toLowerCase()}`;
  }, [walletAddress]);

  // 从 localStorage 加载历史记录
  useEffect(() => {
    const key = getStorageKey();
    if (!key) {
      setResults([]);
      return;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as HiLoResult[];
        // 验证数据格式
        if (Array.isArray(parsed)) {
          setResults(parsed);
        }
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error('Failed to load HiLo history:', e);
      setResults([]);
    }
  }, [getStorageKey]);

  // 保存到 localStorage
  const saveResults = useCallback((newResults: HiLoResult[]) => {
    const key = getStorageKey();
    if (!key) return;

    try {
      // 只保留最近 100 条记录
      const trimmed = newResults.slice(0, 100);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save HiLo history:', e);
    }
  }, [getStorageKey]);

  // 添加新记录
  const addResult = useCallback((result: HiLoResult) => {
    setResults(prev => {
      const updated = [result, ...prev];
      saveResults(updated);
      return updated;
    });
  }, [saveResults]);

  // 清空记录
  const clearResults = useCallback(() => {
    const key = getStorageKey();
    if (key) {
      localStorage.removeItem(key);
    }
    setResults([]);
  }, [getStorageKey]);

  return {
    results,
    addResult,
    clearResults,
  };
}
