// 马年红包合约地址（待部署后填入）
export const HONGBAO_CONTRACT_ADDRESS = {
  mainnet: '0x0000000000000000000000000000000000000000',
  testnet: '0x0000000000000000000000000000000000000000',
};

// 代币合约地址（新代币，待确认后填入）
export const TOKEN_ADDRESS = {
  mainnet: '0x0000000000000000000000000000000000000000',
  testnet: '0x0000000000000000000000000000000000000000',
};

// 红包模式
export type RoundMode = 'normal' | 'lucky';

// 普通红包（A模式）配置 — 满人开奖
export const NORMAL_ROUND_CONFIG = {
  fixedBurnAmount: 10000,    // 固定燃烧 10,000 代币
  requiredParticipants: 100, // 满100人自动开奖
  poolDistributePercent: 50, // 每轮开出奖池的50%
  winnersCount: 1,           // 只奖给1人
};

// 金马红包（C模式）配置 — 每小时开奖
export const LUCKY_ROUND_CONFIG = {
  tokensPerTicket: 10000,    // 每10,000代币 = 1张抽奖券
  winnersCount: 3,           // 每轮3个赢家
  intervalMinutes: 60,       // 每小时一轮
};

// 税收分配
export const TAX_DISTRIBUTION = {
  normalPoolPercent: 70,     // 70% 进普通红包池
  luckyPoolPercent: 30,      // 30% 进幸运红包池
};
