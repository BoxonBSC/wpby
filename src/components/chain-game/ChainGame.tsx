import { useState, useEffect, useMemo } from 'react';
import butterflyLogo from '@/assets/butterfly-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Users, Zap, Crown, ArrowUp, Wallet, Coins, Percent, Timer, CalendarClock } from 'lucide-react';
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
import { BidSuccessParticles } from './BidSuccessParticles';

// 游戏配置
const GAME_CONFIG = {
  roundDurationMinutes: 60,
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
  return new Date(Date.now() + 60 * 60 * 1000);
};

const formatHourMinute = (date: Date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export function ChainGame() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [nextDrawTime, setNextDrawTime] = useState(getDefaultEndTime());
  const [isEnded, setIsEnded] = useState(false);
  const [isTaking, setIsTaking] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [showWallet, setShowWallet] = useState(false);
  const [bidSuccessTrigger, setBidSuccessTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, address } = useWallet();

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
            time: new Date(Number(bid.timestamp) * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          }))
          .sort((a: { time: string }, b: { time: string }) => b.time.localeCompare(a.time))
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
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextDrawTime.getTime() - now.getTime()) / 1000));
      
      if (diff <= 0 && roundData.participantCount > 0 && !roundData.settled) {
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

  const formatNumber = (num: number) => num.toLocaleString();
  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const isLastFiveMinutes = timeLeft <= 300 && timeLeft > 0;

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

  // 维护模式 - 通过 URL 参数 ?key=cyber2024 绕过
  const isMaintenanceMode = false;
  const bypassKey = new URLSearchParams(window.location.search).get('key');
  const showMaintenance = isMaintenanceMode && bypassKey !== 'cyber2024';

  if (showMaintenance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-950/20 to-black flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
            className="text-7xl sm:text-8xl"
          >
            🔧
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
            系统维护中
          </h1>

          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            蝴蝶竞拍正在进行系统升级与维护，预计很快恢复。<br />
            感谢您的耐心等待！
          </p>

          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-800/60 border border-stone-700/50 text-stone-300 text-sm">
            <Timer className="w-4 h-4 text-violet-400" />
            <span>维护期间所有功能暂停使用</span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-stone-500">
            <span>🦋 蝴蝶竞拍</span>
            <span className="hidden sm:inline">·</span>
            <span>如有疑问请联系管理员</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-gradient-to-br from-black via-violet-950/20 to-black p-3 sm:p-4 md:p-8">
 
       <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <AnimatePresence>
        {showWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowWallet(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <WalletConnect />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BidSuccessParticles trigger={bidSuccessTrigger} />

      <div className="relative max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between gap-2">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 flex-shrink-0"
          >
            <img src={butterflyLogo} alt="蝴蝶竞拍" className="w-8 h-8 sm:w-10 sm:h-10" />
            蝴蝶竞拍
          </motion.h1>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowWallet(true)}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl bg-stone-800/80 border border-stone-700 hover:border-violet-500/50 transition-colors min-w-0"
          >
            <Wallet className="w-4 h-4 text-violet-400 flex-shrink-0" />
            {isConnected && address ? (
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-xs sm:text-sm font-mono text-white truncate">{shortenAddress(address)}</span>
                <div className="h-4 w-px bg-stone-600 flex-shrink-0 hidden sm:block" />
                <span className="text-xs sm:text-sm text-violet-400 font-medium truncate hidden sm:block">{tokenBalance} {tokenSymbol}</span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-stone-300 whitespace-nowrap">连接钱包</span>
            )}
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs sm:text-sm text-stone-400 -mt-2 md:-mt-4 px-2"
        >
          蝴蝶竞拍 · 燃烧代币 · 赢取BNB奖池
        </motion.p>

        {/* Token Set 状态指示器 */}
        {tokenSet !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
              tokenSet
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${tokenSet ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {tokenSet ? (
              <span>✅ 代币已绑定 — 合约 tokenSet = true</span>
            ) : (
              <span>❌ 代币未绑定 — 请调用 setToken() 设置代币地址后方可开始游戏</span>
            )}
          </motion.div>
        )}

        {/* 主卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
          
          <div className="p-4 sm:p-6 md:p-8">
            {/* 轮次和参与人数 + 动态比例 */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 md:mb-8">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                 <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-violet-500/10 border border-violet-500/30">
                   <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                   <span className="text-violet-400 font-medium text-sm">竞拍进行中</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-stone-400 text-sm">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{roundData.participantCount} 人</span>
                </div>
                {hasParticipated && isConnected && (
                  <div className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
                    ✓ 已参与
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-violet-500/10 border border-yellow-500/30">
                <span className="text-base sm:text-lg">{currentTier.label}</span>
                <span className="text-yellow-400 font-bold text-sm sm:text-base">{currentTier.winnerRate}%</span>
                <span className="text-stone-500 text-xs sm:text-sm">赢家比例</span>
              </div>
            </div>

            {/* 倒计时 */}
            <div className="text-center mb-6 md:mb-8">
              <AnimatePresence mode="wait">
                {!isEnded ? (
                  <motion.div
                    key="countdown"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                       <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                       <span className="text-stone-400 text-sm">开奖时间</span>
                       <span className="text-xl sm:text-2xl font-bold text-violet-400">{formatHourMinute(nextDrawTime)}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-stone-500 mb-2">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">
                        {isLastFiveMinutes ? '⚡ 最后冲刺' : '距离开奖'}
                      </span>
                    </div>
                    <div
                      className={`text-5xl sm:text-6xl md:text-8xl font-mono font-bold tracking-tight ${
                        isLastFiveMinutes
                          ? timeLeft <= 60
                            ? 'text-red-400 animate-pulse'
                            : 'text-violet-400'
                          : 'text-white'
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                    
                    <div className="mt-4 mx-auto max-w-md h-2 bg-stone-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${isLastFiveMinutes ? 'bg-gradient-to-r from-violet-400 to-fuchsia-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}
                        animate={{ width: `${(timeLeft / 3600) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        <span className="text-stone-400">赢家获得</span>
                        <span className="text-yellow-400 font-bold">{winnerAmount} BNB</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                         <span className="text-stone-400">滚入下轮</span>
                         <span className="text-violet-400 font-bold">{rolloverAmount} BNB</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ended"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-8"
                  >
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-2">🎉 本轮结束！</div>
                    <div className="text-stone-400 mb-2 text-sm sm:text-base">恭喜 {shortenAddress(roundData.currentHolder || '0x0')} 获胜</div>
                    <div className="text-yellow-400 text-lg sm:text-xl font-bold mb-4">+{winnerAmount} BNB</div>
                    
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                           <Zap className="w-6 h-6 text-violet-400" />
                        </motion.div>
                        <span className="text-violet-400 font-medium">正在自动结算中...</span>
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Zap className="w-6 h-6 text-violet-400" />
                        </motion.div>
                      </div>
                      
                      <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-violet-400"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                          />
                        ))}
                      </div>
                      
                      <span className="text-xs text-stone-500 mt-1">奖金将自动发放至赢家钱包，新一轮即将开启</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 当前最高出价者 */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 md:mb-8 py-3 sm:py-4 px-4 sm:px-6 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
              <span className="text-stone-400 text-xs sm:text-sm">当前最高出价者</span>
              <span className="font-mono text-white text-sm sm:text-base">
                {roundData.currentHolder ? shortenAddress(roundData.currentHolder) : '暂无'}
              </span>
            </div>

            {/* 数据卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-stone-800/50 border border-stone-700/50">
                <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 text-xs sm:text-sm mb-1">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                  当前出价
                </div>
                <div className="text-lg sm:text-xl font-bold text-violet-400">{currentBidFormatted}</div>
                <div className="text-[10px] sm:text-xs text-stone-500">代币</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-stone-800/50 border border-stone-700/50">
                <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 text-xs sm:text-sm mb-1">
                  <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                  最低出价
                </div>
                <div className="text-lg sm:text-xl font-bold text-green-400">{minBidFormatted}</div>
                <div className="text-[10px] sm:text-xs text-stone-500">不设上限</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-stone-800/50 border border-stone-700/50">
                <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 text-xs sm:text-sm mb-1">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                  BNB 总奖池
                </div>
                <div className="text-lg sm:text-xl font-bold text-yellow-400">{prizePoolBNB.toFixed(4)}</div>
                <div className="text-[10px] sm:text-xs text-stone-500">BNB</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-violet-500/10 border border-yellow-500/40">
                <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-400 text-xs sm:text-sm mb-1">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                  本轮可得奖金
                </div>
                <div className="text-lg sm:text-xl font-bold text-yellow-300">{winnerAmount}</div>
                <div className="text-[10px] sm:text-xs text-stone-500">
                  {currentTier.label} · {currentTier.winnerRate}% · {roundData.participantCount}人
                </div>
              </div>
            </div>

            {/* 奖金阶梯预览 */}
            <div className="mb-6 md:mb-8 p-2.5 sm:p-3 rounded-xl bg-stone-800/30 border border-stone-700/30">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>参与人数越多，赢家奖金越高</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {CHAIN_GAME_DYNAMIC_TIERS.map((tier) => {
                  const isActive = roundData.participantCount >= tier.minPlayers && 
                    roundData.participantCount <= (tier.maxPlayers === Infinity ? 9999 : tier.maxPlayers);
                  const tierGross = prizePoolBNB * tier.winnerRate / 100;
                  const tierNet = (tierGross - tierGross * GAME_CONFIG.platformFee / 100).toFixed(4);
                  return (
                    <div
                      key={tier.minPlayers}
                      className={`flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-2 sm:py-2.5 rounded-lg text-center transition-all ${
                        isActive
                          ? 'bg-yellow-500/15 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.15)]'
                          : 'bg-stone-800/40 border border-stone-700/30'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs">{tier.label}</span>
                      <span className={`text-xs sm:text-sm font-bold ${isActive ? 'text-yellow-300' : 'text-stone-400'}`}>
                        {tierNet}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-stone-600">
                        {tier.minPlayers}-{tier.maxPlayers === Infinity ? '∞' : tier.maxPlayers}人·{tier.winnerRate}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 待领取 */}
            {Number(playerStats.pending) > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] max-w-md mx-auto text-center"
              >
                <div className="flex items-center justify-center gap-2 text-violet-400 text-sm mb-1">
                  <Flame className="w-4 h-4 text-violet-400 animate-pulse" />
                  待领取奖励
                </div>
                <div className="text-xl font-bold text-violet-400">{Number(playerStats.pending).toFixed(4)} BNB</div>
                <button
                  onClick={handleClaimRewards}
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 hover:text-white border border-violet-500/40 transition-colors"
                >
                  立即领取 →
                </button>
              </motion.div>
            )}

            {/* 出价输入区 - 滑块 + 输入 + 快捷按钮 */}
            <div className="max-w-md mx-auto space-y-3">
              {!isEnded && (
                <div className="space-y-3">
                  {/* 输入框 */}
                  <div className="relative">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`最低 ${minBidFormatted}`}
                      min={minBidNum}
                      disabled={isEnded || isTaking}
                      className="w-full h-12 sm:h-14 px-4 pr-20 text-base sm:text-lg font-bold rounded-2xl bg-stone-800/80 border border-stone-600 text-white placeholder-stone-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-500 font-medium">
                      代币
                    </span>
                  </div>

                  {/* 滑块选择器（连接钱包且有余额时显示） */}
                  {isConnected && tokenBalanceNum > 0 && tokenBalanceNum >= minBidNum && (() => {
                    const currentVal = Math.max(minBidNum, Math.min(Number(bidAmount) || minBidNum, tokenBalanceNum));
                    const percent = tokenBalanceNum > minBidNum 
                      ? Math.round(((currentVal - minBidNum) / (tokenBalanceNum - minBidNum)) * 100) 
                      : 0;
                    const fillPct = tokenBalanceNum > minBidNum
                      ? ((currentVal - minBidNum) / (tokenBalanceNum - minBidNum)) * 100
                      : 0;
                    return (
                      <div className="space-y-2 px-1">
                        {/* 百分比指示 */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-500">拖动选择金额</span>
                          <span className="text-xs font-bold text-violet-400">{percent}%</span>
                        </div>
                        {/* 滑块轨道 */}
                        <div className="relative h-6 flex items-center">
                          <input
                            type="range"
                            min={minBidNum}
                            max={tokenBalanceNum}
                            step={Math.max(1, Math.floor((tokenBalanceNum - minBidNum) / 200))}
                            value={currentVal}
                            onChange={(e) => setBidAmount(e.target.value)}
                            disabled={isEnded || isTaking}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent relative z-10 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-400 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(139,92,246,0.7)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/30 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_20px_rgba(139,92,246,0.9)] [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white/30 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(139,92,246,0.7)] [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent"
                          />
                          {/* 自定义轨道背景 */}
                          <div className="absolute left-0 right-0 h-2 rounded-full bg-stone-700/80 pointer-events-none" />
                          <div 
                            className="absolute left-0 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 pointer-events-none transition-all duration-75"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        {/* 刻度标签 */}
                        <div className="flex justify-between text-[10px] text-stone-600">
                          <span>{minBidNum.toLocaleString()}</span>
                          <span>{Math.round((minBidNum + tokenBalanceNum) / 2).toLocaleString()}</span>
                          <span>{tokenBalanceNum.toLocaleString()}</span>
                        </div>
                        {/* 快捷百分比按钮 */}
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
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${
                                   isActive
                                     ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-[0_0_8px_rgba(139,92,246,0.2)]'
                                     : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:border-violet-500/40 hover:text-violet-400'
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
                  {/* 固定快捷按钮（未连接钱包或余额不足时） */}
                  {(!isConnected || tokenBalanceNum <= 0 || tokenBalanceNum < minBidNum) && (
                    <div className="flex gap-2">
                      {[
                        { label: '最低', value: minBidNum },
                        { label: '5万', value: 50000 },
                        { label: '10万', value: 100000 },
                      ].filter(q => q.value >= minBidNum).map((quick) => (
                        <button
                          key={quick.label}
                          onClick={() => setBidAmount(quick.value.toString())}
                          disabled={isEnded || isTaking}
                          className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-stone-800/60 border border-stone-700 text-stone-400 hover:border-violet-500/50 hover:text-violet-400 transition-colors disabled:opacity-50"
                        >
                          {quick.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* 余额提示 */}
                  {isConnected && (
                    <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                      <span>钱包余额: {tokenBalance} {tokenSymbol}</span>
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

              <Button
                onClick={handleTakeover}
                disabled={isEnded || isTaking || (!!bidAmount && (Number(bidAmount) < minBidNum || (Number(bidAmount) > tokenBalanceNum && tokenBalanceNum > 0)))}
                className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 hover:from-violet-500 hover:via-purple-400 hover:to-fuchsia-400 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
              >
                {isTaking ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Zap className="w-6 h-6" />
                    </motion.div>
                    出价中...
                  </span>
                ) : isEnded ? (
                  '本轮已结束'
                ) : (
                  <span className="flex items-center gap-2">
                    <Flame className="w-6 h-6" />
                    {!isConnected
                      ? '连接钱包后出价'
                      : bidAmount && Number(bidAmount) >= minBidNum
                        ? `🔥 出价 ${Number(bidAmount).toLocaleString()} 代币`
                        : '我要出价'}
                  </span>
                )}
              </Button>
               
              {Number(playerStats.pending) > 0 && (
                <Button
                  onClick={handleClaimRewards}
                   variant="outline"
                   className="w-full h-12 text-lg font-bold rounded-xl border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                >
                  领取奖励 ({Number(playerStats.pending).toFixed(4)} BNB)
                </Button>
              )}
               
              {!isEnded && (
                <p className="text-center text-sm text-stone-500 mt-3">
                  🔥 代币进入【回购销毁基金】· 赢取 {prizePoolBNB.toFixed(4)} BNB 奖池
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* 出价记录 */}
        {bidHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-stone-900/60 backdrop-blur border border-stone-700/50 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Users className="w-5 h-5 text-violet-400" />
                出价记录
              </div>
              <span className="text-xs text-stone-500">{bidHistory.length} 条记录</span>
            </div>
            <div className="relative max-h-[280px] overflow-y-auto pr-1">
              <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/60 via-purple-500/40 to-transparent" />
              
              <div className="space-y-1">
                {bidHistory.map((record, index) => {
                  const isLatest = index === 0;
                  const orderNum = bidHistory.length - index;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`relative flex items-center gap-3 p-3 pl-10 rounded-xl transition-colors ${
                         isLatest
                           ? 'bg-violet-500/10 border border-violet-500/30'
                           : 'hover:bg-stone-800/40'
                      }`}
                    >
                      <div className="absolute left-2.5 flex items-center justify-center">
                        {isLatest ? (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-4 h-4 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                          />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-stone-600 border-2 border-stone-800" />
                        )}
                      </div>

                       <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                         isLatest
                           ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-stone-800/60 text-stone-500'
                      }`}>
                        #{orderNum}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`font-mono text-sm ${isLatest ? 'text-white' : 'text-stone-400'}`}>
                          {shortenAddress(record.address)}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Timer className="w-3 h-3 text-stone-600" />
                          <span className="text-xs text-stone-600">{record.time}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <span className={`font-bold text-sm ${
                         isLatest ? 'text-violet-400' : 'text-stone-500'
                         }`}>
                          {Number(record.bid).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <div className="text-xs text-stone-600">代币</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        <RoundHistory currentRoundId={roundData.roundId} />

        {/* 经济模型说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-stone-900/40 border border-stone-700/50 p-5"
        >
          <div className="flex items-center gap-2 text-white font-semibold mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            游戏规则 · 销毁代币，赢取BNB
          </div>
          
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/20">
            <div className="text-sm text-stone-400 mb-3">
              🎯 动态赢家比例（参与人数越多，奖励越高，5%平台费从赢家奖励中扣除）：
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {CHAIN_GAME_DYNAMIC_TIERS.map((tier, index) => (
                <div 
                  key={index}
                   className={`p-2 rounded-lg text-center ${
                     tier.winnerRate === currentTier.winnerRate 
                       ? 'bg-violet-500/20 border border-violet-500/50' 
                      : 'bg-stone-800/30'
                  }`}
                >
                  <div className="text-lg">{tier.label.split(' ')[0]}</div>
                  <div className={`text-xs ${tier.winnerRate === currentTier.winnerRate ? 'text-yellow-400' : 'text-stone-500'}`}>
                    {tier.minPlayers}-{tier.maxPlayers === Infinity ? '∞' : tier.maxPlayers}人
                  </div>
                  <div className={`font-bold ${tier.winnerRate === currentTier.winnerRate ? 'text-yellow-400' : 'text-stone-400'}`}>
                    {tier.winnerRate}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 核心规则 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {[
              { icon: '🔥', title: '代币销毁', text: '出价代币先转入回购基金钱包，由基金统一执行销毁，确保流程透明可追溯' },
              { icon: '📈', title: '递增出价', text: '每次出价必须高于当前最高出价（首次出价最低10,000代币），无金额上限；同一玩家可连续出价' },
              { icon: '⏰', title: '自动开奖', text: '每轮默认持续1小时，倒计时归零后自动结算，开启全新一轮竞拍' },
              { icon: '🏆', title: '赢家通吃', text: '结算时最高出价者赢得BNB奖池，奖金自动转入赢家钱包；若转账失败可手动领取' },
            ].map((rule, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-stone-800/30">
                <span className="text-2xl mt-0.5">{rule.icon}</span>
                <div>
                  <div className="text-sm font-medium text-white mb-1">{rule.title}</div>
                  <span className="text-xs text-stone-400 leading-relaxed">{rule.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 结算与奖金机制 */}
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
            <div className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
              💰 结算与奖金机制
            </div>
            <div className="text-xs text-stone-400 leading-relaxed space-y-1.5">
              <p>• 每轮倒计时结束后，由 <span className="text-emerald-400 font-medium">Chainlink Automation</span> 自动触发结算，无需人工干预</p>
              <p>• 赢家奖金从奖池中按动态比例发放，<span className="text-yellow-400 font-medium">5% 平台手续费</span>从赢家奖金中扣除</p>
              <p>• 奖金自动转入赢家钱包；若自动转账失败，赢家可通过「领取奖励」手动提取</p>
              <p>• 剩余奖池自动滚入下一轮，确保奖池持续增长、永不清零</p>
            </div>
          </div>

          {/* 动态比例详细说明 */}
           <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/20">
             <div className="text-sm font-medium text-violet-400 mb-2 flex items-center gap-2">
               📊 动态比例说明
            </div>
            <div className="text-xs text-stone-400 leading-relaxed space-y-1.5">
              <p>• 赢家可提取的奖池比例随参与人数动态增长，人越多比例越高，最高 <span className="text-violet-400 font-medium">60%</span></p>
              <p>• 每轮至少保留 <span className="text-yellow-400 font-medium">40%</span> 奖池作为下一轮启动资金，防止奖池被抽干</p>
              <p>• 当前轮次适用的比例取决于该轮实际参与人数，结算时锁定最终比例</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
