import { memo } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import { SYMBOLS, type SlotSymbol } from '@/hooks/useAdvancedSlotMachine';

interface WinRevealOverlayProps {
  isVisible: boolean;
  winAmount: string;
  prizeType: string;
  prizeEmoji: string;
  symbols: SlotSymbol[];
  onClose: () => void;
}

const getSymbolEmoji = (id: SlotSymbol): string => {
  return SYMBOLS.find(s => s.id === id)?.emoji || '❓';
};

function WinRevealOverlayInner({
  isVisible,
  winAmount,
  prizeType,
  prizeEmoji,
  symbols,
  onClose,
}: WinRevealOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative p-8 rounded-2xl bg-card border-2 border-neon-yellow/50 shadow-[0_0_60px_hsl(50_100%_50%/0.3)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* 背景光效 */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-neon-yellow/10 via-transparent to-transparent animate-pulse" />
        </div>

        {/* 标题 */}
        <div className="text-center mb-6 relative">
          <div className="text-5xl mb-2 animate-bounce">
            {prizeEmoji}
          </div>
          <h2 className="text-3xl font-display neon-text-yellow flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
            {prizeType}
            <Sparkles className="w-6 h-6 animate-pulse" />
          </h2>
        </div>

        {/* 符号显示 */}
        <div className="flex justify-center gap-3 mb-6">
          {symbols.map((symbolId, index) => (
            <div
              key={index}
              className="w-16 h-16 flex items-center justify-center rounded-xl bg-muted/50 border-2 border-neon-yellow/50 shadow-[0_0_20px_hsl(50_100%_50%/0.3)] animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-3xl">{getSymbolEmoji(symbolId)}</span>
            </div>
          ))}
        </div>

        {/* 奖金金额 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
            <Trophy className="w-4 h-4 text-neon-yellow" />
            获得奖金
          </div>
          <div className="text-4xl font-display neon-text-green animate-pulse">
            +{winAmount} BNB
          </div>
        </div>

        {/* 底部提示 */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          点击任意位置关闭
        </p>
      </div>
    </div>
  );
}

export const WinRevealOverlay = memo(WinRevealOverlayInner);
