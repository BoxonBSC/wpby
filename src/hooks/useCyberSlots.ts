import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract, BrowserProvider, formatEther, parseUnits } from 'ethers';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
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

const USE_TESTNET = true;

export function useCyberSlots(): UseCyberSlotsReturn {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  
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
  
  const contractRef = useRef<Contract | null>(null);
  const tokenContractRef = useRef<Contract | null>(null);
  const providerRef = useRef<BrowserProvider | null>(null);

  const getContractAddress = useCallback(() => {
    return USE_TESTNET ? CYBER_SLOTS_ADDRESS.testnet : CYBER_SLOTS_ADDRESS.mainnet;
  }, []);

  const getTokenAddress = useCallback(() => {
    return USE_TESTNET ? CYBER_TOKEN_ADDRESS.testnet : CYBER_TOKEN_ADDRESS.mainnet;
  }, []);

  const initContracts = useCallback(async () => {
    if (!walletProvider || !isConnected) {
      contractRef.current = null;
      tokenContractRef.current = null;
      providerRef.current = null;
      return;
    }

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      
      const slotsAddress = getContractAddress();
      const tokenAddress = getTokenAddress();
      
      if (slotsAddress !== '0x0000000000000000000000000000000000000000') {
        contractRef.current = new Contract(slotsAddress, CYBER_SLOTS_ABI, signer);
      }
      
      if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
        tokenContractRef.current = new Contract(tokenAddress, CYBER_TOKEN_ABI, signer);
      }
      
      providerRef.current = provider;
    } catch (err) {
      console.error('Failed to init contracts:', err);
    }
  }, [walletProvider, isConnected, getContractAddress, getTokenAddress]);

  const refreshData = useCallback(async () => {
    if (!contractRef.current || !address) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const contract = contractRef.current;
      const tokenContract = tokenContractRef.current;
      
      const [
        prizePool,
        availablePool,
        totalSpins,
        totalPaidOut,
        playerStats,
        gameCredits,
        pendingRequest,
        unclaimedPrize,
      ] = await Promise.all([
        contract.getPrizePool(),
        contract.getAvailablePool(),
        contract.totalSpins(),
        contract.totalPaidOut(),
        contract.getPlayerStats(address),
        contract.getCredits(address),
        contract.pendingRequest(address),
        contract.unclaimedPrizes(address),
      ]);

      let tokenBalance = '0';
      let tokenAllowance = '0';
      
      if (tokenContract) {
        const [balance, allowance] = await Promise.all([
          tokenContract.balanceOf(address),
          tokenContract.allowance(address, getContractAddress()),
        ]);
        tokenBalance = formatEther(balance);
        tokenAllowance = formatEther(allowance);
      }

      setState(prev => ({
        ...prev,
        prizePool: formatEther(prizePool),
        availablePool: formatEther(availablePool),
        totalSpins,
        totalPaidOut: formatEther(totalPaidOut),
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
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: '读取合约数据失败' 
      }));
    }
  }, [address, getContractAddress]);

  const spin = useCallback(async (betAmount: number): Promise<string | null> => {
    if (!contractRef.current || !address) {
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
      const tx = await contractRef.current.spin(betAmountWei);
      const receipt = await tx.wait();
      
      const spinEvent = receipt.logs.find((log: { topics: string[] }) => 
        log.topics[0] === contractRef.current?.interface.getEvent('SpinRequested')?.topicHash
      );
      
      if (spinEvent) {
        const parsed = contractRef.current.interface.parseLog({
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
    if (!contractRef.current) return false;

    try {
      const tx = await contractRef.current.claimPrize();
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
    if (!contractRef.current || !tokenContractRef.current) return false;

    try {
      const amountWei = parseUnits(amount.toString(), 18);
      
      // 先检查授权
      const allowance = await tokenContractRef.current.allowance(address, getContractAddress());
      if (allowance < amountWei) {
        const approveTx = await tokenContractRef.current.approve(getContractAddress(), amountWei);
        await approveTx.wait();
      }
      
      // 调用 depositCredits
      const tx = await contractRef.current.depositCredits(amountWei);
      await tx.wait();
      await refreshData();
      return true;
    } catch (err) {
      console.error('Deposit credits failed:', err);
      return false;
    }
  }, [address, getContractAddress, refreshData]);

  const cancelStuckRequest = useCallback(async (): Promise<boolean> => {
    if (!contractRef.current) return false;

    try {
      const tx = await contractRef.current.cancelStuckRequest();
      await tx.wait();
      await refreshData();
      return true;
    } catch (err) {
      console.error('Cancel request failed:', err);
      return false;
    }
  }, [refreshData]);

  useEffect(() => {
    initContracts();
  }, [initContracts]);

  useEffect(() => {
    if (contractRef.current && address) {
      refreshData();
    }
  }, [address, refreshData]);

  useEffect(() => {
    if (!contractRef.current || !address) return;

    const contract = contractRef.current;

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

      if (player.toLowerCase() === address.toLowerCase()) {
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (contractRef.current && address && !isSpinning) {
        refreshData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [address, isSpinning, refreshData]);

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
