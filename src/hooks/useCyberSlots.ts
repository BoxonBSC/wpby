import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract, BrowserProvider, formatEther, parseUnits, JsonRpcProvider } from 'ethers';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useWallet } from '@/contexts/WalletContext';
import { 
  CYBER_SLOTS_ADDRESS, 
  CYBER_TOKEN_ADDRESS,
  CYBER_SLOTS_ABI, 
  CYBER_TOKEN_ABI,
  SYMBOL_MAP,
  PRIZE_TYPE_MAP 
} from '@/config/contracts';

export interface PlayerStats {
  totalSpins: bigint;
  totalWins: bigint;
  totalWinnings: bigint;
  totalBet: bigint;
}

export interface SpinResultEvent {
  player: string;
  requestId: bigint;
  symbols: number[];
  winAmount: bigint;
  prizeType: string;
  timestamp: number;
}

export interface ContractState {
  prizePool: string;
  availablePool: string;
  totalSpins: bigint;
  totalPaidOut: string;
  playerStats: PlayerStats | null;
  tokenBalance: string;
  tokenAllowance: string;
  gameCredits: string;
  pendingRequest: bigint;
  unclaimedPrize: string;
  isLoading: boolean;
  error: string | null;
}

export interface UseCyberSlotsReturn extends ContractState {
  spin: (betAmount: number) => Promise<string | null>;
  claimPrize: () => Promise<boolean>;
  approveToken: (amount: number) => Promise<boolean>;
  depositCredits: (amount: number) => Promise<boolean>;
  cancelStuckRequest: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  recentWins: SpinResultEvent[];
  isSpinning: boolean;
  currentSpinRequest: bigint | null;
}

const USE_TESTNET = false; // 使用主网

// BSC 主网公共 RPC（支持浏览器 CORS）
const BSC_RPC_URL = 'https://bsc.publicnode.com';

