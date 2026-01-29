import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers/react';

// 钱包类型定义
export type WalletType = 'metamask' | 'okx' | 'binance' | 'tokenpocket' | 'walletconnect' | 'unknown';

export interface WalletInfo {
  id: WalletType;
  name: string;
  icon: string;
  detected: boolean;
  provider?: unknown;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Window {
    okxwallet?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
    BinanceChain?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
    tokenpocket?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
  tokenBalance: string;
  gameCredits: number;
  connectedWallet: WalletType | null;
}

interface WalletContextType extends WalletState {
  connect: (walletType?: WalletType) => Promise<void>;
  connectWalletConnect: () => void;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
  availableWallets: WalletInfo[];
  burnTokensForCredits: (amount: number) => Promise<boolean>;
  useCredits: (amount: number) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BNB_CHAIN_ID = 56;
const BNB_TESTNET_CHAIN_ID = 97;

// 检测可用钱包
function detectWallets(): WalletInfo[] {
  const wallets: WalletInfo[] = [
    {
      id: 'metamask',
      name: 'MetaMask (小狐狸)',
      icon: '🦊',
      detected: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
      provider: typeof window !== 'undefined' ? window.ethereum : undefined,
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: '⭕',
      detected: typeof window !== 'undefined' && !!window.okxwallet,
      provider: typeof window !== 'undefined' ? window.okxwallet : undefined,
    },
    {
      id: 'binance',
      name: 'Binance Wallet (币安)',
      icon: '🟡',
      detected: typeof window !== 'undefined' && !!window.BinanceChain,
      provider: typeof window !== 'undefined' ? window.BinanceChain : undefined,
    },
    {
      id: 'tokenpocket',
      name: 'TokenPocket (TP)',
      icon: '🔵',
      detected: typeof window !== 'undefined' && !!window.tokenpocket,
      provider: typeof window !== 'undefined' ? window.tokenpocket : undefined,
    },
  ];

  return wallets;
}

// 获取钱包Provider
function getWalletProvider(walletType: WalletType): unknown | null {
  switch (walletType) {
    case 'metamask':
      return window.ethereum;
    case 'okx':
      return window.okxwallet || window.ethereum;
    case 'binance':
      return window.BinanceChain || window.ethereum;
    case 'tokenpocket':
      return window.tokenpocket || window.ethereum;
    default:
      return window.ethereum;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: '0',
    tokenBalance: '0',
    gameCredits: 0,
    connectedWallet: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  // 检测可用钱包
  useEffect(() => {
    const checkWallets = () => {
      setAvailableWallets(detectWallets());
    };
    
    // 延迟检测，确保钱包插件已加载
    const timer = setTimeout(checkWallets, 100);
    
    // 监听钱包注入
    window.addEventListener('load', checkWallets);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', checkWallets);
    };
  }, []);

  const updateBalance = useCallback(async (address: string, provider: BrowserProvider) => {
    try {
      const balance = await provider.getBalance(address);
      setState(prev => ({
        ...prev,
        balance: formatEther(balance),
      }));
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, []);

  const connect = useCallback(async (walletType: WalletType = 'metamask') => {
    const walletProvider = getWalletProvider(walletType);
    
    if (!walletProvider) {
      const walletNames: Record<WalletType, string> = {
        metamask: 'MetaMask',
        okx: 'OKX Wallet',
        binance: 'Binance Wallet',
        tokenpocket: 'TokenPocket',
        walletconnect: 'WalletConnect',
        unknown: '钱包',
      };
      setError(`请先安装 ${walletNames[walletType]} 钱包`);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(walletProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> });
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // 切换到BSC网络
      if (chainId !== BNB_CHAIN_ID && chainId !== BNB_TESTNET_CHAIN_ID) {
        try {
          await (walletProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }],
          });
        } catch (switchError: unknown) {
          const err = switchError as { code?: number };
          if (err.code === 4902) {
            await (walletProvider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x38',
                chainName: 'BNB Smart Chain',
                nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
              }],
            });
          }
        }
      }

      const address = accounts[0];
      setState({
        address,
        isConnected: true,
        chainId,
        balance: '0',
        tokenBalance: '1000000',
        gameCredits: 500000,
        connectedWallet: walletType,
      });

      await updateBalance(address, provider);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || '连接钱包失败');
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      chainId: null,
      balance: '0',
      tokenBalance: '0',
      gameCredits: 0,
      connectedWallet: null,
    });
  }, []);

  const burnTokensForCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (Number(state.tokenBalance) < amount) {
      setError('代币余额不足');
      return false;
    }

    setState(prev => ({
      ...prev,
      tokenBalance: String(Number(prev.tokenBalance) - amount),
      gameCredits: prev.gameCredits + amount,
    }));
    
    return true;
  }, [state.tokenBalance]);

  const useCredits = useCallback((amount: number): boolean => {
    if (state.gameCredits < amount) {
      return false;
    }
    
    setState(prev => ({
      ...prev,
      gameCredits: prev.gameCredits - amount,
    }));
    
    return true;
  }, [state.gameCredits]);

  // 监听账户变化
  useEffect(() => {
    const provider = state.connectedWallet ? getWalletProvider(state.connectedWallet) : window.ethereum;
    if (!provider) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        disconnect();
      } else {
        setState(prev => ({ ...prev, address: accountList[0] }));
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    const p = provider as { on: (event: string, callback: (...args: unknown[]) => void) => void; removeListener: (event: string, callback: (...args: unknown[]) => void) => void };
    p.on('accountsChanged', handleAccountsChanged);
    p.on('chainChanged', handleChainChanged);

    return () => {
      p.removeListener('accountsChanged', handleAccountsChanged);
      p.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect, state.connectedWallet]);

  // Web3Modal hooks for WalletConnect
  const { open: openWeb3Modal } = useWeb3Modal();
  const { address: wcAddress, isConnected: wcIsConnected, chainId: wcChainId } = useWeb3ModalAccount();
  const { walletProvider: wcProvider } = useWeb3ModalProvider();
  const { disconnect: wcDisconnect } = useDisconnect();

  // 同步 WalletConnect 状态
  useEffect(() => {
    if (wcIsConnected && wcAddress && !state.isConnected) {
      setState(prev => ({
        ...prev,
        address: wcAddress,
        isConnected: true,
        chainId: wcChainId || 56,
        tokenBalance: '1000000',
        gameCredits: 500000,
        connectedWallet: 'walletconnect',
      }));

      // 获取余额
      if (wcProvider) {
        const provider = new BrowserProvider(wcProvider);
        provider.getBalance(wcAddress).then(balance => {
          setState(prev => ({ ...prev, balance: formatEther(balance) }));
        }).catch(console.error);
      }
    } else if (!wcIsConnected && state.connectedWallet === 'walletconnect') {
      disconnect();
    }
  }, [wcIsConnected, wcAddress, wcChainId, wcProvider, state.isConnected, state.connectedWallet]);

  const connectWalletConnect = useCallback(() => {
    openWeb3Modal();
  }, [openWeb3Modal]);

  const fullDisconnect = useCallback(() => {
    if (state.connectedWallet === 'walletconnect') {
      wcDisconnect();
    }
    disconnect();
  }, [state.connectedWallet, wcDisconnect, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        connectWalletConnect,
        disconnect: fullDisconnect,
        isConnecting,
        error,
        availableWallets,
        burnTokensForCredits,
        useCredits,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
