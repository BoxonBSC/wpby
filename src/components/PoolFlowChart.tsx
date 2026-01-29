import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, Coins, ArrowRight, Zap, Activity } from 'lucide-react';

// 模拟交易数据
interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  taxAmount: number;
  poolContribution: number;
  timestamp: Date;
}

// 生成模拟交易
function generateTransaction(): Transaction {
  const type = Math.random() > 0.45 ? 'buy' : 'sell';
  const amount = Math.floor(Math.random() * 500000) + 50000;
  const taxRate = 0.05; // 5% 总交易税
  const poolRate = 0.03; // 3% 进入奖池
  const taxAmount = amount * taxRate;
  const poolContribution = amount * poolRate;
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    amount,
    taxAmount,
    poolContribution,
    timestamp: new Date(),
  };
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

// 流入动画组件
function FlowAnimation({ transaction }: { transaction: Transaction }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.8 }}
      className={`
        flex items-center gap-2 p-2 rounded-lg text-xs
        ${transaction.type === 'buy' 
          ? 'bg-neon-green/10 border border-neon-green/30' 
          : 'bg-neon-pink/10 border border-neon-pink/30'
        }
      `}
    >
      <span className={transaction.type === 'buy' ? 'text-neon-green' : 'text-neon-pink'}>
        {transaction.type === 'buy' ? '↑ 买入' : '↓ 卖出'}
      </span>
      <span className="text-muted-foreground">
        {formatNumber(transaction.amount)}
      </span>
      <ArrowRight className="w-3 h-3 text-muted-foreground" />
      <span className="text-neon-yellow font-display">
        +{transaction.poolContribution.toFixed(2)} BNB
      </span>
    </motion.div>
  );
}

export function PoolFlowChart() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ time: string; inflow: number; cumulative: number }[]>([]);
  const [totalPoolInflow, setTotalPoolInflow] = useState(0);
  const [todayInflow, setTodayInflow] = useState(0);
  const [isLive, setIsLive] = useState(true);

  // 模拟实时交易
  useEffect(() => {
    if (!isLive) return;

    // 初始化一些历史数据
    const initialData = Array.from({ length: 12 }, (_, i) => ({
      time: `${String(i * 2).padStart(2, '0')}:00`,
      inflow: Math.random() * 2 + 0.5,
      cumulative: 0,
    }));
    
    let cumulative = 0;
    initialData.forEach(d => {
      cumulative += d.inflow;
      d.cumulative = cumulative;
    });
    
    setChartData(initialData);
    setTotalPoolInflow(cumulative);
    setTodayInflow(cumulative);

    // 模拟实时交易流入
    const interval = setInterval(() => {
      const tx = generateTransaction();
      
      setTransactions(prev => [tx, ...prev.slice(0, 4)]);
      setTotalPoolInflow(prev => prev + tx.poolContribution / 10000); // 缩放显示
      setTodayInflow(prev => prev + tx.poolContribution / 10000);
      
      // 更新图表数据
      setChartData(prev => {
        const newData = [...prev];
        const lastIndex = newData.length - 1;
        if (lastIndex >= 0) {
          newData[lastIndex] = {
            ...newData[lastIndex],
            inflow: newData[lastIndex].inflow + tx.poolContribution / 10000,
            cumulative: newData[lastIndex].cumulative + tx.poolContribution / 10000,
          };
        }
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  // 资金来源分布
  const sourceData = [
    { name: '买入税', value: 55, color: 'hsl(var(--neon-green))' },
    { name: '卖出税', value: 45, color: 'hsl(var(--neon-pink))' },
  ];

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display neon-text-yellow flex items-center gap-2">
          <Activity className="w-5 h-5" />
          奖池资金流向
        </h3>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display
            transition-all
            ${isLive 
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' 
              : 'bg-muted/30 text-muted-foreground border border-border/50'
            }
          `}
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-neon-green animate-pulse' : 'bg-muted-foreground'}`} />
          {isLive ? 'LIVE' : '暂停'}
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="neon-border rounded-lg p-3 bg-muted/20">
          <div className="text-xs text-muted-foreground mb-1">今日流入</div>
          <div className="font-display text-neon-green text-lg">
            {todayInflow.toFixed(2)} BNB
          </div>
        </div>
        <div className="neon-border-yellow rounded-lg p-3 bg-neon-yellow/5">
          <div className="text-xs text-muted-foreground mb-1">累计总额</div>
          <div className="font-display text-neon-yellow text-lg">
            {totalPoolInflow.toFixed(2)} BNB
          </div>
        </div>
        <div className="neon-border-purple rounded-lg p-3 bg-neon-purple/5">
          <div className="text-xs text-muted-foreground mb-1">交易税率</div>
          <div className="font-display text-neon-purple text-lg">
            3%
          </div>
        </div>
      </div>

      {/* 资金流向说明 */}
      <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-lg bg-muted/20">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-neon-cyan">交易</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-1 text-xs">
          <span className="text-neon-purple">5% 交易税</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-1 text-xs">
          <span className="text-neon-yellow font-display">3% 奖池</span>
        </div>
        <span className="text-muted-foreground text-xs">+</span>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">2% 营销</span>
        </div>
      </div>

      {/* 实时交易流 */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          实时交易
        </div>
        <div className="space-y-1.5 min-h-[120px]">
          <AnimatePresence mode="popLayout">
            {transactions.slice(0, 3).map(tx => (
              <FlowAnimation key={tx.id} transaction={tx} />
            ))}
          </AnimatePresence>
          {transactions.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-4">
              等待交易数据...
            </div>
          )}
        </div>
      </div>

      {/* 流入趋势图 */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          24小时流入趋势
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--neon-green))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--neon-green))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v) => `${v.toFixed(1)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--neon-green) / 0.5)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toFixed(3)} BNB`, '流入']}
              />
              <Area 
                type="monotone" 
                dataKey="inflow" 
                stroke="hsl(var(--neon-green))"
                strokeWidth={2}
                fill="url(#inflowGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 来源分布 */}
      <div>
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Coins className="w-3 h-3" />
          资金来源分布
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full overflow-hidden bg-muted/30 flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '55%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-neon-green to-neon-cyan"
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '45%' }}
              transition={{ duration: 1, delay: 0.7 }}
              className="h-full bg-gradient-to-r from-neon-pink to-neon-purple"
            />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            <span className="text-muted-foreground">买入税 55%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neon-pink" />
            <span className="text-muted-foreground">卖出税 45%</span>
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-4 p-3 rounded-lg bg-muted/10 border border-border/50">
        <p className="text-xs text-muted-foreground">
          💡 每笔代币交易的 <span className="text-neon-yellow">3%</span> 交易税会自动兑换为 BNB 并注入奖池。
          交易越活跃，奖池增长越快，中奖奖励越丰厚！
        </p>
      </div>
    </div>
  );
}
