import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Twitter, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GiftResult {
  claimCode: string;
  verificationCode: string;
  recipientTwitter: string;
  amount: number;
  expiresAt: string;
}

export function GiftSendForm() {
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  
  const [twitterHandle, setTwitterHandle] = useState('');
  const [amount, setAmount] = useState(500000); // 默认500K
  const [isLoading, setIsLoading] = useState(false);
  const [giftResult, setGiftResult] = useState<GiftResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSendGift = async () => {
    if (!isConnected || !address) {
      toast({ title: '请先连接钱包', variant: 'destructive' });
      return;
    }

    if (!twitterHandle.trim()) {
      toast({ title: '请输入Twitter用户名', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 这里应该先调用智能合约销毁代币
      // 获取交易哈希后再创建礼券
      // 当前简化版本：直接创建礼券记录

      const { data, error } = await supabase.functions.invoke('create-gift', {
        body: {
          senderAddress: address,
          recipientTwitter: twitterHandle,
          amount: amount,
          txHash: null, // 实际应为销毁交易哈希
        },
      });

      if (error || !data.success) {
        throw new Error(data?.error || '创建礼券失败');
      }

      setGiftResult(data.data);
      toast({ title: '🎁 礼券创建成功！', description: '请将领取链接发送给对方' });
    } catch (error) {
      console.error('Error:', error);
      toast({ 
        title: '创建失败', 
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const claimUrl = giftResult 
    ? `${window.location.origin}/claim/${giftResult.claimCode}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: '链接已复制' });
  };

  const formatAmount = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return `${(val / 1000).toFixed(0)}K`;
  };

  if (giftResult) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Gift className="w-5 h-5" />
            礼券已创建
          </CardTitle>
          <CardDescription>
            礼券将在 7 天后过期，届时未领取的代币将自动销毁
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-black/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">接收者</span>
              <span className="text-amber-400">@{giftResult.recipientTwitter}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">凭证数量</span>
              <span className="text-white font-bold">{formatAmount(giftResult.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">领取码</span>
              <span className="font-mono text-green-400">{giftResult.claimCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">过期时间</span>
              <span className="text-orange-400">
                {new Date(giftResult.expiresAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">领取链接</label>
            <div className="flex gap-2">
              <Input 
                value={claimUrl} 
                readOnly 
                className="bg-black/30 text-xs font-mono"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyLink}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              const tweetText = encodeURIComponent(
                `🎁 我送你一份 Ace Gaming 游戏礼券！\n\n💰 ${formatAmount(giftResult.amount)} 凭证\n🔗 领取链接: ${claimUrl}\n\n7天内有效，快来领取吧！\n\n#AceGaming #BNBChain`
              );
              window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
            }}
          >
            <Twitter className="w-4 h-4 mr-2" />
            发推通知 @{giftResult.recipientTwitter}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setGiftResult(null);
              setTwitterHandle('');
            }}
          >
            继续赠送
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-400" />
          赠送游戏礼券
        </CardTitle>
        <CardDescription>
          销毁代币，为 Twitter 好友生成可领取的游戏凭证礼券
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">接收者 Twitter</label>
          <div className="relative">
            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ''))}
              placeholder="用户名（不含@）"
              className="pl-10 bg-black/30"
              maxLength={15}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">凭证数量</label>
          <div className="grid grid-cols-4 gap-2">
            {[500000, 1000000, 2000000, 5000000].map((val) => (
              <Button
                key={val}
                variant={amount === val ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAmount(val)}
                className={amount === val ? 'bg-purple-600' : ''}
              >
                {formatAmount(val)}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
          <p className="text-amber-400 font-medium">⚠️ 重要提示</p>
          <ul className="text-muted-foreground mt-1 space-y-1 text-xs">
            <li>• 代币将在创建礼券时立即销毁</li>
            <li>• 对方需发送验证推文才能领取</li>
            <li>• 7天未领取，凭证作废（通缩）</li>
          </ul>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          disabled={!isConnected || !twitterHandle || isLoading}
          onClick={handleSendGift}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Gift className="w-4 h-4 mr-2" />
          )}
          {isLoading ? '创建中...' : `赠送 ${formatAmount(amount)} 凭证`}
        </Button>
      </CardContent>
    </Card>
  );
}
