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
  txHash?: string;
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
  depositCredits: (amount: number) => Promise<{ ok: boolean; error?: string }>;
  cancelStuckRequest: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  recentWins: SpinResultEvent[];
  isSpinning: boolean;
  currentSpinRequest: bigint | null;
}

const USE_TESTNET = false; // 使用主网

// BSC 主网公共 RPC（支持浏览器 CORS）
const BSC_RPC_URL = 'https://bsc.publicnode.com';

type TxErrorLike = {
  code?: string;
  shortMessage?: string;
  message?: string;
  info?: { error?: { message?: string } };
};

function compactEthersMessage(raw: string): string {
  // 只取第一行，并移除 ethers 常见的巨大 transaction 对象片段
  let msg = raw.split('\n')[0]?.trim() ?? '';
  msg = msg.replace(/\s*\(action=.*$/, '').trim();
  msg = msg.replace(/\s*\(estimateGas\).*$/, '').trim();
  msg = msg.replace(/\s*transaction=\{.*$/, '').trim();
  msg = msg.replace(/\s*data=0x[0-9a-fA-F]+.*$/, '').trim();

  // 提取 execution reverted 的原因
  const revertedMatch = msg.match(/execution reverted(?::\s*(.*))?/i);
  if (revertedMatch) {
    const reason = revertedMatch[1]?.trim();
    return reason ? `合约回滚：${reason}` : '合约回滚：条件不满足';
  }

  return msg || raw;
}

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

  const compact = compactEthersMessage(raw);
  const lower = compact.toLowerCase();

  if (lower.includes('insufficient funds')) {
    return 'BNB Gas 不足：请确保钱包里有足够 BNB 支付手续费';
  }

  // 常见链上回滚原因（来自合约 revert string / 节点提示）
  if (lower.includes('prize pool too low') || lower.includes('pool too low')) {
    return '奖池可用余额不足，暂时无法开始游戏（可尝试降低投注档位或等待奖池增加）';
  }
  if (lower.includes('pending request') || lower.includes('has pending')) {
    return '你有一笔待处理的旋转请求：请等待 VRF 回调；如超过 1 小时可使用“解除卡住请求”';
  }
  if (lower.includes('wrong network') || lower.includes('chain')) {
    return '网络不匹配：请切换到 BNB Smart Chain（BSC 主网，ChainId 56）';
  }

  return compact;
}

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

  // SpinResult 事件轮询：记录上次已处理的区块高度（避免依赖 RPC 的 filter 机制）
  const lastSpinResultBlockRef = useRef<number | null>(null);

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
      // 额外网络校验
      const provider = providerRef.current;
      if (provider) {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const expected = USE_TESTNET ? 97 : 56;
        if (chainId !== expected) {
          const msg = `网络不匹配：当前 ChainId ${chainId}，请切换到 ${expected === 56 ? 'BSC 主网(56)' : 'BSC 测试网(97)'}`;
          setState(prev => ({ ...prev, error: msg }));
          setIsSpinning(false);
          return null;
        }
      }

      const betAmountWei = parseUnits(betAmount.toString(), 18);
      const slots = signerContractRef.current;
      
      // === 预检查：在调用 spin 前验证所有条件 ===
      console.log('[CyberSlots] Pre-spin checks starting...');
      
      // 1. 检查投注金额是否有效
      const isValidBet = await slots.isValidBetAmount(betAmountWei);
      console.log('[CyberSlots] isValidBetAmount:', isValidBet, 'betAmount:', betAmount);
      if (!isValidBet) {
        const msg = `无效投注金额：${betAmount}，只能选择 10K/25K/50K/100K/250K`;
        setState(prev => ({ ...prev, error: msg }));
        setIsSpinning(false);
        return null;
      }
      
      // 2. 检查是否有挂起请求
      const pendingReq = await slots.pendingRequest(address);
      console.log('[CyberSlots] pendingRequest on-chain:', pendingReq.toString());
      if (pendingReq > 0n) {
        const msg = '你有未完成的游戏请求，请等待 VRF 回调或手动取消';
        setState(prev => ({ ...prev, error: msg }));
        setIsSpinning(false);
        return null;
      }
      
      // 3. 检查游戏凭证余额
      const credits = await slots.gameCredits(address);
      const creditsNum = parseFloat(formatEther(credits));
      console.log('[CyberSlots] gameCredits on-chain:', creditsNum, 'need:', betAmount);
      if (credits < betAmountWei) {
        const msg = `游戏凭证不足：当前 ${creditsNum.toLocaleString()}，需要 ${betAmount.toLocaleString()}`;
        setState(prev => ({ ...prev, error: msg }));
        setIsSpinning(false);
        return null;
      }
      
      // 4. 检查奖池
      const availablePool = await slots.getAvailablePool();
      const minPrizePool = parseUnits('0.001', 18);
      console.log('[CyberSlots] availablePool:', formatEther(availablePool), 'BNB');
      if (availablePool < minPrizePool) {
        const msg = `奖池不足：当前 ${formatEther(availablePool)} BNB，需要至少 0.001 BNB`;
        setState(prev => ({ ...prev, error: msg }));
        setIsSpinning(false);
        return null;
      }
      
      console.log('[CyberSlots] All pre-checks passed! Calling spin...');
      
      const tx = await slots.spin(betAmountWei);
      console.log('[CyberSlots] spin tx hash:', tx.hash);
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
      console.error('[CyberSlots] Spin failed:', err);
      console.error('[CyberSlots] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));
      
      const e = err as {
        code?: string;
        shortMessage?: string;
        message?: string;
        reason?: string;
        info?: { error?: { message?: string } };
      };
      console.error('[CyberSlots] Error details:', {
        code: e?.code,
        shortMessage: e?.shortMessage,
        reason: e?.reason,
        infoError: e?.info?.error,
      });
      
      const msg = toFriendlyTxError(err, '开始游戏失败');
      setState(prev => ({ ...prev, error: msg }));
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

  const depositCredits = useCallback(async (amount: number): Promise<{ ok: boolean; error?: string }> => {
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
        const msg = '未检测到可用钱包 Provider，请重新连接钱包';
        setState(prev => ({ ...prev, error: msg }));
        return { ok: false, error: msg };
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
      console.log('[CyberSlots] amountWei:', amountWei.toString());

      // 先检查授权
      const spender = slotsAddress;
      console.log('[CyberSlots] checking allowance, spender:', spender);
      const allowance = await token.allowance(address, spender);
      console.log('[CyberSlots] allowance before:', allowance.toString());

      if (allowance < amountWei) {
        console.log('[CyberSlots] Need to approve, allowance < amountWei');
        
        // 兼容部分代币：非 0 -> 非 0 授权可能会 revert（先置 0 再授权）
        if (allowance > 0n) {
          console.log('[CyberSlots] Resetting allowance to 0 first...');
          try {
            const resetTx = await token.approve(spender, 0n);
            console.log('[CyberSlots] approve reset tx:', resetTx.hash);
            await resetTx.wait();
          } catch (resetErr) {
            console.error('[CyberSlots] Reset approve failed:', resetErr);
          }
        }

        console.log('[CyberSlots] Calling token.approve...');
        try {
          const approveTx = await token.approve(spender, amountWei);
          console.log('[CyberSlots] approve tx:', approveTx.hash);
          await approveTx.wait();
          console.log('[CyberSlots] approve tx confirmed');
        } catch (approveErr: unknown) {
          console.error('[CyberSlots] Approve failed:', approveErr);
          const ae = approveErr as { code?: string; shortMessage?: string; message?: string };
          if (ae?.code === 'ACTION_REJECTED') {
            return { ok: false, error: '你在钱包里取消了授权' };
          }
          const approveMsg = ae?.shortMessage || ae?.message || '授权失败';
          return { ok: false, error: `授权失败: ${approveMsg}` };
        }

        // 二次校验
        const allowanceAfter = await token.allowance(address, spender);
        console.log('[CyberSlots] allowance after:', allowanceAfter.toString());
        if (allowanceAfter < amountWei) {
          const msg = '授权未生效：请确认授权对象是"游戏合约地址"，并重试';
          setState(prev => ({ ...prev, error: msg }));
          return { ok: false, error: msg };
        }
      } else {
        console.log('[CyberSlots] Already approved, skipping approve step');
      }

      console.log('[CyberSlots] calling slots.depositCredits...');
      const tx = await slots.depositCredits(amountWei);
      console.log('[CyberSlots] depositCredits tx:', tx.hash);
      await tx.wait();

      await refreshData();
      return { ok: true };
    } catch (err: unknown) {
      console.error('[CyberSlots] Deposit credits failed:', err);
      console.error('[CyberSlots] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));

      const e = err as {
        code?: string;
        shortMessage?: string;
        message?: string;
        reason?: string;
        data?: string;
        info?: { error?: { message?: string; data?: string } };
      };

      // 提取更多错误信息用于调试
      console.error('[CyberSlots] Error details:', {
        code: e?.code,
        shortMessage: e?.shortMessage,
        reason: e?.reason,
        data: e?.data,
        infoError: e?.info?.error,
      });

      let msg = '兑换失败：交易被合约回滚';
      
      // 检查具体的 revert 原因
      const fullMessage = [e?.shortMessage, e?.reason, e?.message, e?.info?.error?.message].join(' ').toLowerCase();
      
      if (e?.code === 'ACTION_REJECTED') {
        msg = '你在钱包里取消了授权/交易';
      } else if (fullMessage.includes('insufficient funds')) {
        msg = 'BNB Gas 不足：请确保钱包有足够 BNB 支付手续费';
      } else if (fullMessage.includes('paused')) {
        msg = '合约已暂停：请联系管理员';
      } else if (fullMessage.includes('insufficient token balance')) {
        msg = '代币余额不足';
      } else if (fullMessage.includes('insufficient allowance')) {
        msg = '授权额度不足，请先授权';
      } else if (fullMessage.includes('token transfer failed')) {
        msg = '代币转账失败：可能是代币合约限制';
      } else if (typeof e?.shortMessage === 'string' && e.shortMessage.trim()) {
        msg = e.shortMessage;
      } else if (typeof e?.reason === 'string' && e.reason.trim()) {
        msg = `合约回滚：${e.reason}`;
      } else if (typeof e?.info?.error?.message === 'string' && e.info.error.message.trim()) {
        msg = e.info.error.message;
      } else if (typeof e?.message === 'string' && e.message.trim()) {
        // 从 message 中提取 revert 原因
        const revertMatch = e.message.match(/reverted with reason string '([^']+)'/);
        if (revertMatch) {
          msg = `合约回滚：${revertMatch[1]}`;
        } else {
          msg = e.message.split('\n')[0].substring(0, 100);
        }
      }

      setState(prev => ({ ...prev, error: msg }));
      return { ok: false, error: msg };
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
    } catch (err: unknown) {
      console.error('Cancel request failed:', err);
      setState(prev => ({ ...prev, error: toFriendlyTxError(err, '解除卡住请求失败') }));
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

  // 监听 SpinResult 事件（使用轮询 queryFilter，避免部分公共 RPC 不支持/不稳定的 filters）
  useEffect(() => {
    const contract = readOnlyContractRef.current;
    if (!contract) return;

    let cancelled = false;

    const handleSpinResult = (
      player: string,
      requestId: bigint,
      symbols: number[],
      winAmount: bigint,
      prizeType: string,
      txHash?: string
    ) => {
      const event: SpinResultEvent = {
        player,
        requestId,
        symbols: Array.from(symbols),
        winAmount,
        prizeType,
        timestamp: Date.now(),
        txHash,
      };

      setRecentWins(prev => [event, ...prev].slice(0, 20));

      if (address && player.toLowerCase() === address.toLowerCase()) {
        setIsSpinning(false);
        setCurrentSpinRequest(null);
        refreshData();
      }
    };

    const filter = contract.filters.SpinResult();

    const poll = async () => {
      try {
        const runner = contract.runner as unknown as { getBlockNumber?: () => Promise<number> };
        if (!runner?.getBlockNumber) return;

        const latest = await runner.getBlockNumber();

        // 首次启动时回溯一小段区块，避免漏掉刚发生的事件
        const from = lastSpinResultBlockRef.current ?? Math.max(0, latest - 2000);
        const to = latest;

        const events = await contract.queryFilter(filter, from, to);
        if (cancelled) return;

        for (const ev of events) {
          const logEvent = ev as unknown as { 
            args?: {
              player: string;
              requestId: bigint;
              symbols: number[];
              winAmount: bigint;
              prizeType: string;
            };
            transactionHash?: string;
          };
          const args = logEvent.args;
          const txHash = logEvent.transactionHash;

          if (!args) continue;
          handleSpinResult(args.player, args.requestId, args.symbols, args.winAmount, args.prizeType, txHash);
        }

        // 下一次从最新区块的下一块开始拉取，减少重复
        lastSpinResultBlockRef.current = to + 1;
      } catch (e) {
        // 公共 RPC 偶发失败时不影响主流程
        console.warn('[CyberSlots] SpinResult poll failed:', e);
      }
    };

    poll();
    const interval = setInterval(poll, 8000);

    return () => {
      cancelled = true;
      clearInterval(interval);
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

export function formatPrizeType(prizeType: string, language: 'zh' | 'en' = 'zh'): { name: string; emoji: string } {
  const prizeMap = PRIZE_TYPE_MAP[prizeType] || PRIZE_TYPE_MAP.none;
  
  // 英文翻译映射
  const englishNames: Record<string, string> = {
    '超级头奖': 'Super Jackpot',
    '头奖': 'Jackpot',
    '一等奖': '1st Prize',
    '二等奖': '2nd Prize',
    '三等奖': '3rd Prize',
    '小奖': 'Small Win',
    '安慰奖': 'Consolation',
    '未中奖': 'No Win',
  };
  
  if (language === 'en' && englishNames[prizeMap.name]) {
    return { name: englishNames[prizeMap.name], emoji: prizeMap.emoji };
  }
  
  return prizeMap;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
