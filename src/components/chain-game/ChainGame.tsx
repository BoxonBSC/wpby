import { useState, useEffect, useMemo } from 'react';
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

// 游戏配置
const GAME_CONFIG = {
  roundDurationMinutes: 60,   // 每轮60分钟
  priceIncrement: 10,         // 每次出价价格递增10%
  startPrice: 10000,          // 每轮起始价格（最小出价金额）
  minPrice: 10000,            // 最小出价金额
   platformFee: 5,            // 5% 平台费
};

// 获取当前动态比例
const getCurrentTier = (participants: number) => {
   return CHAIN_GAME_DYNAMIC_TIERS.find(tier => 
    participants >= tier.minPlayers && participants <= tier.maxPlayers
   ) || CHAIN_GAME_DYNAMIC_TIERS[0];
};

// 合约地址（使用mainnet）
const GAME_CONTRACT = CYBER_CHAIN_GAME_ADDRESS.mainnet;
const TOKEN_CONTRACT = CYBER_TOKEN_ADDRESS.mainnet;
 
 // 检查合约是否已部署
 const IS_CONTRACT_DEPLOYED = GAME_CONTRACT !== '0x0000000000000000000000000000000000000000';
 
 // 获取以太坊Provider
 const getEthereumProvider = () => {
   if (typeof window !== 'undefined' && window.ethereum) {
     return window.ethereum as unknown as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
   }
   return null;
 };

// 计算默认结束时间（60分钟后）
const getDefaultEndTime = () => {
  return new Date(Date.now() + 60 * 60 * 1000);
};

