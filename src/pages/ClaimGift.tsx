import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Twitter, Wallet, Check, Clock, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type GiftStatus = 'loading' | 'pending' | 'claimed' | 'expired' | 'not_found';

interface GiftData {
  id: string;
  sender_address: string;
  recipient_twitter: string;
  amount: number;
  status: string;
  verification_code: string;
  expires_at: string;
  created_at: string;
}

export default function ClaimGift() {
  const { claimCode } = useParams<{ claimCode: string }>();
  const { address, isConnected, connectWalletConnect } = useWallet();
  const { toast } = useToast();

  const [status, setStatus] = useState<GiftStatus>('loading');
  const [gift, setGift] = useState<GiftData | null>(null);
  const [tweetId, setTweetId] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (claimCode) {
      fetchGift();
    }
  }, [claimCode]);

  const fetchGift = async () => {
    try {
      const { data, error } = await supabase
        .from('social_gifts')
        .select('*')
        .eq('claim_code', claimCode?.toUpperCase())
        .single();

      if (error || !data) {
        setStatus('not_found');
        return;
      }

      setGift(data);
      
      if (data.status === 'claimed') {
        setStatus('claimed');
      } else if (new Date(data.expires_at) < new Date()) {
        setStatus('expired');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      setStatus('not_found');
    }
  };

  const handleClaim = async () => {
    if (!isConnected || !address || !gift) {
      toast({ title: '请先连接钱包', variant: 'destructive' });
      return;
    }

    if (!tweetId.trim()) {
      toast({ title: '请输入验证推文链接或ID', variant: 'destructive' });
      return;
    }

    setIsClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-gift', {
        body: {
          claimCode: claimCode,
          recipientAddress: address,
          tweetId: tweetId.trim(),
        },
      });

      if (error || !data.success) {
        throw new Error(data?.error || '领取失败');
      }

      setStatus('claimed');
      toast({ 
        title: '🎉 领取成功！', 
        description: `获得 ${formatAmount(gift.amount)} 游戏凭证` 
      });
    } catch (error) {
      toast({ 
        title: '领取失败', 
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive' 
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const formatAmount = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return `${(val / 1000).toFixed(0)}K`;
  };

  const tweetTemplate = gift 
    ? `🎁 I'm claiming my @AceGamingBNB gift voucher!\n\nVerification: ${gift.verification_code}\n\n#AceGaming #BNBChain`
    : '';

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">礼券不存在</h2>
            <p className="text-muted-foreground">请检查领取链接是否正确</p>
            <Link to="/">
              <Button variant="outline" className="mt-4">返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-6 text-center">
            <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-orange-400 mb-2">礼券已过期</h2>
            <p className="text-muted-foreground">
              该礼券已超过 7 天有效期，对应代币已被销毁
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-4">前往游戏</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'claimed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6 text-center">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-400 mb-2">礼券已领取</h2>
            <p className="text-muted-foreground">
              {formatAmount(gift?.amount || 0)} 凭证已添加到您的账户
            </p>
            <Link to="/">
              <Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600">
                开始游戏
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // status === 'pending'
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader className="text-center">
          <Gift className="w-16 h-16 text-amber-400 mx-auto mb-2" />
          <CardTitle className="text-2xl">🎁 您收到一份礼券</CardTitle>
          <CardDescription>
            来自 {gift?.sender_address.slice(0, 6)}...{gift?.sender_address.slice(-4)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 礼券详情 */}
          <div className="bg-black/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">凭证数量</span>
              <span className="text-2xl font-bold text-amber-400">
                {formatAmount(gift?.amount || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">有效期至</span>
              <span className="text-orange-400">
                {gift && new Date(gift.expires_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          {/* 步骤指引 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">领取步骤</h3>
            
            {/* 步骤1: 发推文 */}
            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm">发送验证推文</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetTemplate)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  发送推文
                </Button>
              </div>
            </div>

            {/* 步骤2: 连接钱包 */}
            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm">连接钱包</p>
                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="w-4 h-4" />
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={connectWalletConnect}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    连接钱包
                  </Button>
                )}
              </div>
            </div>

            {/* 步骤3: 输入推文链接 */}
            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm">粘贴推文链接或ID</p>
                <input
                  type="text"
                  value={tweetId}
                  onChange={(e) => setTweetId(e.target.value)}
                  placeholder="https://twitter.com/... 或 推文ID"
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* 领取按钮 */}
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold"
            disabled={!isConnected || !tweetId || isClaiming}
            onClick={handleClaim}
          >
            {isClaiming ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Gift className="w-4 h-4 mr-2" />
            )}
            {isClaiming ? '领取中...' : '领取礼券'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            领取后凭证将自动添加到您的游戏账户
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
