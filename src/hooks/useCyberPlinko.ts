import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract, BrowserProvider, formatEther, parseUnits, JsonRpcProvider } from 'ethers';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useWallet } from '@/contexts/WalletContext';
import { CYBER_PLINKO_ADDRESS, CYBER_TOKEN_ADDRESS, CYBER_TOKEN_ABI } from '@/config/contracts';
import { CYBER_PLINKO_ABI, getRewardTypeName, getRewardTypeEmoji } from '@/config/plinkoContract';

export interface PlinkoPlayerStats {
  totalDrops: bigint;
  totalWins: bigint;
  totalWinnings: bigint;
  totalBet: bigint;
}

export interface DropResultEvent {
  player: string;
  requestId: bigint;
  slotIndex: number;
  winAmount: bigint;
  rewardType: number;
  timestamp: number;
  txHash?: string;
}

export interface PlinkContractState {
  prizePool: string;
  availablePool: string;
  totalDrops: bigint;
  totalPaidOut: string;
  playerStats: PlinkoPlayerStats | null;
  tokenBalance: string;
  tokenAllowance: string;
  gameCredits: string;
  pendingRequest: bigint;
  unclaimedPrize: string;
  isLoading: boolean;
  error: string | null;
}

export interface UseCyberPlinkoReturn extends PlinkContractState {
  drop: (betAmount: number) => Promise<string | null>;
  claimPrize: () => Promise<boolean>;
  approveToken: (amount: number) => Promise<boolean>;
  depositCredits: (amount: number) => Promise<{ ok: boolean; error?: string }>;
  cancelStuckRequest: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  recentDrops: DropResultEvent[];
  isDropping: boolean;
  currentDropRequest: bigint | null;
  lastDropResult: { slotIndex: number; winAmount: string; rewardType: number } | null;
  isContractDeployed: boolean;
}

const USE_TESTNET = false;
const BSC_RPC_URL = 'https://bsc.publicnode.com';

type TxErrorLike = {
  code?: string;
  shortMessage?: string;
  message?: string;
  info?: { error?: { message?: string } };
};

function toFriendlyTxError(err: unknown, fallback = '交易失败，请稍后重试'): string {
  const e = err as TxErrorLike;
  if (e?.code === 'ACTION_REJECTED') return '你在钱包里取消了交易';
  
  const raw = e?.shortMessage || e?.info?.error?.message || e?.message || fallback;
  const lower = raw.toLowerCase();
  
  if (lower.includes('insufficient funds')) {
    return 'BNB Gas 不足：请确保钱包里有足够 BNB 支付手续费';
  }
  if (lower.includes('prize pool too low')) {
    return '奖池可用余额不足，暂时无法开始游戏';
  }
  if (lower.includes('pending request')) {
    return '你有一笔待处理的投球请求：请等待 VRF 回调';
  }
  
  return raw.split('\n')[0]?.trim() || fallback;
}

