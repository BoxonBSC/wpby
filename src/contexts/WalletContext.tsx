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
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
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
    });
  }, []);

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
