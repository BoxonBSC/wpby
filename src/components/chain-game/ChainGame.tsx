import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import butterflyLogo from '@/assets/butterfly-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Users, Zap, Crown, ArrowUp, Wallet, Coins, Timer, CalendarClock, Copy, ExternalLink, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
import { ethers } from 'ethers';
import { 
  CYBER_CHAIN_GAME_ADDRESS, 
  CYBER_CHAIN_GAME_ABI, 
  CYBER_TOKEN_ADDRESS, 
  CYBER_TOKEN_ABI,
  CHAIN_GAME_DYNAMIC_TIERS 
} from '@/config/contracts';
import { toast } from 'sonner';
import { RoundHistory } from './RoundHistory';
import { BidHistory } from './BidHistory';
import { GameRules } from './GameRules';
import { BidSuccessParticles } from './BidSuccessParticles';
import { AnimatedBidButton } from './AnimatedBidButton';
import { WinCelebration } from './WinCelebration';

// 游戏配置
const GAME_CONFIG = {
  roundDurationMinutes: 30,
  startPrice: 10000,
  minPrice: 10000,
  platformFee: 5,
};

const getCurrentTier = (participants: number) => {
   return CHAIN_GAME_DYNAMIC_TIERS.find(tier => 
    participants >= tier.minPlayers && participants <= tier.maxPlayers
   ) || CHAIN_GAME_DYNAMIC_TIERS[0];
};

const GAME_CONTRACT = CYBER_CHAIN_GAME_ADDRESS.mainnet;
const TOKEN_CONTRACT = CYBER_TOKEN_ADDRESS.mainnet;

const getEthereumProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum as unknown as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
  return null;
};

const getDefaultEndTime = () => {
  return new Date(Date.now() + 30 * 60 * 1000);
};

