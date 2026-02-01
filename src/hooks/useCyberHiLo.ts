import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract, BrowserProvider, formatEther, parseUnits, JsonRpcProvider } from 'ethers';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useWallet } from '@/contexts/WalletContext';
import { 
  CYBER_HILO_ADDRESS, 
  CYBER_TOKEN_ADDRESS,
  CYBER_HILO_ABI, 
  CYBER_TOKEN_ABI,
  HILO_REWARD_PERCENTAGES,
} from '@/config/contracts';

// ============ 类型定义 ============

export interface HiLoPlayerStats {
  totalGames: bigint;
  totalWins: bigint;
  totalWinnings: bigint;
  totalBet: bigint;
  maxStreak: bigint;
}

export interface HiLoGameSession {
  player: string;
  betAmount: bigint;
  betTierIndex: number;
  currentCard: number;
  currentStreak: number;
  prizePoolSnapshot: bigint;
  timestamp: bigint;
  active: boolean;
}

export interface HiLoContractState {
  prizePool: string;
  availablePool: string;  // 可用余额（未被锁定的部分）
  totalGames: bigint;
  totalPaidOut: string;
  totalBurned: string;
  playerStats: HiLoPlayerStats | null;
  gameSession: HiLoGameSession | null;
  tokenBalance: string;
  tokenAllowance: string;
  gameCredits: string;
  pendingRequest: bigint;
  unclaimedPrize: string;
  isLoading: boolean;
  error: string | null;
}

export interface GuessResultEvent {
  player: string;
  requestId: bigint;
  oldCard: number;
  newCard: number;
  won: boolean;
  streak: number;
  potentialReward: bigint;
  timestamp: number;
  txHash?: string;
}

export interface VRFWaitingState {
  isWaiting: boolean;
  requestId: bigint;
  startTime: number;
  pollCount: number;
}

// 强制结算原因
export interface ForceSettledEvent {
  streak: number;
  available: string;
  needed: string;
  timestamp: number;
}

export interface UseCyberHiLoReturn extends HiLoContractState {
  startGame: (betAmount: number) => Promise<number | null>; // 返回首张牌
  guess: (guessType: 'higher' | 'lower' | 'same') => Promise<string | null>;
  cashOut: () => Promise<boolean>;
  claimPrize: () => Promise<boolean>;
  approveToken: (amount: number) => Promise<boolean>;
  depositCredits: (amount: number) => Promise<{ ok: boolean; error?: string }>;
  cancelStuckRequest: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  calculatePotentialReward: (streak: number) => string;
  calculateSafeStreak: (tierIndex: number, poolBNB: number) => number;  // 计算安全连胜数
  isPlaying: boolean;
  isWaitingVRF: boolean;
  vrfState: VRFWaitingState;
  lastGuessResult: GuessResultEvent | null;
  forceSettledReason: ForceSettledEvent | null;
  clearForceSettledReason: () => void;
}

const USE_TESTNET = false;
const BSC_RPC_URL = 'https://bsc.publicnode.com';

// ============ 错误处理 ============

type TxErrorLike = {
  code?: string;
  shortMessage?: string;
  message?: string;
  info?: { error?: { message?: string } };
};

function toFriendlyTxError(err: unknown, fallback = '交易失败，请稍后重试'): string {
  const e = err as TxErrorLike;

  if (e?.code === 'ACTION_REJECTED') return '你在钱包里取消了交易';

  const raw =
    (typeof e?.shortMessage === 'string' && e.shortMessage.trim())
      ? e.shortMessage
      : (typeof e?.info?.error?.message === 'string' && e.info.error.message.trim())
        ? e.info.error.message
        : (typeof e?.message === 'string' && e.message.trim())
          ? e.message
          : fallback;

  const lower = raw.toLowerCase();

  if (lower.includes('insufficient funds')) {
    return 'BNB Gas 不足：请确保钱包里有足够 BNB 支付手续费';
  }
  if (lower.includes('pool insufficient for next level')) {
    return '奖池可用余额不足以支撑下一级奖励，请收手兑现或选择其他猜测';
  }
  if (lower.includes('prize pool too low') || lower.includes('pool too low')) {
    return '奖池可用余额不足，暂时无法开始游戏';
  }
  if (lower.includes('pending request') || lower.includes('has pending')) {
    return '你有一笔待处理的请求，请等待 VRF 回调';
  }
  if (lower.includes('game already active')) {
    return '你已有进行中的游戏，请先完成或放弃当前游戏';
  }
  if (lower.includes('no active game')) {
    return '没有进行中的游戏';
  }
  if (lower.includes('max streak reached')) {
    return '已达最大连胜，请收手兑现';
  }
  if (lower.includes('must win at least once')) {
    return '需要至少赢一次才能收手';
  }

  return raw.split('\n')[0]?.trim() || fallback;
}

