import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// WalletConnect Project ID
const projectId = '55fe84ab9ee307894312b54f610e6e54';

// BNB Smart Chain 配置
const bscMainnet = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/',
};

const bscTestnet = {
  chainId: 97,
  name: 'BNB Smart Chain Testnet',
  currency: 'tBNB',
  explorerUrl: 'https://testnet.bscscan.com',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
};

// 应用元数据
const metadata = {
  name: 'Burn Slots',
  description: '链上老虎机 GameFi - 公平透明的区块链游戏',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://cyberslots.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Ethers 配置
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: false,
  rpcUrl: bscMainnet.rpcUrl,
  defaultChainId: bscMainnet.chainId,
});

// 创建 Web3Modal 实例
createWeb3Modal({
  ethersConfig,
  chains: [bscMainnet, bscTestnet],
  projectId,
  enableAnalytics: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00f0ff',
    '--w3m-border-radius-master': '8px',
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
  ],
});

export { projectId, bscMainnet, bscTestnet, metadata };