export function useCyberPlinko(): UseCyberPlinkoReturn {
  const { walletProvider: web3ModalProvider } = useWeb3ModalProvider();
  const { address: web3ModalAddress, isConnected: web3ModalConnected } = useWeb3ModalAccount();
  const { address: walletContextAddress, isConnected: walletContextConnected, connectedWallet } = useWallet();
  
  const address = walletContextAddress || web3ModalAddress;
  const isConnected = walletContextConnected || web3ModalConnected;
  
  const getNativeWalletProvider = useCallback(() => {
    if (!connectedWallet || connectedWallet === 'walletconnect') return null;
    switch (connectedWallet) {
      case 'metamask': return window.ethereum;
      case 'okx': return (window as unknown as { okxwallet?: unknown }).okxwallet || window.ethereum;
      case 'binance': return (window as unknown as { BinanceChain?: unknown }).BinanceChain || window.ethereum;
      case 'tokenpocket': return (window as unknown as { tokenpocket?: unknown }).tokenpocket || window.ethereum;
      default: return window.ethereum;
    }
  }, [connectedWallet]);
  
  const [state, setState] = useState<PlinkContractState>({
    prizePool: '0',
    availablePool: '0',
    totalDrops: 0n,
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
  
  const [recentDrops, setRecentDrops] = useState<DropResultEvent[]>([]);
  const [isDropping, setIsDropping] = useState(false);
  const [currentDropRequest, setCurrentDropRequest] = useState<bigint | null>(null);
  const [lastDropResult, setLastDropResult] = useState<{ slotIndex: number; winAmount: string; rewardType: number } | null>(null);
  const [isContractDeployed, setIsContractDeployed] = useState(false);
  
  const signerContractRef = useRef<Contract | null>(null);
  const tokenContractRef = useRef<Contract | null>(null);
  const providerRef = useRef<BrowserProvider | null>(null);
  const readOnlyContractRef = useRef<Contract | null>(null);
  const readOnlyTokenContractRef = useRef<Contract | null>(null);
  const lastDropResultBlockRef = useRef<number | null>(null);

  const getContractAddress = useCallback(() => {
    return USE_TESTNET ? CYBER_PLINKO_ADDRESS.testnet : CYBER_PLINKO_ADDRESS.mainnet;
  }, []);

  const getTokenAddress = useCallback(() => {
    return USE_TESTNET ? CYBER_TOKEN_ADDRESS.testnet : CYBER_TOKEN_ADDRESS.mainnet;
  }, []);

  // 检查合约是否已部署
  useEffect(() => {
    const contractAddress = getContractAddress();
    const deployed = contractAddress !== '0x0000000000000000000000000000000000000000';
    setIsContractDeployed(deployed);
    
    if (deployed) {
      const readOnlyProvider = new JsonRpcProvider(BSC_RPC_URL);
      readOnlyContractRef.current = new Contract(contractAddress, CYBER_PLINKO_ABI, readOnlyProvider);
      
      const tokenAddress = getTokenAddress();
      if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
        readOnlyTokenContractRef.current = new Contract(tokenAddress, CYBER_TOKEN_ABI, readOnlyProvider);
      }
    }
  }, [getContractAddress, getTokenAddress]);

  // 初始化签名合约
  const initSignerContracts = useCallback(async () => {
    const nativeProvider = getNativeWalletProvider();
    const walletProvider = nativeProvider || web3ModalProvider;
    
    if (!walletProvider || !isConnected || !isContractDeployed) {
      signerContractRef.current = null;
      tokenContractRef.current = null;
      providerRef.current = null;
      return;
    }

    try {
      const provider = new BrowserProvider(walletProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> });
      const signer = await provider.getSigner();
      
      const contractAddress = getContractAddress();
      const tokenAddress = getTokenAddress();
      
      if (contractAddress !== '0x0000000000000000000000000000000000000000') {
        signerContractRef.current = new Contract(contractAddress, CYBER_PLINKO_ABI, signer);
      }
      
      if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
        tokenContractRef.current = new Contract(tokenAddress, CYBER_TOKEN_ABI, signer);
      }
      
      providerRef.current = provider;
    } catch (err) {
      console.error('[CyberPlinko] Failed to init signer contracts:', err);
    }
  }, [getNativeWalletProvider, web3ModalProvider, isConnected, isContractDeployed, getContractAddress, getTokenAddress]);

  // 刷新公共数据
  const refreshPublicData = useCallback(async () => {
    const contract = readOnlyContractRef.current;
    if (!contract || !isContractDeployed) return;
    
    try {
      const [prizePool, availablePool, totalDrops, totalPaidOut] = await Promise.all([
        contract.getPrizePool(),
        contract.getAvailablePool(),
        contract.totalDrops(),
        contract.totalPaidOut(),
      ]);

      setState(prev => ({
        ...prev,
        prizePool: formatEther(prizePool),
        availablePool: formatEther(availablePool),
        totalDrops,
        totalPaidOut: formatEther(totalPaidOut),
      }));
    } catch (err) {
      console.error('[CyberPlinko] Failed to refresh public data:', err);
    }
  }, [isContractDeployed]);

  // 刷新用户数据
  const refreshUserData = useCallback(async () => {
    const contract = readOnlyContractRef.current;
    const tokenContract = readOnlyTokenContractRef.current;
    
    if (!contract || !address || !isContractDeployed) return;
    
    try {
      const [playerStats, gameCredits, pendingRequest, unclaimedPrize] = await Promise.all([
        contract.getPlayerStats(address),
        contract.getCredits(address),
        contract.pendingRequest(address),
        contract.unclaimedPrizes(address),
      ]);

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
        } catch (tokenErr) {
          console.error('[CyberPlinko] Failed to read token data:', tokenErr);
        }
      }

      setState(prev => ({
        ...prev,
        playerStats: {
          totalDrops: playerStats.totalDrops,
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
      console.error('[CyberPlinko] Failed to refresh user data:', err);
    }
  }, [address, getContractAddress, isContractDeployed]);

  // 刷新所有数据
  const refreshData = useCallback(async () => {
    if (!isContractDeployed) return;
    
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
  }, [refreshPublicData, refreshUserData, address, isContractDeployed]);

  // 投球
  const drop = useCallback(async (betAmount: number): Promise<string | null> => {
    if (!isContractDeployed) {
      setState(prev => ({ ...prev, error: '合约未部署' }));
      return null;
    }
    
    if (!signerContractRef.current || !address) {
      setState(prev => ({ ...prev, error: '请先连接钱包' }));
      return null;
    }

    if (state.pendingRequest > 0n) {
      setState(prev => ({ ...prev, error: '有待处理的投球请求' }));
      return null;
    }

    setIsDropping(true);
    setLastDropResult(null);
    setState(prev => ({ ...prev, error: null }));

    try {
      const betAmountWei = parseUnits(betAmount.toString(), 18);
      const plinko = signerContractRef.current;
      
      // 预检查
      const [isValidBet, pendingReq, credits, availablePool] = await Promise.all([
        plinko.isValidBetAmount(betAmountWei),
        plinko.pendingRequest(address),
        plinko.gameCredits(address),
        plinko.getAvailablePool(),
      ]);
      
      if (!isValidBet) {
        setState(prev => ({ ...prev, error: `无效投注金额：${betAmount}` }));
        setIsDropping(false);
        return null;
      }
      
      if (pendingReq > 0n) {
        setState(prev => ({ ...prev, error: '你有未完成的投球请求' }));
        setIsDropping(false);
        return null;
      }
      
      if (credits < betAmountWei) {
        setState(prev => ({ ...prev, error: `游戏凭证不足` }));
        setIsDropping(false);
        return null;
      }
      
      const minPrizePool = parseUnits('0.001', 18);
      if (availablePool < minPrizePool) {
        setState(prev => ({ ...prev, error: '奖池不足' }));
        setIsDropping(false);
        return null;
      }
      
      const tx = await plinko.drop(betAmountWei);
      const receipt = await tx.wait();
      
      const dropEvent = receipt.logs.find((log: { topics: string[] }) => 
        log.topics[0] === signerContractRef.current?.interface.getEvent('DropRequested')?.topicHash
      );
      
      if (dropEvent) {
        const parsed = signerContractRef.current.interface.parseLog({
          topics: dropEvent.topics as string[],
          data: dropEvent.data,
        });
        if (parsed) {
          setCurrentDropRequest(parsed.args.requestId);
        }
      }

      return tx.hash;
    } catch (err: unknown) {
      console.error('[CyberPlinko] Drop failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return null;
    } finally {
      setIsDropping(false);
    }
  }, [address, state.pendingRequest, isContractDeployed]);

  // 授权代币
  const approveToken = useCallback(async (amount: number): Promise<boolean> => {
    if (!tokenContractRef.current || !isContractDeployed) return false;
    
    try {
      const amountWei = parseUnits(amount.toString(), 18);
      const tx = await tokenContractRef.current.approve(getContractAddress(), amountWei);
      await tx.wait();
      await refreshUserData();
      return true;
    } catch (err) {
      console.error('[CyberPlinko] Approve failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return false;
    }
  }, [getContractAddress, refreshUserData, isContractDeployed]);

  // 存入凭证
  const depositCredits = useCallback(async (amount: number): Promise<{ ok: boolean; error?: string }> => {
    if (!signerContractRef.current || !isContractDeployed) {
      return { ok: false, error: '合约未部署或钱包未连接' };
    }
    
    try {
      const amountWei = parseUnits(amount.toString(), 18);
      const tx = await signerContractRef.current.depositCredits(amountWei);
      await tx.wait();
      await refreshUserData();
      return { ok: true };
    } catch (err) {
      const msg = toFriendlyTxError(err);
      setState(prev => ({ ...prev, error: msg }));
      return { ok: false, error: msg };
    }
  }, [refreshUserData, isContractDeployed]);

  // 领取奖励
  const claimPrize = useCallback(async (): Promise<boolean> => {
    if (!signerContractRef.current || !isContractDeployed) return false;
    
    try {
      const tx = await signerContractRef.current.claimPrize();
      await tx.wait();
      await refreshUserData();
      return true;
    } catch (err) {
      console.error('[CyberPlinko] Claim failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return false;
    }
  }, [refreshUserData, isContractDeployed]);

  // 取消卡住的请求
  const cancelStuckRequest = useCallback(async (): Promise<boolean> => {
    if (!signerContractRef.current || !isContractDeployed) return false;
    
    try {
      const tx = await signerContractRef.current.cancelStuckRequest();
      await tx.wait();
      await refreshUserData();
      setCurrentDropRequest(null);
      return true;
    } catch (err) {
      console.error('[CyberPlinko] Cancel failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err) }));
      return false;
    }
  }, [refreshUserData, isContractDeployed]);

  // 监听 DropResult 事件
  useEffect(() => {
    if (!isContractDeployed || !readOnlyContractRef.current || !address || !currentDropRequest) return;
    
    const contract = readOnlyContractRef.current;
    const provider = contract.runner?.provider as JsonRpcProvider;
    if (!provider) return;
    
    let isCancelled = false;
    
    const pollForResult = async () => {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = lastDropResultBlockRef.current ?? currentBlock - 100;
      
      try {
        const filter = contract.filters.DropResult(address);
        const logs = await contract.queryFilter(filter, fromBlock, currentBlock);
        
        for (const log of logs) {
          const parsed = contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          
          if (parsed && parsed.args.requestId === currentDropRequest) {
            const result = {
              slotIndex: Number(parsed.args.slotIndex),
              winAmount: formatEther(parsed.args.winAmount),
              rewardType: Number(parsed.args.rewardType),
            };
            
            setLastDropResult(result);
            setCurrentDropRequest(null);
            
            const event: DropResultEvent = {
              player: address,
              requestId: parsed.args.requestId,
              slotIndex: result.slotIndex,
              winAmount: parsed.args.winAmount,
              rewardType: result.rewardType,
              timestamp: Date.now(),
              txHash: log.transactionHash,
            };
            
            setRecentDrops(prev => [event, ...prev.slice(0, 19)]);
            await refreshData();
            return;
          }
        }
        
        lastDropResultBlockRef.current = currentBlock;
      } catch (err) {
        console.error('[CyberPlinko] Poll error:', err);
      }
      
      if (!isCancelled && currentDropRequest) {
        setTimeout(pollForResult, 3000);
      }
    };
    
    pollForResult();
    
    return () => {
      isCancelled = true;
    };
  }, [address, currentDropRequest, isContractDeployed, refreshData]);

  // 初始化
  useEffect(() => {
    if (isConnected && isContractDeployed) {
      initSignerContracts();
    }
  }, [isConnected, isContractDeployed, initSignerContracts]);

  useEffect(() => {
    if (isContractDeployed) {
      refreshData();
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [refreshData, isContractDeployed]);

  return {
    ...state,
    drop,
    claimPrize,
    approveToken,
    depositCredits,
    cancelStuckRequest,
    refreshData,
    recentDrops,
    isDropping,
    currentDropRequest,
    lastDropResult,
    isContractDeployed,
  };
}
