import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BrowserProvider, formatEther } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
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
  gameCredits: number; // 游戏凭证 - 不可转让，绑定钱包
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
  // 凭证相关
  burnTokensForCredits: (amount: number) => Promise<boolean>;
  useCredits: (amount: number) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BNB_CHAIN_ID = 56; // BSC Mainnet
const BNB_TESTNET_CHAIN_ID = 97; // BSC Testnet

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: '0',
    tokenBalance: '0',
    gameCredits: 0,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask to connect your wallet');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Check if on BSC
      if (chainId !== BNB_CHAIN_ID && chainId !== BNB_TESTNET_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // BSC Mainnet
          });
        } catch (switchError: unknown) {
          // Chain not added, try to add it
          const err = switchError as { code?: number };
          if (err.code === 4902) {
            await window.ethereum.request({
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
        tokenBalance: '1000000', // Mock token balance for demo
        gameCredits: 500000, // 初始赠送50万凭证供测试
      });

      await updateBalance(address, provider);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to connect wallet');
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
    });
  }, []);

  // 销毁代币换取游戏凭证 (1:1兑换，永久有效，不可转让)
  const burnTokensForCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (Number(state.tokenBalance) < amount) {
      setError('代币余额不足');
      return false;
    }

    // 模拟链上销毁交易 (实际需要调用智能合约)
    // await contract.burnForCredits(amount);
    
    setState(prev => ({
      ...prev,
      tokenBalance: String(Number(prev.tokenBalance) - amount),
      gameCredits: prev.gameCredits + amount,
    }));
    
    return true;
  }, [state.tokenBalance]);

  // 使用凭证进行游戏
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

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

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

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        isConnecting,
        error,
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
