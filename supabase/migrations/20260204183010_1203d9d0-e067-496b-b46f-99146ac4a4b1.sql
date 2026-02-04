-- 社交礼券表
CREATE TABLE public.social_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 发送者信息
  sender_address TEXT NOT NULL,
  sender_tx_hash TEXT, -- 销毁交易哈希
  -- 接收者信息
  recipient_twitter TEXT NOT NULL, -- Twitter用户名（不含@）
  recipient_address TEXT, -- 领取时填入
  -- 礼券详情
  amount BIGINT NOT NULL, -- 凭证数量
  claim_code TEXT NOT NULL UNIQUE, -- 唯一领取码
  verification_code TEXT, -- 推文验证码
  -- 状态
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  claimed_at TIMESTAMP WITH TIME ZONE,
  claim_tweet_id TEXT -- 验证推文ID
);

-- 索引优化
CREATE INDEX idx_social_gifts_sender ON public.social_gifts(sender_address);
CREATE INDEX idx_social_gifts_recipient ON public.social_gifts(recipient_twitter);
CREATE INDEX idx_social_gifts_claim_code ON public.social_gifts(claim_code);
CREATE INDEX idx_social_gifts_status ON public.social_gifts(status);
CREATE INDEX idx_social_gifts_expires ON public.social_gifts(expires_at) WHERE status = 'pending';

-- RLS策略（公开读取，便于验证和展示）
ALTER TABLE public.social_gifts ENABLE ROW LEVEL SECURITY;

-- 任何人可查看礼券（用于验证领取）
CREATE POLICY "Gifts are viewable by everyone"
ON public.social_gifts FOR SELECT
USING (true);

-- 插入需通过Edge Function（使用service role）
-- 不允许直接客户端插入，防止伪造