const formatHourMinute = (date: Date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export function ChainGame() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [nextDrawTime, setNextDrawTime] = useState(getDefaultEndTime());
  const [isEnded, setIsEnded] = useState(false);
  const [isTaking, setIsTaking] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [showWallet, setShowWallet] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [bidSuccessTrigger, setBidSuccessTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, address, disconnect, balance: walletBalance } = useWallet();

  const [roundData, setRoundData] = useState({
    roundId: 0,
    currentHolder: '',
    currentBid: BigInt(0),
    prizePool: BigInt(0),
    participantCount: 0,
    minBid: BigInt(0),
    settled: false,
  });
  const [bidHistory, setBidHistory] = useState<Array<{ address: string; bid: string; time: string }>>([]);
  const [playerStats, setPlayerStats] = useState({ wins: 0, earnings: '0', burned: '0', pending: '0' });
  const [hasParticipated, setHasParticipated] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [tokenSymbol, setTokenSymbol] = useState<string>('CYBER');
  const [tokenSet, setTokenSet] = useState<boolean | null>(null);

  const currentTier = useMemo(() => getCurrentTier(roundData.participantCount), [roundData.participantCount]);
  const prizePoolBNB = Number(ethers.formatEther(roundData.prizePool));
  const grossWinnerAmount = prizePoolBNB * currentTier.winnerRate / 100;
  const platformFee = grossWinnerAmount * GAME_CONFIG.platformFee / 100;
  const winnerAmount = (grossWinnerAmount - platformFee).toFixed(4);
  const rolloverAmount = (prizePoolBNB * (100 - currentTier.winnerRate) / 100).toFixed(4);

  const currentBidFormatted = Number(ethers.formatEther(roundData.currentBid)).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const minBidFormatted = Number(ethers.formatEther(roundData.minBid)).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const tokenBalanceNum = Number(tokenBalance.replace(/,/g, ''));
  const minBidNum = Number(ethers.formatEther(roundData.minBid));

  // fetchContractData function - lines 91-184
  const fetchContractData = async () => {
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      setIsLoading(false);
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(GAME_CONTRACT, CYBER_CHAIN_GAME_ABI, provider);
      
      try {
        const isTokenSet = await contract.tokenSet();
        setTokenSet(isTokenSet);
      } catch (e) {
        console.warn('Failed to check tokenSet:', e);
      }
      
      const [roundId, startTime, endTime, prizePool, currentBid, currentHolder, participantCount, settled] = 
        await contract.getCurrentRound();
      
      const minBid = await contract.getMinBid();
     
      setRoundData({
        roundId: Number(roundId),
        currentHolder: currentHolder === ethers.ZeroAddress ? '' : currentHolder,
        currentBid: currentBid,
        prizePool: prizePool,
        participantCount: Number(participantCount),
        minBid: minBid,
        settled: settled,
      });
      
      const endDate = new Date(Number(endTime) * 1000);
      setNextDrawTime(endDate);
    
      const now = Date.now();
      if (now >= endDate.getTime() && !settled && Number(participantCount) > 0) {
        setIsEnded(true);
      } else {
        setIsEnded(false);
      }
      
      try {
        const recentBidsData = await contract.getRecentBids();
        const formattedBids = recentBidsData
          .filter((bid: { bidder: string; amount: bigint; timestamp: bigint }) => 
            bid.bidder !== ethers.ZeroAddress && bid.amount > 0
          )
          .map((bid: { bidder: string; amount: bigint; timestamp: bigint }) => ({
            address: bid.bidder,
            bid: ethers.formatEther(bid.amount),
            time: new Date(Number(bid.timestamp) * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            timestamp: Number(bid.timestamp),
          }))
          .sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)
          .slice(0, 10);
        setBidHistory(formattedBids);
      } catch (e) {
        console.warn('Failed to fetch recent bids:', e);
      }
      
      if (address) {
        const [wins, earnings, burned, pending] = await contract.getPlayerStats(address);
        setPlayerStats({
          wins: Number(wins),
          earnings: ethers.formatEther(earnings),
          burned: ethers.formatEther(burned),
          pending: ethers.formatEther(pending),
        });
       
        try {
          const participated = await contract.hasPlayerParticipated(address);
          setHasParticipated(participated);
        } catch (e) {
          console.warn('Failed to check participation:', e);
        }
       
        try {
          const tokenContract = new ethers.Contract(TOKEN_CONTRACT, CYBER_TOKEN_ABI, provider);
          const balance = await tokenContract.balanceOf(address);
          const symbol = await tokenContract.symbol();
          setTokenBalance(Number(ethers.formatEther(balance)).toLocaleString(undefined, { maximumFractionDigits: 0 }));
          setTokenSymbol(symbol);
        } catch (e) {
          console.warn('Failed to fetch token balance:', e);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch contract data:', error);
      setIsLoading(false);
    }
  };

  // all useEffect hooks - lines 186-256
  useEffect(() => {
    const ethereum = getEthereumProvider();
    if (!ethereum) return;
    
    const provider = new ethers.BrowserProvider(ethereum);
    const contract = new ethers.Contract(GAME_CONTRACT, CYBER_CHAIN_GAME_ABI, provider);
    
    const handleBidPlaced = (roundId: bigint, player: string, tokensBurned: bigint, newBid: bigint) => {
      setBidHistory(prev => [{
        address: player,
        bid: ethers.formatEther(tokensBurned),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev].slice(0, 10));
      
      fetchContractData();
    };
    
    const handleRoundSettled = (roundId: bigint, winner: string, prize: bigint) => {
      toast.success('本轮已结算！');
      fetchContractData();
      setBidHistory([]);
    };
   
    const handleSettlementBonus = (settler: string, amount: bigint) => {
      if (settler.toLowerCase() === address?.toLowerCase()) {
        toast.success(`🎁 获得结算奖励: ${ethers.formatEther(amount)} BNB`);
      }
    };
    
    contract.on('BidPlaced', handleBidPlaced);
    contract.on('RoundSettled', handleRoundSettled);
    contract.on('SettlementBonusPaid', handleSettlementBonus);
    
    return () => {
      contract.off('BidPlaced', handleBidPlaced);
      contract.off('RoundSettled', handleRoundSettled);
      contract.off('SettlementBonusPaid', handleSettlementBonus);
    };
  }, [address]);

  useEffect(() => {
    fetchContractData();
    const pollInterval = isEnded ? 5000 : 30000;
    const interval = setInterval(fetchContractData, pollInterval);
    return () => clearInterval(interval);
  }, [address, isEnded]);

  useEffect(() => {
    const updateCountdown = () => {
      // 无人参与时，始终显示满轮时间（30分钟）
      if (roundData.participantCount === 0) {
        setTimeLeft(GAME_CONFIG.roundDurationMinutes * 60);
        setIsEnded(false);
        return;
      }

      const now = new Date();
      const diff = Math.max(0, Math.floor((nextDrawTime.getTime() - now.getTime()) / 1000));
      
      if (diff <= 0 && !roundData.settled) {
        setIsEnded(true);
      } else if (diff > 0) {
        setIsEnded(false);
      }
      
      setTimeLeft(diff);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextDrawTime, roundData.participantCount, roundData.settled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const isLastFiveMinutes = timeLeft <= 300 && timeLeft > 0;

  // handleTakeover and handleClaimRewards - lines 263-337
  const handleTakeover = async () => {
    if (!isConnected) {
      setShowWallet(true);
      return;
    }
    
    const inputAmount = bidAmount ? Number(bidAmount) : 0;
    if (inputAmount < minBidNum) {
      toast.error(`最低出价 ${minBidFormatted} 代币`);
      return;
    }
    if (inputAmount > tokenBalanceNum && tokenBalanceNum > 0) {
      toast.error('余额不足');
      return;
    }
    
    const bidValue = ethers.parseEther(inputAmount.toString());
    
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      toast.error('请安装钱包');
      return;
    }
    
    setIsTaking(true);
    
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT, CYBER_TOKEN_ABI, signer);
      const gameContract = new ethers.Contract(GAME_CONTRACT, CYBER_CHAIN_GAME_ABI, signer);
      
      const allowance = await tokenContract.allowance(address, GAME_CONTRACT);
      if (allowance < bidValue) {
        toast.loading('正在授权代币...');
        const approveTx = await tokenContract.approve(GAME_CONTRACT, ethers.MaxUint256);
        await approveTx.wait();
        toast.success('授权成功！');
      }
      
      toast.loading('正在出价...');
      const tx = await gameContract.placeBid(bidValue);
      await tx.wait();
      
      toast.success('出价成功！🔥');
      setBidAmount('');
      setBidSuccessTrigger(prev => prev + 1);
      fetchContractData();
    } catch (error: any) {
      console.error('Takeover failed:', error);
      toast.error(error.reason || '出价失败');
    } finally {
      setIsTaking(false);
    }
  };

  const handleClaimRewards = async () => {
    const ethereum = getEthereumProvider();
    if (!ethereum || Number(playerStats.pending) <= 0) return;
    
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const gameContract = new ethers.Contract(GAME_CONTRACT, CYBER_CHAIN_GAME_ABI, signer);
      toast.loading('正在领取奖励...');
      const tx = await gameContract.claimRewards();
      await tx.wait();
      toast.success('奖励已领取！');
      fetchContractData();
    } catch (error: any) {
      console.error('Claim failed:', error);
      toast.error(error.reason || '领取失败');
    }
  };

  const handleManualSettle = async () => {
    if (!isConnected) {
      setShowWallet(true);
      return;
    }
    
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      toast.error('请安装钱包');
      return;
    }
    
    setIsSettling(true);
    
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const gameContract = new ethers.Contract(GAME_CONTRACT, CYBER_CHAIN_GAME_ABI, signer);
      
      toast.loading('正在触发结算...');
      const tx = await gameContract.settleRound();
      await tx.wait();
      
      toast.success('结算成功！🎉 结算奖励已发放');
      fetchContractData();
    } catch (error: any) {
      console.error('Settlement failed:', error);
      if (error.reason?.includes('Already settled')) {
        toast.info('本轮已结算，等待新一轮开始');
        fetchContractData();
      } else {
        toast.error(error.reason || '结算失败，请稍后重试');
      }
    } finally {
      setIsSettling(false);
    }
  };

  // 维护模式
  const isMaintenanceMode = false;
  const bypassKey = new URLSearchParams(window.location.search).get('key');
  const showMaintenance = isMaintenanceMode && bypassKey !== 'cyber2024';

  if (showMaintenance) {
    return (
      <div className="min-h-screen bg-[#08060e] flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/[0.06] rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center max-w-lg mx-auto space-y-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-7xl"
          >
            🔧
          </motion.div>
          <h1 className="text-3xl font-display font-black text-white">
            系统维护中
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            蝴蝶竞拍正在进行系统升级与维护，预计很快恢复。
          </p>
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-400 text-sm">
            <Timer className="w-4 h-4 text-violet-400" />
            <span>维护期间所有功能暂停使用</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Countdown digit renderer
  const countdownDigits = formatTime(timeLeft).split('');

  return (
    <div className="min-h-screen bg-[#08060e] relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-purple-700/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Wallet modal — only for wallet selection (not connected) */}
      <AnimatePresence>
        {showWallet && !isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowWallet(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <WalletConnect />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown overlay to close */}
      {showWalletDropdown && isConnected && (
        <div className="fixed inset-0 z-40" onClick={() => setShowWalletDropdown(false)} />
      )}

      <BidSuccessParticles trigger={bidSuccessTrigger} />

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* ━━━ Header ━━━ */}
        <header className="flex items-center justify-between mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <img src={butterflyLogo} alt="蝴蝶竞拍" className="w-8 h-8 sm:w-9 sm:h-9" />
            <div>
              <h1 className="text-lg sm:text-xl font-display font-bold text-white leading-tight">蝴蝶竞拍</h1>
              <p className="text-[11px] text-neutral-600 hidden sm:block">燃烧代币 · 赢取BNB奖池</p>
            </div>
          </motion.div>

          {/* Wallet header button */}
          <div className="relative">
            <motion.button
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                if (isConnected) {
                  setShowWalletDropdown(prev => !prev);
                } else {
                  setShowWallet(true);
                }
              }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isConnected
                  ? 'bg-white/[0.04] border border-emerald-500/20 hover:border-violet-500/30 hover:bg-violet-500/[0.04]'
                  : 'bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 hover:bg-violet-500/[0.04]'
              } hover:shadow-[0_0_15px_rgba(139,92,246,0.08)]`}
            >
              {isConnected && address ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400/50 animate-ping" />
                  </div>
                  <span className="text-xs font-mono text-neutral-300 truncate">{shortenAddress(address)}</span>
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[11px] text-amber-400 font-bold tracking-wide">{tokenBalance} {tokenSymbol}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform ${showWalletDropdown ? 'rotate-180' : ''}`} />
                </div>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-xs text-neutral-400">连接钱包</span>
                </>
              )}
            </motion.button>

            {/* Connected wallet dropdown */}
            <AnimatePresence>
              {showWalletDropdown && isConnected && address && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                  className="absolute right-0 top-full mt-2 w-72 z-50 rounded-2xl overflow-hidden"
                >
                  {/* Border gradient */}
                  <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-b from-violet-500/25 via-white/[0.06] to-transparent">
                    <div className="w-full h-full rounded-2xl bg-[#0e0b18]" />
                  </div>

                  <div className="relative p-4 space-y-3">
                    {/* Address row */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-white">{shortenAddress(address)}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(address); toast.success('地址已复制'); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors group"
                        >
                          <Copy className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`https://bscscan.com/address/${address}`, '_blank'); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors group"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors" />
                        </button>
                      </div>
                    </div>

                    {/* Balance cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                        <div className="text-[10px] text-neutral-400 mb-1">BNB 余额</div>
                        <div className="text-base font-extrabold text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">{Number(walletBalance).toFixed(4)}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                        <div className="text-[10px] text-neutral-400 mb-1">{tokenSymbol}</div>
                        <div className="text-base font-extrabold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">{tokenBalance}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    {(playerStats.wins > 0 || Number(playerStats.pending) > 0) && (
                      <div className="p-2.5 rounded-xl bg-violet-500/[0.04] border border-violet-500/10 space-y-1.5">
                        {playerStats.wins > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400 flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400" /> 胜场</span>
                            <span className="text-white font-medium">{playerStats.wins}</span>
                          </div>
                        )}
                        {Number(playerStats.pending) > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400 flex items-center gap-1"><Zap className="w-3 h-3 text-violet-400" /> 待领取</span>
                            <span className="text-violet-300 font-bold">{Number(playerStats.pending).toFixed(4)} BNB</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowWalletDropdown(false);
                          disconnect();
                          setTimeout(() => setShowWallet(true), 100);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] py-2 rounded-lg transition-all bg-white/[0.04] border border-white/[0.06] text-neutral-400 hover:border-violet-500/30 hover:text-violet-400"
                      >
                        <Wallet className="w-3 h-3" />
                        切换钱包
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowWalletDropdown(false);
                          disconnect();
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] py-2 rounded-lg transition-all bg-red-500/[0.06] border border-red-500/15 text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <LogOut className="w-3 h-3" />
                        断开连接
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Token set indicator */}
        {tokenSet !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${
              tokenSet
                ? 'bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-400'
                : 'bg-red-500/[0.06] border border-red-500/15 text-red-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${tokenSet ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {tokenSet ? '代币已绑定' : '代币未绑定 — 请调用 setToken()'}
          </motion.div>
        )}

        {/* ━━━ Main Grid ━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* ——— Left Column: Auction ——— */}
          <div className="lg:col-span-7 space-y-4">
            {/* Prize Pool Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden"
            >
              {/* Gradient border glow — pulses in last 5 min */}
              <motion.div
                className="absolute inset-0 rounded-2xl p-px"
                animate={
                  isLastFiveMinutes
                    ? {
                        background: timeLeft <= 60
                          ? [
                              'linear-gradient(135deg, rgba(248,113,113,0.5), rgba(139,92,246,0.2), rgba(248,113,113,0.4))',
                              'linear-gradient(135deg, rgba(248,113,113,0.2), rgba(248,113,113,0.5), rgba(139,92,246,0.3))',
                              'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(248,113,113,0.2), rgba(248,113,113,0.5))',
                            ]
                          : [
                              'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(168,85,247,0.15), rgba(139,92,246,0.35))',
                              'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(139,92,246,0.4), rgba(168,85,247,0.3))',
                              'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(168,85,247,0.3), rgba(139,92,246,0.4))',
                            ],
                      }
                    : {
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.1), rgba(139,92,246,0.2))',
                      }
                }
                transition={isLastFiveMinutes ? { duration: timeLeft <= 60 ? 0.8 : 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
              >
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#0e0b18] via-[#0c0a14] to-[#0a0812]" />
              </motion.div>

              {/* Last-minute outer glow pulse */}
              {isLastFiveMinutes && (
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow: timeLeft <= 60
                      ? [
                          '0 0 20px rgba(248,113,113,0.15), inset 0 0 30px rgba(248,113,113,0.05)',
                          '0 0 40px rgba(248,113,113,0.3), inset 0 0 50px rgba(248,113,113,0.1)',
                          '0 0 20px rgba(248,113,113,0.15), inset 0 0 30px rgba(248,113,113,0.05)',
                        ]
                      : [
                          '0 0 15px rgba(139,92,246,0.1), inset 0 0 20px rgba(139,92,246,0.03)',
                          '0 0 35px rgba(139,92,246,0.25), inset 0 0 40px rgba(139,92,246,0.08)',
                          '0 0 15px rgba(139,92,246,0.1), inset 0 0 20px rgba(139,92,246,0.03)',
                        ],
                  }}
                  transition={{ duration: timeLeft <= 60 ? 0.6 : 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Subtle inner glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

              <div className="relative p-5 sm:p-7">
                {/* Status tags */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <motion.span
                    className={`px-3 py-1 rounded-full text-[11px] font-medium border ${
                      isLastFiveMinutes
                        ? timeLeft <= 60
                          ? 'bg-red-500/15 border-red-500/30 text-red-400'
                          : 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                        : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                    }`}
                    animate={isLastFiveMinutes ? { opacity: [1, 0.6, 1] } : {}}
                    transition={isLastFiveMinutes ? { duration: timeLeft <= 60 ? 0.5 : 1.5, repeat: Infinity } : {}}
                  >
                    <Flame className="w-3 h-3 inline mr-1" />
                    {roundData.participantCount === 0 ? '⏳ 等待首位出价' : timeLeft <= 60 ? '🔥 最后一分钟' : isLastFiveMinutes ? '⚡ 最后冲刺' : '竞拍进行中'}
                  </motion.span>
                  <span className="text-[11px] text-neutral-600">{roundData.participantCount} 人参与</span>
                  {hasParticipated && isConnected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      ✓ 已参与
                    </span>
                  )}
                  <span className="ml-auto px-2.5 py-1 rounded-full text-[11px] bg-gradient-to-r from-yellow-500/[0.06] to-violet-500/[0.06] border border-yellow-500/15 text-yellow-400">
                    {currentTier.label} · {currentTier.winnerRate}%
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {!isEnded ? (
                    <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* Prize Pool Display */}
                      <div className="mb-6">
                        <p className="text-[11px] text-violet-400/60 uppercase tracking-[0.2em] font-medium mb-2">BNB 奖池</p>
                        <div className="flex items-baseline gap-3">
                          <span
                            className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.3))' }}
                          >
                            {prizePoolBNB.toFixed(4)}
                          </span>
                          <span className="text-sm text-violet-400/50 font-bold uppercase tracking-wider">BNB</span>
                        </div>
                        <div className="mt-2 h-px bg-gradient-to-r from-violet-500/30 via-violet-500/10 to-transparent" />
                      </div>

                      {/* Countdown */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <motion.div
                            animate={isLastFiveMinutes ? { scale: [1, 1.2, 1] } : {}}
                            transition={isLastFiveMinutes ? { duration: 1, repeat: Infinity } : {}}
                          >
                            <CalendarClock className={`w-3.5 h-3.5 ${isLastFiveMinutes ? (timeLeft <= 60 ? 'text-red-400' : 'text-violet-400') : 'text-neutral-600'}`} />
                          </motion.div>
                          <span className={`text-xs font-medium ${isLastFiveMinutes ? (timeLeft <= 60 ? 'text-red-400' : 'text-violet-300') : 'text-neutral-600'}`}>
                            {roundData.participantCount === 0 ? '首位出价后开始倒计时' : timeLeft <= 60 ? '🔥 最后倒计时！' : isLastFiveMinutes ? '⚡ 最后冲刺' : '距离开奖'}
                          </span>
                          <span className="text-xs text-violet-400/80 font-medium ml-auto">
                            开奖 {formatHourMinute(nextDrawTime)}
                          </span>
                        </div>

                        {/* Digit Cards */}
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {countdownDigits.map((char, i) =>
                            char === ':' ? (
                              <span key={i} className="text-xl sm:text-2xl text-violet-400/40 font-bold mx-0.5 animate-pulse">:</span>
                            ) : (
                              <motion.div
                                key={i}
                                animate={
                                  isLastFiveMinutes
                                    ? {
                                        borderColor: timeLeft <= 60
                                          ? ['rgba(248,113,113,0.4)', 'rgba(248,113,113,0.7)', 'rgba(248,113,113,0.4)']
                                          : ['rgba(139,92,246,0.25)', 'rgba(139,92,246,0.5)', 'rgba(139,92,246,0.25)'],
                                        boxShadow: timeLeft <= 60
                                          ? ['0 0 8px rgba(248,113,113,0.1)', '0 0 20px rgba(248,113,113,0.25)', '0 0 8px rgba(248,113,113,0.1)']
                                          : ['0 0 8px rgba(139,92,246,0.05)', '0 0 18px rgba(139,92,246,0.15)', '0 0 8px rgba(139,92,246,0.05)'],
                                      }
                                    : {}
                                }
                                transition={isLastFiveMinutes ? { duration: timeLeft <= 60 ? 0.6 : 1.8, repeat: Infinity, ease: 'easeInOut' } : {}}
                                className={`w-12 h-16 sm:w-16 sm:h-20 rounded-xl flex items-center justify-center backdrop-blur-sm border ${
                                  isLastFiveMinutes
                                    ? timeLeft <= 60
                                      ? 'bg-gradient-to-b from-red-500/15 to-red-600/[0.06] border-red-500/40'
                                      : 'bg-gradient-to-b from-violet-500/15 to-violet-600/[0.06] border-violet-500/25'
                                    : 'bg-gradient-to-b from-white/[0.05] to-white/[0.02] border-white/[0.08]'
                                }`}
                              >
                                <motion.span
                                  className={`text-2xl sm:text-4xl font-mono font-bold ${
                                    isLastFiveMinutes
                                      ? timeLeft <= 60 ? 'text-red-400' : 'text-violet-200'
                                      : 'text-white'
                                  }`}
                                  animate={timeLeft <= 60 ? { opacity: [1, 0.5, 1] } : {}}
                                  transition={timeLeft <= 60 ? { duration: 0.5, repeat: Infinity } : {}}
                                >
                                  {char}
                                </motion.span>
                              </motion.div>
                            )
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4 h-1.5 bg-white/[0.04] rounded-full overflow-hidden relative">
                          <motion.div
                            className={`h-full rounded-full ${
                              timeLeft <= 60
                                ? 'bg-gradient-to-r from-red-500 to-red-400'
                                : isLastFiveMinutes
                                  ? 'bg-gradient-to-r from-violet-500 to-purple-400'
                                  : 'bg-violet-600/60'
                            }`}
                            animate={{ width: `${Math.min(100, (timeLeft / 1800) * 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                          {isLastFiveMinutes && (
                            <motion.div
                              className={`absolute top-0 h-full rounded-full ${timeLeft <= 60 ? 'bg-red-400/40' : 'bg-violet-400/30'}`}
                              animate={{
                                width: [`${Math.min(100, (timeLeft / 1800) * 100)}%`, `${Math.min(100, (timeLeft / 1800) * 100 + 2)}%`],
                                opacity: [0.3, 0.8, 0.3],
                              }}
                              transition={{ duration: timeLeft <= 60 ? 0.4 : 1.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Winner & Rollover info */}
                      <div className="flex flex-wrap gap-2.5 text-xs">
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-yellow-500/[0.08] to-yellow-600/[0.04] border border-yellow-500/15">
                          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-neutral-400">赢家获得</span>
                          <span className="text-yellow-300 font-bold" style={{ textShadow: '0 0 12px rgba(250,204,21,0.3)' }}>{winnerAmount} BNB</span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-violet-500/[0.08] to-violet-600/[0.04] border border-violet-500/15">
                          <ArrowUp className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-neutral-400">滚入下轮</span>
                          <span className="text-violet-300 font-bold">{rolloverAmount} BNB</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="ended" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <WinCelebration
                        winnerAddress={roundData.currentHolder || '0x0'}
                        winnerAmount={winnerAmount}
                        prizePoolBNB={prizePoolBNB}
                        onManualSettle={isConnected ? handleManualSettle : undefined}
                        isSettling={isSettling}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Current Holder */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-yellow-500/[0.04] via-transparent to-transparent border border-yellow-500/[0.08]">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <span className="text-xs text-neutral-500">当前最高出价者</span>
              <span className="font-mono text-xs text-white font-medium ml-auto">
                {roundData.currentHolder ? shortenAddress(roundData.currentHolder) : '—'}
              </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Coins className="w-3.5 h-3.5" />, label: '当前出价', value: currentBidFormatted, unit: '代币', color: 'violet' as const },
                { icon: <ArrowUp className="w-3.5 h-3.5" />, label: '最低出价', value: minBidFormatted, unit: '不设上限', color: 'emerald' as const },
              ].map((stat, i) => (
                <div key={i} className={`relative p-3.5 rounded-xl overflow-hidden border ${
                  stat.color === 'violet' 
                    ? 'bg-gradient-to-br from-violet-500/[0.06] to-transparent border-violet-500/10' 
                    : 'bg-gradient-to-br from-emerald-500/[0.06] to-transparent border-emerald-500/10'
                }`}>
                  <div className={`flex items-center gap-1.5 text-[11px] mb-1.5 ${
                    stat.color === 'violet' ? 'text-violet-400/60' : 'text-emerald-400/60'
                  }`}>
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div className={`text-xl font-display font-bold ${
                    stat.color === 'violet' ? 'text-violet-300' : 'text-emerald-300'
                  }`}>{stat.value}</div>
                  <div className="text-[10px] text-neutral-600 mt-0.5">{stat.unit}</div>
                </div>
              ))}
            </div>

            {/* Tier Ladder Preview */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 mb-2.5">
                <Users className="w-3 h-3" />
                参与人数越多，赢家奖金越高
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {CHAIN_GAME_DYNAMIC_TIERS.map((tier) => {
                  const isActive = roundData.participantCount >= tier.minPlayers && 
                    roundData.participantCount <= (tier.maxPlayers === Infinity ? 9999 : tier.maxPlayers);
                  const tierGross = prizePoolBNB * tier.winnerRate / 100;
                  const tierNet = (tierGross - tierGross * GAME_CONFIG.platformFee / 100).toFixed(4);
                  return (
                    <div
                      key={tier.minPlayers}
                      className={`flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-lg text-center transition-all ${
                        isActive
                          ? 'bg-violet-500/10 border border-violet-500/25 shadow-[0_0_12px_rgba(139,92,246,0.06)]'
                          : 'bg-white/[0.02] border border-white/[0.04]'
                      }`}
                    >
                      <span className="text-[11px]">{tier.label}</span>
                      <span className={`text-xs font-bold ${isActive ? 'text-violet-300' : 'text-neutral-500'}`}>
                        {tierNet}
                      </span>
                      <span className="text-[9px] text-neutral-700">
                        {tier.minPlayers}-{tier.maxPlayers === Infinity ? '∞' : tier.maxPlayers}人·{tier.winnerRate}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Rewards */}
            {Number(playerStats.pending) > 0 && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/20 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-violet-400 text-xs mb-1">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  待领取奖励
                </div>
                <div className="text-lg font-bold text-violet-300">{Number(playerStats.pending).toFixed(4)} BNB</div>
                <button
                  onClick={handleClaimRewards}
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 border border-violet-500/30 transition-colors"
                >
                  立即领取 →
                </button>
              </motion.div>
            )}

            {/* Bid Input Area */}
            <div className="space-y-3">
              {!isEnded && (
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  {/* Input */}
                  <div className="relative">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`最低 ${minBidFormatted}`}
                      min={minBidNum}
                      disabled={isEnded || isTaking}
                      className="w-full h-12 px-4 pr-16 text-base font-bold rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-neutral-700 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 focus:outline-none transition-all disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-600 font-medium">
                      代币
                    </span>
                  </div>

                  {/* Slider (when connected with balance) */}
                  {isConnected && tokenBalanceNum > 0 && tokenBalanceNum >= minBidNum && (() => {
                    const currentVal = Math.max(minBidNum, Math.min(Number(bidAmount) || minBidNum, tokenBalanceNum));
                    const percent = tokenBalanceNum > minBidNum 
                      ? Math.round(((currentVal - minBidNum) / (tokenBalanceNum - minBidNum)) * 100) 
                      : 0;
                    const fillPct = tokenBalanceNum > minBidNum
                      ? ((currentVal - minBidNum) / (tokenBalanceNum - minBidNum)) * 100
                      : 0;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-neutral-600">拖动选择金额</span>
                          <span className="text-[11px] font-bold text-violet-400">{percent}%</span>
                        </div>
                        <div className="relative h-6 flex items-center">
                          <input
                            type="range"
                            min={minBidNum}
                            max={tokenBalanceNum}
                            step={Math.max(1, Math.floor((tokenBalanceNum - minBidNum) / 200))}
                            value={currentVal}
                            onChange={(e) => setBidAmount(e.target.value)}
                            disabled={isEnded || isTaking}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-transparent relative z-10 disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-violet-300/30 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-violet-300/30 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)] [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent"
                          />
                          <div className="absolute left-0 right-0 h-1.5 rounded-full bg-white/[0.06] pointer-events-none" />
                          <div 
                            className="absolute left-0 h-1.5 rounded-full bg-violet-500/60 pointer-events-none transition-all duration-75"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-neutral-700">
                          <span>{minBidNum.toLocaleString()}</span>
                          <span>{Math.round((minBidNum + tokenBalanceNum) / 2).toLocaleString()}</span>
                          <span>{tokenBalanceNum.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {[
                            { label: '最低', value: minBidNum },
                            { label: '25%', value: Math.round(minBidNum + (tokenBalanceNum - minBidNum) * 0.25) },
                            { label: '50%', value: Math.round(minBidNum + (tokenBalanceNum - minBidNum) * 0.5) },
                            { label: '75%', value: Math.round(minBidNum + (tokenBalanceNum - minBidNum) * 0.75) },
                            { label: '全部', value: tokenBalanceNum },
                          ].filter(q => q.value >= minBidNum && q.value <= tokenBalanceNum).map((quick) => {
                            const isActive = Number(bidAmount) === quick.value;
                            return (
                              <button
                                key={quick.label}
                                onClick={() => setBidAmount(quick.value.toString())}
                                disabled={isEnded || isTaking}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all disabled:opacity-50 ${
                                  isActive
                                    ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                                    : 'bg-white/[0.02] border-white/[0.06] text-neutral-500 hover:border-violet-500/20 hover:text-violet-400'
                                }`}
                              >
                                {quick.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quick buttons (not connected or no balance) */}
                  {(!isConnected || tokenBalanceNum <= 0 || tokenBalanceNum < minBidNum) && (
                    <div className="flex gap-1.5">
                      {[
                        { label: '最低', value: minBidNum },
                        { label: '5万', value: 50000 },
                        { label: '10万', value: 100000 },
                      ].filter(q => q.value >= minBidNum).map((quick) => (
                        <button
                          key={quick.label}
                          onClick={() => setBidAmount(quick.value.toString())}
                          disabled={isEnded || isTaking}
                          className="flex-1 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.02] border border-white/[0.06] text-neutral-500 hover:border-violet-500/20 hover:text-violet-400 transition-colors disabled:opacity-50"
                        >
                          {quick.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Balance hint */}
                  {isConnected && (
                    <div className="flex items-center justify-between text-[11px] text-neutral-600">
                      <span>余额: {tokenBalance} {tokenSymbol}</span>
                      {bidAmount && Number(bidAmount) > tokenBalanceNum && tokenBalanceNum > 0 && (
                        <span className="text-red-400">余额不足</span>
                      )}
                      {bidAmount && Number(bidAmount) > 0 && Number(bidAmount) < minBidNum && (
                        <span className="text-red-400">低于最低出价</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Main CTA Button */}
              <AnimatedBidButton
                onClick={handleTakeover}
                disabled={isEnded || isTaking || (!!bidAmount && (Number(bidAmount) < minBidNum || (Number(bidAmount) > tokenBalanceNum && tokenBalanceNum > 0)))}
                isTaking={isTaking}
                isEnded={isEnded}
                isConnected={isConnected}
                bidAmount={bidAmount}
                minBidNum={minBidNum}
              />

              {Number(playerStats.pending) > 0 && (
                <Button
                  onClick={handleClaimRewards}
                  variant="outline"
                  className="w-full h-11 text-sm font-bold rounded-xl border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                >
                  领取奖励 ({Number(playerStats.pending).toFixed(4)} BNB)
                </Button>
              )}

              {!isEnded && (
                <p className="text-center text-[11px] text-neutral-600 mt-1">
                  🔥 代币进入回购销毁基金 · 赢取 {prizePoolBNB.toFixed(4)} BNB 奖池
                </p>
              )}
            </div>
          </div>

          {/* ——— Right Column: Activity Feed ——— */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:min-h-0 lg:max-h-[calc(100vh-6rem)] lg:sticky lg:top-6">
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden max-h-[50vh] lg:max-h-none">
              <BidHistory bidHistory={bidHistory} />
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden max-h-[50vh] lg:max-h-none">
              <RoundHistory currentRoundId={roundData.roundId} />
            </div>
          </div>
        </div>

        {/* ━━━ Game Rules ━━━ */}
        <div className="mt-6">
          <GameRules currentTier={currentTier} prizePoolBNB={prizePoolBNB} platformFee={GAME_CONFIG.platformFee} />
        </div>
      </div>
    </div>
  );
}
