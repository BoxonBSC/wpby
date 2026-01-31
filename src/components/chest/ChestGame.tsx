import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChestScene } from './ChestScene';
import { ChestSelector } from './ChestSelector';
import { ChestResults } from './ChestResults';
import { RewardReveal } from './RewardReveal';
import { 
  CHEST_TIERS, 
  ChestTier, 
  ChestResult, 
  RewardType,
  rollReward, 
  calculateBNBReward,
  REWARDS 
} from '@/config/chest';
import { Button } from '@/components/ui/button';
import { Package, Loader2, Wallet, Info } from 'lucide-react';

// 模拟数据 - 实际应从合约获取
const MOCK_CREDITS = 1000000;
const MOCK_PRIZE_POOL = 10; // 10 BNB

export function ChestGame() {
  const [selectedTier, setSelectedTier] = useState<ChestTier>(CHEST_TIERS[0]);
  const [credits, setCredits] = useState(MOCK_CREDITS);
  const [prizePool] = useState(MOCK_PRIZE_POOL);
  
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [currentReward, setCurrentReward] = useState<RewardType | null>(null);
  const [currentBNB, setCurrentBNB] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  
  const [results, setResults] = useState<ChestResult[]>([]);
  const [totalWin, setTotalWin] = useState(0);
  const [totalBet, setTotalBet] = useState(0);

  const handleOpenChest = useCallback(() => {
    if (credits < selectedTier.cost || isOpening) return;

    // 扣除凭证
    setCredits(prev => prev - selectedTier.cost);
    setTotalBet(prev => prev + selectedTier.cost);
    
    // 开始开箱动画
    setIsOpening(true);
    setIsOpened(false);
    setCurrentReward(null);

    // 模拟合约调用 - 确定结果
    const reward = rollReward(selectedTier);
    const bnbAmount = calculateBNBReward(reward, prizePool);

    // 延迟显示结果（等待动画）
    setTimeout(() => {
      setCurrentReward(reward);
      setCurrentBNB(bnbAmount);
    }, 1500);
  }, [credits, selectedTier, isOpening, prizePool]);

  const handleOpenComplete = useCallback(() => {
    setIsOpened(true);
    
    // 显示奖励弹窗
    setTimeout(() => {
      setShowReveal(true);
    }, 500);
  }, []);

  const handleCloseReveal = useCallback(() => {
    setShowReveal(false);
    
    // 记录结果
    if (currentReward) {
      const newResult: ChestResult = {
        id: `${Date.now()}-${Math.random()}`,
        chestTier: selectedTier.id,
        cost: selectedTier.cost,
        rewardType: currentReward,
        bnbWinAmount: currentBNB,
        timestamp: Date.now(),
      };
      
      setResults(prev => [newResult, ...prev]);
      
      if (currentBNB > 0) {
        setTotalWin(prev => prev + currentBNB);
      }
    }
    
    // 重置状态
    setTimeout(() => {
      setIsOpening(false);
      setIsOpened(false);
      setCurrentReward(null);
      setCurrentBNB(0);
    }, 300);
  }, [currentReward, currentBNB, selectedTier]);

  const canOpen = credits >= selectedTier.cost && !isOpening;

  return (
    <div className="min-h-screen bg-[#0a0908] pt-4">
      <div className="container mx-auto px-4">
        {/* 顶部信息栏 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div 
              className="px-4 py-2 rounded-xl"
              style={{
                background: 'rgba(201, 163, 71, 0.1)',
                border: '1px solid rgba(201, 163, 71, 0.2)',
              }}
            >
              <span className="text-[#C9A347]/60 text-sm">凭证: </span>
              <span className="text-[#C9A347] font-bold">{credits.toLocaleString()}</span>
            </div>
            <div 
              className="px-4 py-2 rounded-xl"
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
              }}
            >
              <span className="text-[#FFD700]/60 text-sm">奖池: </span>
              <span className="text-[#FFD700] font-bold">{prizePool} BNB</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="border-[#C9A347]/30 text-[#C9A347] hover:bg-[#C9A347]/10"
          >
            <Wallet className="w-4 h-4 mr-2" />
            连接钱包
          </Button>
        </div>

        {/* 主游戏区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧 - 宝箱选择 */}
          <div className="lg:col-span-3">
            <div 
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
                border: '1px solid rgba(201, 163, 71, 0.25)',
              }}
            >
              <ChestSelector
                selectedTier={selectedTier}
                onSelectTier={setSelectedTier}
                credits={credits}
                disabled={isOpening}
              />
            </div>
          </div>

          {/* 中间 - 3D宝箱场景 */}
          <div className="lg:col-span-6">
            <div 
              className="rounded-2xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(180deg, rgba(20, 16, 12, 0.95) 0%, rgba(10, 8, 6, 0.98) 100%)',
                border: '1px solid rgba(201, 163, 71, 0.25)',
                minHeight: '500px',
              }}
            >
              {/* 3D场景 */}
              <ChestScene
                tier={selectedTier}
                isOpening={isOpening}
                isOpened={isOpened}
                reward={currentReward || undefined}
                onOpenComplete={handleOpenComplete}
              />

              {/* 当前宝箱信息 */}
              <div className="absolute top-4 left-4 right-4">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: `${selectedTier.color}20`,
                    border: `1px solid ${selectedTier.color}40`,
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: selectedTier.color }}
                  />
                  <span style={{ color: selectedTier.color }} className="font-bold">
                    {selectedTier.name}
                  </span>
                  <span className="text-[#C9A347]/50 text-sm">
                    {selectedTier.cost.toLocaleString()} 凭证
                  </span>
                </div>
              </div>

              {/* 开箱按钮 */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleOpenChest}
                    disabled={!canOpen}
                    size="lg"
                    className="px-12 py-6 text-xl font-bold relative overflow-hidden"
                    style={{
                      background: canOpen 
                        ? `linear-gradient(135deg, ${selectedTier.color} 0%, ${selectedTier.metalColor} 100%)`
                        : 'rgba(100, 100, 100, 0.3)',
                      border: `2px solid ${canOpen ? selectedTier.color : '#666'}`,
                      boxShadow: canOpen ? `0 0 30px ${selectedTier.color}40` : 'none',
                      color: canOpen ? '#000' : '#666',
                    }}
                  >
                    {isOpening ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        开启中...
                      </>
                    ) : (
                      <>
                        <Package className="w-6 h-6 mr-2" />
                        开启宝箱
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* 奖励说明 */}
            <div 
              className="mt-4 rounded-xl p-4"
              style={{
                background: 'rgba(201, 163, 71, 0.05)',
                border: '1px solid rgba(201, 163, 71, 0.1)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-[#C9A347]/60" />
                <span className="text-[#C9A347]/60 text-sm font-bold">奖励说明</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.values(REWARDS).filter(r => r.type !== 'no_win').map((reward) => (
                  <div 
                    key={reward.type}
                    className="text-center p-2 rounded-lg"
                    style={{
                      background: `${reward.color}10`,
                      border: `1px solid ${reward.color}30`,
                    }}
                  >
                    <div className="text-lg">{reward.emoji}</div>
                    <div className="text-xs font-bold" style={{ color: reward.color }}>
                      {reward.label}
                    </div>
                    <div className="text-[10px] text-[#C9A347]/50">
                      {(reward.poolPercent * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧 - 历史记录 */}
          <div className="lg:col-span-3">
            <ChestResults
              results={results}
              totalWin={totalWin}
              totalBet={totalBet}
            />
          </div>
        </div>
      </div>

      {/* 奖励揭晓弹窗 */}
      <RewardReveal
        reward={currentReward}
        bnbAmount={currentBNB}
        visible={showReveal}
        onClose={handleCloseReveal}
      />
    </div>
  );
}