// ============ Hook 主体 ============

export function useCyberHiLo(): UseCyberHiLoReturn {
  const { walletProvider: web3ModalProvider } = useWeb3ModalProvider();
  const { address: web3ModalAddress, isConnected: web3ModalConnected } = useWeb3ModalAccount();
  const { address: walletContextAddress, isConnected: walletContextConnected, connectedWallet } = useWallet();
  
  const address = walletContextAddress || web3ModalAddress;
  const isConnected = walletContextConnected || web3ModalConnected;
  
  const getNativeWalletProvider = useCallback(() => {
    if (!connectedWallet || connectedWallet === 'walletconnect') return null;
    
    switch (connectedWallet) {
      case 'metamask':
        return window.ethereum;
      case 'okx':
        // OKX：优先使用 window.ethereum（当它是 OKX 注入时），兜底才用 window.okxwallet
        if ((window.ethereum as unknown as { isOkxWallet?: boolean; isOKExWallet?: boolean })?.isOkxWallet ||
            (window.ethereum as unknown as { isOkxWallet?: boolean; isOKExWallet?: boolean })?.isOKExWallet) {
          return window.ethereum;
        }
        return (window as unknown as { okxwallet?: unknown }).okxwallet || window.ethereum;
      case 'binance':
        return (window as unknown as { BinanceChain?: unknown }).BinanceChain || window.ethereum;
      case 'tokenpocket':
        return (window as unknown as { tokenpocket?: unknown }).tokenpocket || window.ethereum;
      default:
        return window.ethereum;
    }
  }, [connectedWallet]);
  
  const [state, setState] = useState<HiLoContractState>({
    prizePool: '0',
    availablePool: '0',
    totalGames: 0n,
    totalPaidOut: '0',
    totalBurned: '0',
    playerStats: null,
    gameSession: null,
    tokenBalance: '0',
    tokenAllowance: '0',
    gameCredits: '0',
    pendingRequest: 0n,
    unclaimedPrize: '0',
    isLoading: false,
    error: null,
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaitingVRF, setIsWaitingVRF] = useState(false);
  const [vrfState, setVrfState] = useState<VRFWaitingState>({
    isWaiting: false,
    requestId: 0n,
    startTime: 0,
    pollCount: 0,
  });
  const [lastGuessResult, setLastGuessResult] = useState<GuessResultEvent | null>(null);
  const [forceSettledReason, setForceSettledReason] = useState<ForceSettledEvent | null>(null);
  
  const clearForceSettledReason = useCallback(() => {
    setForceSettledReason(null);
  }, []);
  
  const signerContractRef = useRef<Contract | null>(null);
  const tokenContractRef = useRef<Contract | null>(null);
  const providerRef = useRef<BrowserProvider | null>(null);
  const readOnlyContractRef = useRef<Contract | null>(null);
  const readOnlyTokenContractRef = useRef<Contract | null>(null);

  const getContractAddress = useCallback(() => {
    return USE_TESTNET ? CYBER_HILO_ADDRESS.testnet : CYBER_HILO_ADDRESS.mainnet;
  }, []);

  const getTokenAddress = useCallback(() => {
    return USE_TESTNET ? CYBER_TOKEN_ADDRESS.testnet : CYBER_TOKEN_ADDRESS.mainnet;
  }, []);

  // 初始化只读合约
  useEffect(() => {
    const hiloAddress = getContractAddress();
    const tokenAddress = getTokenAddress();
    
    if (hiloAddress !== '0x0000000000000000000000000000000000000000') {
      const readOnlyProvider = new JsonRpcProvider(BSC_RPC_URL);
      readOnlyContractRef.current = new Contract(hiloAddress, CYBER_HILO_ABI, readOnlyProvider);
      
      if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
        readOnlyTokenContractRef.current = new Contract(tokenAddress, CYBER_TOKEN_ABI, readOnlyProvider);
      }
    }
  }, [getContractAddress, getTokenAddress]);

  // 初始化签名合约
  const initSignerContracts = useCallback(async () => {
    const nativeProvider = getNativeWalletProvider();
    const walletProvider = nativeProvider || web3ModalProvider;
    
    if (!walletProvider || !isConnected) {
      signerContractRef.current = null;
      tokenContractRef.current = null;
      providerRef.current = null;
      return;
    }

    try {
      const provider = new BrowserProvider(walletProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> });
      const signer = await provider.getSigner();
      
      const hiloAddress = getContractAddress();
      const tokenAddress = getTokenAddress();
      
      if (hiloAddress !== '0x0000000000000000000000000000000000000000') {
        signerContractRef.current = new Contract(hiloAddress, CYBER_HILO_ABI, signer);
      }
      
      if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
        tokenContractRef.current = new Contract(tokenAddress, CYBER_TOKEN_ABI, signer);
      }
      
      providerRef.current = provider;
    } catch (err) {
      console.error('[CyberHiLo] Failed to init signer contracts:', err);
    }
  }, [getNativeWalletProvider, web3ModalProvider, isConnected, getContractAddress, getTokenAddress]);

  // 刷新公共数据
  const refreshPublicData = useCallback(async () => {
    const contract = readOnlyContractRef.current;
    if (!contract) return;
    
    try {
      const [prizePool, availablePool, totalGames, totalPaidOut, totalBurned] = await Promise.all([
        contract.getPrizePool(),
        contract.getAvailablePool(),
        contract.totalGames(),
        contract.totalPaidOut(),
        contract.totalCreditsDeposited(),
      ]);

      setState(prev => ({
        ...prev,
        prizePool: formatEther(prizePool),
        availablePool: formatEther(availablePool),
        totalGames,
        totalPaidOut: formatEther(totalPaidOut),
        totalBurned: formatEther(totalBurned),
      }));
    } catch (err) {
      console.error('[CyberHiLo] Failed to refresh public data:', err);
    }
  }, []);

  // 刷新用户数据
  const refreshUserData = useCallback(async () => {
    const contract = readOnlyContractRef.current;
    const tokenContract = readOnlyTokenContractRef.current;
    const tokenAddress = getTokenAddress();
    
    console.log('[CyberHiLo] refreshUserData called', {
      hasContract: !!contract,
      hasTokenContract: !!tokenContract,
      address,
      tokenAddress,
    });
    
    if (!contract || !address) {
      console.log('[CyberHiLo] Skipping user data refresh - no contract or address');
      return;
    }
    
    try {
      const [playerStats, gameSession, gameCredits, pendingRequest, unclaimedPrize] = await Promise.all([
        contract.getPlayerStats(address),
        contract.getGameSession(address),
        contract.getCredits(address),
        contract.pendingRequest(address),
        contract.unclaimedPrizes(address),
      ]);

      console.log('[CyberHiLo] User game data:', {
        gameCredits: gameCredits.toString(),
        pendingRequest: pendingRequest.toString(),
        unclaimedPrize: unclaimedPrize.toString(),
      });

      let tokenBalance = '0';
      let tokenAllowance = '0';
      
      // 如果tokenContract未初始化但地址有效，重新创建
      let effectiveTokenContract = tokenContract;
      if (!effectiveTokenContract && tokenAddress !== '0x0000000000000000000000000000000000000000') {
        console.log('[CyberHiLo] Token contract not initialized, creating on-demand...');
        const readOnlyProvider = new JsonRpcProvider(BSC_RPC_URL);
        effectiveTokenContract = new Contract(tokenAddress, CYBER_TOKEN_ABI, readOnlyProvider);
      }
      
      if (effectiveTokenContract) {
        try {
          console.log('[CyberHiLo] Fetching token balance for address:', address);
          const [balance, allowance] = await Promise.all([
            effectiveTokenContract.balanceOf(address),
            effectiveTokenContract.allowance(address, getContractAddress()),
          ]);
          tokenBalance = formatEther(balance);
          tokenAllowance = formatEther(allowance);
          
          console.log('[CyberHiLo] Token data fetched successfully:', {
            rawBalance: balance.toString(),
            formattedBalance: tokenBalance,
            allowance: tokenAllowance,
          });
        } catch (tokenErr) {
          console.error('[CyberHiLo] Failed to read token data:', tokenErr);
        }
      } else {
        console.log('[CyberHiLo] No token contract available - tokenAddress:', tokenAddress);
      }

      const session: HiLoGameSession = {
        player: gameSession.player,
        betAmount: gameSession.betAmount,
        betTierIndex: Number(gameSession.betTierIndex),
        currentCard: Number(gameSession.currentCard),
        currentStreak: Number(gameSession.currentStreak),
        prizePoolSnapshot: gameSession.prizePoolSnapshot,
        timestamp: gameSession.timestamp,
        active: gameSession.active,
      };

      setIsPlaying(session.active);
      const wasWaiting = vrfState.isWaiting;
      const nowWaiting = pendingRequest > 0n;
      
      setIsWaitingVRF(nowWaiting);
      
      // 更新VRF状态
      if (nowWaiting && !wasWaiting) {
        // 开始等待
        setVrfState({
          isWaiting: true,
          requestId: pendingRequest,
          startTime: Date.now(),
          pollCount: 0,
        });
      } else if (nowWaiting && wasWaiting) {
        // 继续等待，增加轮询计数
        setVrfState(prev => ({
          ...prev,
          requestId: pendingRequest,
          pollCount: prev.pollCount + 1,
        }));
      } else if (!nowWaiting && wasWaiting) {
        // VRF完成
        setVrfState({
          isWaiting: false,
          requestId: 0n,
          startTime: 0,
          pollCount: 0,
        });
      }

      setState(prev => ({
        ...prev,
        playerStats: {
          totalGames: playerStats.totalGames,
          totalWins: playerStats.totalWins,
          totalWinnings: playerStats.totalWinnings,
          totalBet: playerStats.totalBet,
          maxStreak: playerStats.maxStreak,
        },
        gameSession: session,
        tokenBalance,
        tokenAllowance,
        gameCredits: formatEther(gameCredits),
        pendingRequest,
        unclaimedPrize: formatEther(unclaimedPrize),
      }));
    } catch (err) {
      console.error('[CyberHiLo] Failed to refresh user data:', err);
    }
  }, [address, getContractAddress, getTokenAddress]);

  // 刷新所有数据
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await refreshPublicData();
      if (address) {
        await refreshUserData();
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setState(prev => ({ ...prev, error: '读取合约数据失败' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshPublicData, refreshUserData, address]);

  // 计算潜在奖励
  const calculatePotentialReward = useCallback((streak: number): string => {
    if (streak <= 0 || streak > 20) return '0';
    
    const session = state.gameSession;
    if (!session || !session.active) return '0';
    
    const percentBps = HILO_REWARD_PERCENTAGES[streak - 1];
    const poolSnapshot = parseFloat(formatEther(session.prizePoolSnapshot));
    const reward = (poolSnapshot * percentBps) / 10000;
    
    return reward.toFixed(4);
  }, [state.gameSession]);

  // 计算安全连胜数：当前可用余额能支撑到的最大连胜
  // tierIndex: 0-4 对应不同门槛等级的 maxStreak
  // poolBNB: 当前可用奖池余额
  const calculateSafeStreak = useCallback((tierIndex: number, poolBNB: number): number => {
    if (poolBNB <= 0) return 0;
    
    // 门槛等级对应的最大连胜数: [5, 8, 12, 16, 20]
    const maxStreaks = [5, 8, 12, 16, 20];
    const maxStreak = maxStreaks[tierIndex] || 5;
    
    // 从最大连胜往下找，哪个级别的奖励在可用余额范围内
    for (let streak = maxStreak; streak >= 1; streak--) {
      const percentBps = HILO_REWARD_PERCENTAGES[streak - 1];
      const neededBNB = (poolBNB * percentBps) / 10000;
      
      // 如果需要的 BNB 小于等于可用余额，说明这个连胜是安全的
      if (neededBNB <= poolBNB) {
        return streak;
      }
    }
    
    return 0;
  }, []);

  // ============ 游戏操作 ============

  // 开始游戏
  const startGame = useCallback(async (betAmount: number): Promise<number | null> => {
    await initSignerContracts();
    
    if (!signerContractRef.current || !address) {
      setState(prev => ({ ...prev, error: '请先连接钱包' }));
      return null;
    }

    setState(prev => ({ ...prev, error: null }));

    try {
      const betAmountWei = parseUnits(betAmount.toString(), 18);
      const contract = signerContractRef.current;
      
      // 预检查
      const isValidBet = await contract.isValidBetAmount(betAmountWei);
      if (!isValidBet) {
        setState(prev => ({ ...prev, error: `无效投注金额：${betAmount}` }));
        return null;
      }
      
      const credits = await contract.gameCredits(address);
      if (credits < betAmountWei) {
        setState(prev => ({ ...prev, error: '游戏凭证不足' }));
        return null;
      }
      
      console.log('[CyberHiLo] Starting game with bet:', betAmount);
      
      const tx = await contract.startGame(betAmountWei);
      const receipt = await tx.wait();
      
      // 解析事件获取首张牌
      const gameStartedEvent = receipt.logs.find((log: { topics: string[] }) => 
        log.topics[0] === contract.interface.getEvent('GameStarted')?.topicHash
      );
      
      let firstCard = 7; // 默认值
      if (gameStartedEvent) {
        const parsed = contract.interface.parseLog({
          topics: gameStartedEvent.topics as string[],
          data: gameStartedEvent.data,
        });
        if (parsed) {
          firstCard = Number(parsed.args.firstCard);
        }
      }
      
      setIsPlaying(true);
      await refreshUserData();
      
      return firstCard;
    } catch (err: unknown) {
      console.error('[CyberHiLo] Start game failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return null;
    }
  }, [address, initSignerContracts, refreshUserData]);

  // 猜测
  const guess = useCallback(async (guessType: 'higher' | 'lower' | 'same'): Promise<string | null> => {
    await initSignerContracts();
    
    if (!signerContractRef.current || !address) {
      setState(prev => ({ ...prev, error: '请先连接钱包' }));
      return null;
    }

    if (state.pendingRequest > 0n) {
      setState(prev => ({ ...prev, error: '有待处理的请求' }));
      return null;
    }

    setIsWaitingVRF(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      const contract = signerContractRef.current;
      
      // guessType: 0=猜小, 1=猜大, 2=猜相同
      const typeValue = guessType === 'higher' ? 1 : guessType === 'lower' ? 0 : 2;
      console.log('[CyberHiLo] Guessing:', guessType, '-> typeValue:', typeValue);
      
      const tx = await contract.guess(typeValue);
      console.log('[CyberHiLo] Guess tx hash:', tx.hash);
      await tx.wait();
      
      return tx.hash;
    } catch (err: unknown) {
      console.error('[CyberHiLo] Guess failed:', err);
      setIsWaitingVRF(false);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return null;
    }
  }, [address, initSignerContracts, state.pendingRequest]);

  // 收手兑现
  const cashOut = useCallback(async (): Promise<boolean> => {
    await initSignerContracts();
    
    if (!signerContractRef.current || !address) {
      setState(prev => ({ ...prev, error: '请先连接钱包' }));
      return false;
    }

    setState(prev => ({ ...prev, error: null }));

    try {
      const contract = signerContractRef.current;
      
      console.log('[CyberHiLo] Cashing out...');
      
      const tx = await contract.cashOut();
      await tx.wait();
      
      setIsPlaying(false);
      await refreshUserData();
      
      return true;
    } catch (err: unknown) {
      console.error('[CyberHiLo] Cash out failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return false;
    }
  }, [address, initSignerContracts, refreshUserData]);

  // 领取奖励
  const claimPrize = useCallback(async (): Promise<boolean> => {
    await initSignerContracts();
    
    if (!signerContractRef.current) {
      setState(prev => ({ ...prev, error: '请先连接钱包' }));
      return false;
    }

    try {
      const tx = await signerContractRef.current.claimPrize();
      await tx.wait();
      await refreshUserData();
      return true;
    } catch (err: unknown) {
      console.error('[CyberHiLo] Claim failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return false;
    }
  }, [initSignerContracts, refreshUserData]);

  // 授权代币
  const approveToken = useCallback(async (amount: number): Promise<boolean> => {
    await initSignerContracts();
    
    if (!tokenContractRef.current) {
      setState(prev => ({ ...prev, error: '请先连接钱包' }));
      return false;
    }

    try {
      const amountWei = parseUnits(amount.toString(), 18);
      // 用 populateTransaction + signer.sendTransaction，避免部分钱包 provider 丢失 data 字段
      const provider = providerRef.current;
      const signer = provider ? await provider.getSigner() : null;
      if (!signer) {
        setState(prev => ({ ...prev, error: '钱包签名器不可用，请重连钱包' }));
        return false;
      }

      const approveReq = await tokenContractRef.current.approve.populateTransaction(getContractAddress(), amountWei);
      if (!approveReq.data || approveReq.data === '0x') {
        throw new Error('无法生成授权交易数据（approve data 为空）');
      }

      const tx = await signer.sendTransaction(approveReq);
      await tx.wait();
      await refreshUserData();
      return true;
    } catch (err: unknown) {
      console.error('[CyberHiLo] Approve failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return false;
    }
  }, [initSignerContracts, getContractAddress, refreshUserData]);

  // 充值凭证（自动处理授权）
  const depositCredits = useCallback(async (amount: number): Promise<{ ok: boolean; error?: string }> => {
    // 这里不要依赖 ref 里的 signer 合约（可能会在切换钱包/Provider 时变脏），每次写入都用当前 provider 重建
    const nativeProvider = getNativeWalletProvider();
    const walletProvider = nativeProvider || web3ModalProvider;
    if (!walletProvider || !isConnected || !address) {
      return { ok: false, error: '请先连接钱包' };
    }

    try {
      const contractAddress = getContractAddress();
      const tokenAddress = getTokenAddress();

      const provider = new BrowserProvider(
        walletProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
      );
      const signer = await provider.getSigner();

      const hilo = new Contract(contractAddress, CYBER_HILO_ABI, signer);
      const token = new Contract(tokenAddress, CYBER_TOKEN_ABI, signer);

      const amountWei = parseUnits(amount.toString(), 18);
      
      // 步骤1: 检查当前授权额度
      console.log('[CyberHiLo] Checking allowance...');
      const currentAllowance = await token.allowance(address, contractAddress);
      console.log('[CyberHiLo] Current allowance:', currentAllowance.toString(), 'Need:', amountWei.toString());
      
      // 步骤2: 如果授权不足，先进行授权
      if (currentAllowance < amountWei) {
        console.log('[CyberHiLo] Insufficient allowance, requesting approval...');

        // 兼容部分代币：非 0 -> 非 0 授权可能会 revert（先置 0 再授权）
        if (currentAllowance > 0n) {
          try {
            const resetReq = await token.approve.populateTransaction(contractAddress, 0n);
            if (!resetReq.data || resetReq.data === '0x') {
              throw new Error('无法生成重置授权交易数据（data 为空）');
            }
            const resetTx = await signer.sendTransaction(resetReq);
            await resetTx.wait();
          } catch (resetErr) {
            console.error('[CyberHiLo] Reset approve failed:', resetErr);
          }
        }

        // 授权“本次需要的数量”，避免部分代币对超大授权做限制
        try {
          const approveReq = await token.approve.populateTransaction(contractAddress, amountWei);
          if (!approveReq.data || approveReq.data === '0x') {
            throw new Error('无法生成授权交易数据（approve data 为空）');
          }
          const approveTx = await signer.sendTransaction(approveReq);
          console.log('[CyberHiLo] Approval tx sent:', approveTx.hash);
          await approveTx.wait();
          console.log('[CyberHiLo] Approval confirmed');
        } catch (approveErr: unknown) {
          console.error('[CyberHiLo] Approval failed:', approveErr);
          return { ok: false, error: '授权失败：' + toFriendlyTxError(approveErr) };
        }

        // 二次校验
        const allowanceAfter = await token.allowance(address, contractAddress);
        if (allowanceAfter < amountWei) {
          return { ok: false, error: '授权未生效：请在钱包里确认授权对象是“HiLo 游戏合约地址”，然后重试' };
        }
      }
      
      // 步骤3: 执行充值
      console.log('[CyberHiLo] Depositing credits...');
      const tx = await hilo.depositCredits(amountWei);
      await tx.wait();
      console.log('[CyberHiLo] Deposit confirmed');
      
      await refreshUserData();
      return { ok: true };
    } catch (err: unknown) {
      const errorMsg = toFriendlyTxError(err);
      console.error('[CyberHiLo] Deposit failed:', err);
      return { ok: false, error: errorMsg };
    }
  }, [address, getContractAddress, getNativeWalletProvider, getTokenAddress, isConnected, refreshUserData, web3ModalProvider]);

  // 取消卡住的请求
  const cancelStuckRequest = useCallback(async (): Promise<boolean> => {
    await initSignerContracts();
    
    if (!signerContractRef.current) {
      setState(prev => ({ ...prev, error: '请先连接钱包' }));
      return false;
    }

    try {
      const tx = await signerContractRef.current.cancelStuckRequest();
      await tx.wait();
      setIsWaitingVRF(false);
      await refreshUserData();
      return true;
    } catch (err: unknown) {
      console.error('[CyberHiLo] Cancel stuck request failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return false;
    }
  }, [initSignerContracts, refreshUserData]);

  // 初始化效果
  useEffect(() => {
    refreshPublicData();
  }, [refreshPublicData]);

  useEffect(() => {
    if (isConnected && address) {
      initSignerContracts();
      refreshUserData();
    }
  }, [isConnected, address, initSignerContracts, refreshUserData]);

  // 轮询刷新（游戏中或等待VRF时）
  useEffect(() => {
    if (!isConnected || !address) return;
    
    const shouldPoll = isPlaying || isWaitingVRF;
    if (!shouldPoll) return;
    
    const interval = setInterval(() => {
      refreshUserData();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isConnected, address, isPlaying, isWaitingVRF, refreshUserData]);

  // 监听奖池不足强制结算事件
  useEffect(() => {
    const contract = readOnlyContractRef.current;
    if (!contract || !address) return;

    const handleForceSettled = (
      player: string,
      streak: bigint,
      available: bigint,
      needed: bigint
    ) => {
      // 只处理当前用户的事件
      if (player.toLowerCase() !== address.toLowerCase()) return;
      
      console.log('[CyberHiLo] PoolInsufficientForceSettled event:', {
        player,
        streak: Number(streak),
        available: formatEther(available),
        needed: formatEther(needed),
      });

      setForceSettledReason({
        streak: Number(streak),
        available: formatEther(available),
        needed: formatEther(needed),
        timestamp: Date.now(),
      });
      
      // 清除VRF等待状态
      setIsWaitingVRF(false);
      setVrfState({
        isWaiting: false,
        requestId: 0n,
        startTime: 0,
        pollCount: 0,
      });
    };

    contract.on('PoolInsufficientForceSettled', handleForceSettled);
    
    return () => {
      contract.off('PoolInsufficientForceSettled', handleForceSettled);
    };
  }, [address]);

  return {
    ...state,
    startGame,
    guess,
    cashOut,
    claimPrize,
    approveToken,
    depositCredits,
    cancelStuckRequest,
    refreshData,
    calculatePotentialReward,
    calculateSafeStreak,
    isPlaying,
    isWaitingVRF,
    vrfState,
    lastGuessResult,
    forceSettledReason,
    clearForceSettledReason,
  };
}