export function useCyberSlots(): UseCyberSlotsReturn {
  const { walletProvider: web3ModalProvider } = useWeb3ModalProvider();
  const { address: web3ModalAddress, isConnected: web3ModalConnected } = useWeb3ModalAccount();
  
  // 同时从 WalletContext 获取地址和钱包类型（支持原生钱包连接）
  const { address: walletContextAddress, isConnected: walletContextConnected, connectedWallet } = useWallet();
  
  // 优先使用 WalletContext 的地址（原生钱包），其次是 Web3Modal 的地址（WalletConnect）
  const address = walletContextAddress || web3ModalAddress;
  const isConnected = walletContextConnected || web3ModalConnected;
  
  // 获取原生钱包的 provider
  const getNativeWalletProvider = useCallback(() => {
    if (!connectedWallet || connectedWallet === 'walletconnect') return null;
    
    switch (connectedWallet) {
      case 'metamask':
        return window.ethereum;
      case 'okx':
        return (window as unknown as { okxwallet?: unknown }).okxwallet || window.ethereum;
      case 'binance':
        return (window as unknown as { BinanceChain?: unknown }).BinanceChain || window.ethereum;
      case 'tokenpocket':
        return (window as unknown as { tokenpocket?: unknown }).tokenpocket || window.ethereum;
      default:
        return window.ethereum;
    }
  }, [connectedWallet]);
  
  const [state, setState] = useState<ContractState>({
    prizePool: '0',
    availablePool: '0',
    totalSpins: 0n,
    totalPaidOut: '0',
    playerStats: null,
    tokenBalance: '0',
    tokenAllowance: '0',
    gameCredits: '0',
    pendingRequest: 0n,
    unclaimedPrize: '0',
    isLoading: false,
    error: null,
  });
  
  const [recentWins, setRecentWins] = useState<SpinResultEvent[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpinRequest, setCurrentSpinRequest] = useState<bigint | null>(null);
  
  // 用于写操作的合约（需要钱包签名）
  const signerContractRef = useRef<Contract | null>(null);
  const tokenContractRef = useRef<Contract | null>(null);
  const providerRef = useRef<BrowserProvider | null>(null);
  
  // 用于只读操作的合约（使用公共 RPC）
  const readOnlyContractRef = useRef<Contract | null>(null);
  const readOnlyTokenContractRef = useRef<Contract | null>(null);

  const getContractAddress = useCallback(() => {
    return USE_TESTNET ? CYBER_SLOTS_ADDRESS.testnet : CYBER_SLOTS_ADDRESS.mainnet;
  }, []);

  const getTokenAddress = useCallback(() => {
    return USE_TESTNET ? CYBER_TOKEN_ADDRESS.testnet : CYBER_TOKEN_ADDRESS.mainnet;
  }, []);

  // 初始化只读合约（无需钱包连接）
  useEffect(() => {
    const slotsAddress = getContractAddress();
    const tokenAddress = getTokenAddress();
    
    if (slotsAddress !== '0x0000000000000000000000000000000000000000') {
      const readOnlyProvider = new JsonRpcProvider(BSC_RPC_URL);
      readOnlyContractRef.current = new Contract(slotsAddress, CYBER_SLOTS_ABI, readOnlyProvider);
      
      if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
        readOnlyTokenContractRef.current = new Contract(tokenAddress, CYBER_TOKEN_ABI, readOnlyProvider);
      }
    }
  }, [getContractAddress, getTokenAddress]);

  // 初始化签名合约（需要钱包连接）
  const initSignerContracts = useCallback(async () => {
    // 优先使用原生钱包 provider，其次是 Web3Modal provider
    const nativeProvider = getNativeWalletProvider();
    const walletProvider = nativeProvider || web3ModalProvider;
    
    if (!walletProvider || !isConnected) {
      signerContractRef.current = null;
      tokenContractRef.current = null;
      providerRef.current = null;
      console.log('[CyberSlots] No wallet provider for signer contracts');
      return;
    }

    try {
      console.log('[CyberSlots] Initializing signer contracts with provider:', {
        hasNativeProvider: !!nativeProvider,
        hasWeb3ModalProvider: !!web3ModalProvider,
        connectedWallet,
      });
      
      const provider = new BrowserProvider(walletProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> });
      const signer = await provider.getSigner();
      
      const slotsAddress = getContractAddress();
      const tokenAddress = getTokenAddress();
      
      if (slotsAddress !== '0x0000000000000000000000000000000000000000') {
        signerContractRef.current = new Contract(slotsAddress, CYBER_SLOTS_ABI, signer);
        console.log('[CyberSlots] Slots signer contract initialized');
      }
      
      if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
        tokenContractRef.current = new Contract(tokenAddress, CYBER_TOKEN_ABI, signer);
        console.log('[CyberSlots] Token signer contract initialized');
      }
      
      providerRef.current = provider;
    } catch (err) {
      console.error('[CyberSlots] Failed to init signer contracts:', err);
    }
  }, [getNativeWalletProvider, web3ModalProvider, isConnected, connectedWallet, getContractAddress, getTokenAddress]);

  // 刷新公共数据（无需钱包连接）
  const refreshPublicData = useCallback(async () => {
    const contract = readOnlyContractRef.current;
    if (!contract) {
      console.log('[CyberSlots] No read-only contract available');
      return;
    }
    
    try {
      console.log('[CyberSlots] Fetching public data from contract...');
      const [prizePool, availablePool, totalSpins, totalPaidOut] = await Promise.all([
        contract.getPrizePool(),
        contract.getAvailablePool(),
        contract.totalSpins(),
        contract.totalPaidOut(),
      ]);

      console.log('[CyberSlots] Raw contract data:', {
        prizePool: prizePool.toString(),
        availablePool: availablePool.toString(),
        totalSpins: totalSpins.toString(),
        totalPaidOut: totalPaidOut.toString(),
      });

      setState(prev => ({
        ...prev,
        prizePool: formatEther(prizePool),
        availablePool: formatEther(availablePool),
        totalSpins,
        totalPaidOut: formatEther(totalPaidOut),
      }));
    } catch (err) {
      console.error('[CyberSlots] Failed to refresh public data:', err);
    }
  }, []);

  // 刷新用户数据（需要钱包连接）
  const refreshUserData = useCallback(async () => {
    const contract = readOnlyContractRef.current;
    const tokenContract = readOnlyTokenContractRef.current;
    
    console.log('[CyberSlots] refreshUserData called', {
      hasContract: !!contract,
      hasTokenContract: !!tokenContract,
      address,
      tokenAddress: getTokenAddress(),
    });
    
    if (!contract || !address) {
      console.log('[CyberSlots] Skipping user data refresh - no contract or address');
      return;
    }
    
    try {
      const [playerStats, gameCredits, pendingRequest, unclaimedPrize] = await Promise.all([
        contract.getPlayerStats(address),
        contract.getCredits(address),
        contract.pendingRequest(address),
        contract.unclaimedPrizes(address),
      ]);

      console.log('[CyberSlots] User game data:', {
        gameCredits: gameCredits.toString(),
        pendingRequest: pendingRequest.toString(),
        unclaimedPrize: unclaimedPrize.toString(),
      });

      let tokenBalance = '0';
      let tokenAllowance = '0';
      
      if (tokenContract) {
        try {
          const [balance, allowance] = await Promise.all([
            tokenContract.balanceOf(address),
            tokenContract.allowance(address, getContractAddress()),
          ]);
          tokenBalance = formatEther(balance);
          tokenAllowance = formatEther(allowance);
          
          console.log('[CyberSlots] Token data:', {
            rawBalance: balance.toString(),
            formattedBalance: tokenBalance,
            allowance: tokenAllowance,
          });
        } catch (tokenErr) {
          console.error('[CyberSlots] Failed to read token data:', tokenErr);
        }
      } else {
        console.log('[CyberSlots] No token contract available');
      }

      setState(prev => ({
        ...prev,
        playerStats: {
          totalSpins: playerStats.totalSpins,
          totalWins: playerStats.totalWins,
          totalWinnings: playerStats.totalWinnings,
          totalBet: playerStats.totalBet,
        },
        tokenBalance,
        tokenAllowance,
        gameCredits: formatEther(gameCredits),
        pendingRequest,
        unclaimedPrize: formatEther(unclaimedPrize),
      }));
    } catch (err) {
      console.error('[CyberSlots] Failed to refresh user data:', err);
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
      setState(prev => ({ 
        ...prev, 
        error: '读取合约数据失败' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshPublicData, refreshUserData, address]);

  const spin = useCallback(async (betAmount: number): Promise<string | null> => {
    if (!signerContractRef.current || !address) {
      setState(prev => ({ ...prev, error: '请先连接钱包' }));
      return null;
    }

    if (state.pendingRequest > 0n) {
      setState(prev => ({ ...prev, error: '有待处理的游戏请求' }));
      return null;
    }

    setIsSpinning(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      const betAmountWei = parseUnits(betAmount.toString(), 18);
      const tx = await signerContractRef.current.spin(betAmountWei);
      const receipt = await tx.wait();
      
      const spinEvent = receipt.logs.find((log: { topics: string[] }) => 
        log.topics[0] === signerContractRef.current?.interface.getEvent('SpinRequested')?.topicHash
      );
      
      if (spinEvent) {
        const parsed = signerContractRef.current.interface.parseLog({
          topics: spinEvent.topics as string[],
          data: spinEvent.data,
        });
        if (parsed) {
          setCurrentSpinRequest(parsed.args.requestId);
        }
      }

      return tx.hash;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Spin failed:', error);
      setState(prev => ({ ...prev, error: error.message || '游戏失败' }));
      setIsSpinning(false);
      return null;
    }
  }, [address, state.pendingRequest]);

  const claimPrize = useCallback(async (): Promise<boolean> => {
    if (!signerContractRef.current) return false;

    try {
      const tx = await signerContractRef.current.claimPrize();
      await tx.wait();
      await refreshData();
      return true;
    } catch (err) {
      console.error('Claim failed:', err);
      return false;
    }
  }, [refreshData]);

  const approveToken = useCallback(async (amount: number): Promise<boolean> => {
    if (!tokenContractRef.current) return false;

    try {
      const amountWei = parseUnits(amount.toString(), 18);
      const tx = await tokenContractRef.current.approve(getContractAddress(), amountWei);
      await tx.wait();
      await refreshData();
      return true;
    } catch (err) {
      console.error('Approve failed:', err);
      return false;
    }
  }, [getContractAddress, refreshData]);

  const depositCredits = useCallback(async (amount: number): Promise<boolean> => {
    try {
      const nativeProvider = getNativeWalletProvider();
      const walletProvider = nativeProvider || web3ModalProvider;
      const slotsAddress = getContractAddress();
      const tokenAddress = getTokenAddress();

      console.log('[CyberSlots] depositCredits called', {
        amount,
        address,
        connectedWallet,
        slotsAddress,
        tokenAddress,
        hasNativeProvider: !!nativeProvider,
        hasWeb3ModalProvider: !!web3ModalProvider,
      });

      if (!address || !walletProvider) {
        setState(prev => ({ ...prev, error: '未检测到可用钱包 Provider，请重新连接钱包' }));
        return false;
      }

      // 每次写入都用当前 Provider 重新创建 signer/合约，避免 ref 指向错误合约
      const provider = new BrowserProvider(
        walletProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
      );
      const signer = await provider.getSigner();
      const slots = new Contract(slotsAddress, CYBER_SLOTS_ABI, signer);
      const token = new Contract(tokenAddress, CYBER_TOKEN_ABI, signer);

      console.log('[CyberSlots] write contracts targets', {
        slots: (slots as unknown as { target?: string }).target || slotsAddress,
        token: (token as unknown as { target?: string }).target || tokenAddress,
      });

      const amountWei = parseUnits(amount.toString(), 18);

      // 先检查授权
      const spender = slotsAddress;
      const allowance = await token.allowance(address, spender);
      console.log('[CyberSlots] allowance before:', allowance.toString());

      if (allowance < amountWei) {
        // 兼容部分代币：非 0 -> 非 0 授权可能会 revert（先置 0 再授权）
        if (allowance > 0n) {
          const resetTx = await token.approve(spender, 0n);
          console.log('[CyberSlots] approve reset tx:', resetTx.hash);
          await resetTx.wait();
        }

        const approveTx = await token.approve(spender, amountWei);
        console.log('[CyberSlots] approve tx:', approveTx.hash);
        await approveTx.wait();

        // 二次校验：部分钱包/代币在“无限授权”或失败时 allowance 不会如预期更新
        const allowanceAfter = await token.allowance(address, spender);
        console.log('[CyberSlots] allowance after:', allowanceAfter.toString());
        if (allowanceAfter < amountWei) {
          setState(prev => ({
            ...prev,
            error: '授权未生效：请确认授权对象是“游戏合约地址”，并重试（可尝试先取消授权/设为0再授权）',
          }));
          return false;
        }
      }

      console.log('[CyberSlots] calling slots.depositCredits...');
      const tx = await slots.depositCredits(amountWei);
      console.log('[CyberSlots] depositCredits tx:', tx.hash);
      await tx.wait();

      await refreshData();
      return true;
    } catch (err: unknown) {
      console.error('[CyberSlots] Deposit credits failed:', err);

      const e = err as {
        code?: string;
        shortMessage?: string;
        message?: string;
        info?: { error?: { message?: string } };
      };

      let msg = '兑换失败：交易被合约回滚';
      if (e?.code === 'ACTION_REJECTED') msg = '你在钱包里取消了授权/交易';
      else if (typeof e?.message === 'string' && e.message.toLowerCase().includes('insufficient funds')) {
        msg = 'BNB Gas 不足：请确保钱包有足够 BNB 支付手续费';
      } else if (typeof e?.shortMessage === 'string' && e.shortMessage.trim()) {
        msg = e.shortMessage;
      } else if (typeof e?.info?.error?.message === 'string' && e.info.error.message.trim()) {
        msg = e.info.error.message;
      } else if (typeof e?.message === 'string' && e.message.trim()) {
        msg = e.message;
      }

      setState(prev => ({ ...prev, error: msg }));
      return false;
    }
  }, [
    address,
    connectedWallet,
    getContractAddress,
    getNativeWalletProvider,
    getTokenAddress,
    refreshData,
    web3ModalProvider,
  ]);

  const cancelStuckRequest = useCallback(async (): Promise<boolean> => {
    if (!signerContractRef.current) return false;

    try {
      const tx = await signerContractRef.current.cancelStuckRequest();
      await tx.wait();
      await refreshData();
      return true;
    } catch (err) {
      console.error('Cancel request failed:', err);
      return false;
    }
  }, [refreshData]);

  // 初始化签名合约
  useEffect(() => {
    initSignerContracts();
  }, [initSignerContracts]);

  // 页面加载时刷新公共数据
  useEffect(() => {
    if (readOnlyContractRef.current) {
      refreshPublicData();
    }
  }, [refreshPublicData]);

  // 钱包连接时刷新用户数据
  useEffect(() => {
    if (address) {
      refreshUserData();
    }
  }, [address, refreshUserData]);

  // 监听 SpinResult 事件
  useEffect(() => {
    const contract = readOnlyContractRef.current;
    if (!contract) return;

    const handleSpinResult = (
      player: string,
      requestId: bigint,
      symbols: number[],
      winAmount: bigint,
      prizeType: string
    ) => {
      const event: SpinResultEvent = {
        player,
        requestId,
        symbols: Array.from(symbols),
        winAmount,
        prizeType,
        timestamp: Date.now(),
      };

      setRecentWins(prev => [event, ...prev].slice(0, 20));

      if (address && player.toLowerCase() === address.toLowerCase()) {
        setIsSpinning(false);
        setCurrentSpinRequest(null);
        refreshData();
      }
    };

    const filter = contract.filters.SpinResult();
    contract.on(filter, handleSpinResult);

    return () => {
      contract.off(filter, handleSpinResult);
    };
  }, [address, refreshData]);

  // 定期刷新数据
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSpinning) {
        refreshPublicData();
        if (address) {
          refreshUserData();
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [address, isSpinning, refreshPublicData, refreshUserData]);

  return {
    ...state,
    spin,
    claimPrize,
    approveToken,
    depositCredits,
    cancelStuckRequest,
    refreshData,
    recentWins,
    isSpinning,
    currentSpinRequest,
  };
}

export function formatSymbols(symbols: number[]): string[] {
  return symbols.map(s => SYMBOL_MAP[s] || '❓');
}

export function formatPrizeType(prizeType: string): { name: string; emoji: string } {
  return PRIZE_TYPE_MAP[prizeType] || PRIZE_TYPE_MAP.none;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