// 格式化时间为 HH:MM
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
   const [isLoading, setIsLoading] = useState(true);
   const { isConnected, address } = useWallet();
 
   // 合约数据状态
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

  // 当前动态比例
   const currentTier = useMemo(() => getCurrentTier(roundData.participantCount), [roundData.participantCount]);
   const prizePoolBNB = Number(ethers.formatEther(roundData.prizePool));
   const grossWinnerAmount = prizePoolBNB * currentTier.winnerRate / 100;
   const platformFee = grossWinnerAmount * GAME_CONFIG.platformFee / 100;
   const winnerAmount = (grossWinnerAmount - platformFee).toFixed(4);
   const rolloverAmount = (prizePoolBNB * (100 - currentTier.winnerRate) / 100).toFixed(4);
 
   // 格式化代币数量
   const currentBidFormatted = Number(ethers.formatEther(roundData.currentBid)).toLocaleString(undefined, { maximumFractionDigits: 0 });
   const minBidFormatted = Number(ethers.formatEther(roundData.minBid)).toLocaleString(undefined, { maximumFractionDigits: 0 });
   const tokenBalanceNum = Number(tokenBalance.replace(/,/g, ''));
   const minBidNum = Number(ethers.formatEther(roundData.minBid));
 
   // 获取合约数据
   const fetchContractData = async () => {
     // 如果合约未部署，使用演示数据
     if (!IS_CONTRACT_DEPLOYED) {
       setIsLoading(false);
       return;
     }
     
     const ethereum = getEthereumProvider();
     if (!ethereum) {
       setIsLoading(false);
       return;
     }
     
     try {
       const provider = new ethers.BrowserProvider(ethereum);
       const contract = new ethers.Contract(GAME_CONTRACT, CYBER_CHAIN_GAME_ABI, provider);
       
       // 获取当前轮次信息
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
       
       // 更新结束时间
       const endDate = new Date(Number(endTime) * 1000);
       setNextDrawTime(endDate);
      
      // 根据合约状态更新isEnded
      const now = Date.now();
      if (now >= endDate.getTime() && !settled && Number(participantCount) > 0) {
        setIsEnded(true);
      } else {
        setIsEnded(false);
      }
       
      // 获取最近出价记录
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
      
       // 获取玩家统计（如果已连接）
       if (address) {
         const [wins, earnings, burned, pending] = await contract.getPlayerStats(address);
         setPlayerStats({
           wins: Number(wins),
           earnings: ethers.formatEther(earnings),
           burned: ethers.formatEther(burned),
           pending: ethers.formatEther(pending),
         });
        
        // 检查是否已参与当前轮次
        try {
          const participated = await contract.hasPlayerParticipated(address);
          setHasParticipated(participated);
        } catch (e) {
          console.warn('Failed to check participation:', e);
        }
        
        // 获取代币余额和符号
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
 
   // 监听合约事件
   useEffect(() => {
     if (!IS_CONTRACT_DEPLOYED) return;
     
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
      setBidHistory([]); // 清空出价记录
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
 
   // 初始加载 - 结束后加速轮询以快速检测新一轮
   useEffect(() => {
     fetchContractData();
     const pollInterval = isEnded ? 5000 : 30000; // 结束后每5秒轮询，否则30秒
     const interval = setInterval(fetchContractData, pollInterval);
     return () => clearInterval(interval);
   }, [address, isEnded]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextDrawTime.getTime() - now.getTime()) / 1000));
      
     // 只有倒计时结束且有参与者且未结算时才显示结束状态
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

  // 是否在最后5分钟
  const isLastFiveMinutes = timeLeft <= 300 && timeLeft > 0;

  const handleTakeover = async () => {
    if (!isConnected) {
      setShowWallet(true);
      return;
    }
    
    // 解析用户输入金额，默认用最低出价
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
     
     if (!IS_CONTRACT_DEPLOYED) {
       toast.info('🎮 演示模式：合约尚未部署');
       // 演示模式下模拟出价
       setRoundData(prev => ({
         ...prev,
         currentHolder: address || '',
         currentBid: bidValue,
         minBid: bidValue * BigInt(110) / BigInt(100),
         participantCount: prev.participantCount + 1,
       }));
       setBidHistory(prev => [{
         address: address || '',
         bid: ethers.formatEther(bidValue),
         time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
       }, ...prev].slice(0, 10));
       setBidAmount('');
       return;
     }
     
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
       
       // 检查授权
       const allowance = await tokenContract.allowance(address, GAME_CONTRACT);
       if (allowance < bidValue) {
         toast.loading('正在授权代币...');
         const approveTx = await tokenContract.approve(GAME_CONTRACT, ethers.MaxUint256);
         await approveTx.wait();
         toast.success('授权成功！');
       }
       
       // 出价
        toast.loading('正在出价...');
       const tx = await gameContract.placeBid(bidValue);
       await tx.wait();
       
        toast.success('出价成功！🔥');
       setBidAmount('');
       fetchContractData();
     } catch (error: any) {
       console.error('Takeover failed:', error);
        toast.error(error.reason || '出价失败');
     } finally {
       setIsTaking(false);
     }
   };
 
   // 领取奖励
   const handleClaimRewards = async () => {
     if (!IS_CONTRACT_DEPLOYED) {
       toast.info('🎮 演示模式：合约尚未部署');
       return;
     }
     
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

   // 演示模式初始化数据
   useEffect(() => {
     if (!IS_CONTRACT_DEPLOYED) {
       setRoundData({
         roundId: 1,
         currentHolder: '',
         currentBid: BigInt(0),
         prizePool: ethers.parseEther('2.5'), // 演示：2.5 BNB
         participantCount: 0,
         minBid: ethers.parseEther('10000'), // 10000 代币
        settled: false,
       });
       setIsLoading(false);
     }
   }, []);
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4 md:p-8">
       {/* 演示模式提示 */}
       {!IS_CONTRACT_DEPLOYED && (
         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm font-medium">
           🎮 演示模式 - 合约尚未部署
         </div>
       )}
       
      {/* 背景动效 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* 钱包弹窗 */}
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

      <div className="relative max-w-5xl mx-auto space-y-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
          >
            ⚡ 击鼓传花
          </motion.h1>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowWallet(true)}
           className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 transition-colors"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            {isConnected && address ? (
             <div className="flex items-center gap-3">
               <span className="text-sm font-mono text-white">{shortenAddress(address)}</span>
               <div className="h-4 w-px bg-slate-600" />
               <span className="text-sm text-cyan-400 font-medium">{tokenBalance} {tokenSymbol}</span>
             </div>
            ) : (
              <span className="text-sm text-slate-300">连接钱包</span>
            )}
          </motion.button>
        </div>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-slate-400 -mt-4"
        >
          每小时开奖 · 销毁代币，赢取BNB · 动态奖励比例
        </motion.p>

        {/* 主卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 overflow-hidden"
        >
          {/* 顶部光效 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          <div className="p-6 md:p-8">
            {/* 轮次和参与人数 + 动态比例 */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <Flame className="w-4 h-4 text-cyan-400" />
                   <span className="text-cyan-400 font-medium">第 #{roundData.roundId} 轮</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-4 h-4" />
                   <span>{roundData.participantCount} 人</span>
                </div>
                {hasParticipated && isConnected && (
                  <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
                    ✓ 已参与
                  </div>
                )}
              </div>
              {/* 动态比例指示 */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                <span className="text-lg">{currentTier.label}</span>
                <span className="text-yellow-400 font-bold">{currentTier.winnerRate}%</span>
                <span className="text-slate-500 text-sm">赢家比例</span>
              </div>
            </div>

            {/* 开奖时间和倒计时 */}
            <div className="text-center mb-8">
              <AnimatePresence mode="wait">
                {!isEnded ? (
                  <motion.div
                    key="countdown"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    {/* 开奖时间 */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <CalendarClock className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-400">开奖时间</span>
                      <span className="text-2xl font-bold text-cyan-400">{formatHourMinute(nextDrawTime)}</span>
                    </div>
                    
                    {/* 倒计时 */}
                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">
                        {isLastFiveMinutes ? '⚡ 最后冲刺' : '距离开奖'}
                      </span>
                    </div>
                    <div
                      className={`text-6xl md:text-8xl font-mono font-bold tracking-tight ${
                        isLastFiveMinutes
                          ? timeLeft <= 60
                            ? 'text-red-400 animate-pulse'
                            : 'text-orange-400'
                          : 'text-white'
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                    
                    {/* 进度条 */}
                    <div className="mt-4 mx-auto max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${isLastFiveMinutes ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gradient-to-r from-cyan-400 to-purple-400'}`}
                        animate={{ width: `${(timeLeft / 3600) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    
                    {/* 奖金预览 */}
                    <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-400">赢家获得</span>
                        <span className="text-yellow-400 font-bold">{winnerAmount} BNB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowUp className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-400">滚入下轮</span>
                        <span className="text-cyan-400 font-bold">{rolloverAmount} BNB</span>
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
                    <div className="text-3xl font-bold text-white mb-2">🎉 本轮结束！</div>
                    <div className="text-slate-400 mb-2">恭喜 {shortenAddress(roundData.currentHolder || '0x0')} 获胜</div>
                    <div className="text-yellow-400 text-xl font-bold mb-4">+{winnerAmount} BNB</div>
                    
                    {/* 自动结算等待动画 */}
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Zap className="w-6 h-6 text-cyan-400" />
                        </motion.div>
                        <span className="text-cyan-400 font-medium">正在自动结算中...</span>
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Zap className="w-6 h-6 text-cyan-400" />
                        </motion.div>
                      </div>
                      
                      {/* 进度点动画 */}
                      <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-cyan-400"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                          />
                        ))}
                      </div>
                      
                      <span className="text-xs text-slate-500 mt-1">奖金将自动发放至赢家钱包，新一轮即将开启</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 当前持有者 */}
            <div className="flex items-center justify-center gap-3 mb-8 py-4 px-6 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <Crown className="w-5 h-5 text-yellow-400" />
             <span className="text-slate-400">当前最高出价者</span>
               <span className="font-mono text-white">
                 {roundData.currentHolder ? shortenAddress(roundData.currentHolder) : '暂无'}
               </span>
            </div>

            {/* 数据卡片 */}
            <div className={`grid grid-cols-2 ${Number(playerStats.pending) > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-8`}>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Coins className="w-4 h-4 text-orange-400" />
                   当前出价
                </div>
                 <div className="text-xl font-bold text-orange-400">{currentBidFormatted}</div>
               <div className="text-xs text-slate-500">代币</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <ArrowUp className="w-4 h-4 text-green-400" />
                   最低出价
                </div>
                 <div className="text-xl font-bold text-green-400">{minBidFormatted}</div>
                <div className="text-xs text-slate-500">不设上限</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  BNB 奖池
                </div>
                 <div className="text-xl font-bold text-yellow-400">{prizePoolBNB.toFixed(4)}</div>
                <div className="text-xs text-slate-500">BNB</div>
              </div>
              {/* 待领取 - 仅在有待领取奖励时显示 */}
              {Number(playerStats.pending) > 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                >
                  <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
                    <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
                    待领取奖励
                  </div>
                  <div className="text-xl font-bold text-cyan-400">{Number(playerStats.pending).toFixed(4)}</div>
                  <button
                    onClick={handleClaimRewards}
                    className="mt-1 text-xs font-medium text-cyan-300 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    立即领取 →
                  </button>
                </motion.div>
              )}
            </div>

             {/* 出价输入区 */}
             <div className="max-w-md mx-auto space-y-3">
              {/* 金额输入框 */}
              {!isEnded && (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`最低 ${minBidFormatted}`}
                      min={minBidNum}
                      disabled={isEnded || isTaking}
                      className="w-full h-14 px-4 pr-20 text-lg font-bold rounded-2xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                      代币
                    </span>
                  </div>
                  {/* 滑块选择 */}
                  {isConnected && tokenBalanceNum > 0 && tokenBalanceNum >= minBidNum && (
                    <div className="space-y-1.5 px-1">
                      <input
                        type="range"
                        min={minBidNum}
                        max={tokenBalanceNum}
                        step={Math.max(1, Math.floor((tokenBalanceNum - minBidNum) / 100))}
                        value={Number(bidAmount) || minBidNum}
                        onChange={(e) => setBidAmount(e.target.value)}
                        disabled={isEnded || isTaking}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700 accent-cyan-500 disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(34,211,238,0.6)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-300 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cyan-300 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                        style={{
                          background: `linear-gradient(to right, rgb(34 211 238) 0%, rgb(34 211 238) ${((Number(bidAmount || minBidNum) - minBidNum) / (tokenBalanceNum - minBidNum)) * 100}%, rgb(51 65 85) ${((Number(bidAmount || minBidNum) - minBidNum) / (tokenBalanceNum - minBidNum)) * 100}%, rgb(51 65 85) 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>{minBidNum.toLocaleString()}</span>
                        <span>{tokenBalanceNum.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {/* 快捷金额按钮 */}
                  <div className="flex gap-2">
                    {[
                      { label: '最低', value: minBidNum },
                      { label: '5万', value: 50000 },
                      { label: '10万', value: 100000 },
                      { label: '全部', value: tokenBalanceNum },
                    ].filter(q => q.value >= minBidNum).map((quick) => (
                      <button
                        key={quick.label}
                        onClick={() => setBidAmount(quick.value.toString())}
                        disabled={isEnded || isTaking}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors disabled:opacity-50"
                      >
                        {quick.label}
                      </button>
                    ))}
                  </div>
                  {/* 余额提示 */}
                  {isConnected && (
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
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
                className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
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
                    {bidAmount && Number(bidAmount) >= minBidNum
                      ? `出价 ${Number(bidAmount).toLocaleString()} 代币`
                      : '我要出价'}
                  </span>
                )}
              </Button>
               
               {/* 领取奖励按钮 */}
               {Number(playerStats.pending) > 0 && (
                 <Button
                   onClick={handleClaimRewards}
                   variant="outline"
                   className="w-full h-12 text-lg font-bold rounded-xl border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                 >
                   领取奖励 ({Number(playerStats.pending).toFixed(4)} BNB)
                 </Button>
               )}
               
              {!isEnded && (
                <p className="text-center text-sm text-slate-500 mt-3">
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
              className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-700/50 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Users className="w-5 h-5 text-cyan-400" />
                  出价记录
                </div>
                <span className="text-xs text-slate-500">{bidHistory.length} 条记录</span>
              </div>
              <div className="relative max-h-[280px] overflow-y-auto pr-1">
                {/* 时间线竖线 */}
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/60 via-purple-500/40 to-transparent" />
                
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
                            ? 'bg-cyan-500/10 border border-cyan-500/30'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* 时间线节点 */}
                        <div className="absolute left-2.5 flex items-center justify-center">
                          {isLatest ? (
                            <motion.div
                              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                            />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border-2 border-slate-800" />
                          )}
                        </div>

                        {/* 序号 */}
                        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isLatest
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-slate-800/60 text-slate-500'
                        }`}>
                          #{orderNum}
                        </div>

                        {/* 地址和时间 */}
                        <div className="flex-1 min-w-0">
                          <span className={`font-mono text-sm ${isLatest ? 'text-white' : 'text-slate-400'}`}>
                            {shortenAddress(record.address)}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Timer className="w-3 h-3 text-slate-600" />
                            <span className="text-xs text-slate-600">{record.time}</span>
                          </div>
                        </div>

                        {/* 金额 */}
                        <div className="flex-shrink-0 text-right">
                          <span className={`font-bold text-sm ${
                            isLatest ? 'text-orange-400' : 'text-slate-500'
                          }`}>
                            {Number(record.bid).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                          <div className="text-xs text-slate-600">代币</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        {/* 中奖记录 */}
        <RoundHistory currentRoundId={roundData.roundId} />

        {/* 经济模型说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
          className="rounded-2xl bg-slate-900/40 border border-slate-700/50 p-5"
        >
          <div className="flex items-center gap-2 text-white font-semibold mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            游戏规则 · 销毁代币，赢取BNB
          </div>
          
          {/* 动态比例说明 */}
           <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20">
             <div className="text-sm text-slate-400 mb-3">
               🎯 动态赢家比例（参与人数越多，奖励越高，5%平台费从赢家奖励中扣除）：
             </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
               {CHAIN_GAME_DYNAMIC_TIERS.map((tier, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded-lg text-center ${
                    tier.winnerRate === currentTier.winnerRate 
                      ? 'bg-yellow-500/20 border border-yellow-500/50' 
                      : 'bg-slate-800/30'
                  }`}
                >
                  <div className="text-lg">{tier.label.split(' ')[0]}</div>
                  <div className={`text-xs ${tier.winnerRate === currentTier.winnerRate ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {tier.minPlayers}-{tier.maxPlayers === Infinity ? '∞' : tier.maxPlayers}人
                  </div>
                  <div className={`font-bold ${tier.winnerRate === currentTier.winnerRate ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {tier.winnerRate}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🔥', text: '出价消耗的代币将被永久销毁' },
              { icon: '📈', text: '自由出价，最低10,000代币，上不封顶' },
              { icon: '⏰', text: '每小时自动开奖，开启新一轮' },
              { icon: '🏆', text: '开奖时最后持有者赢得BNB奖池' },
            ].map((rule, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30">
                <span className="text-2xl">{rule.icon}</span>
                <span className="text-sm text-slate-300">{rule.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
