// 钱包官方品牌图标
import { WalletType } from '@/contexts/WalletContext';

// MetaMask 狐狸图标
export function MetaMaskIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.2684 4.03125L17.5765 11.2128L19.4074 6.89191L27.2684 4.03125Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.71875 4.03125L14.3318 11.2828L12.5929 6.89191L4.71875 4.03125Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23.7344 21.0469L21.1641 25.0234L26.7266 26.5547L28.3281 21.1328L23.7344 21.0469Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.6875 21.1328L5.27344 26.5547L10.8359 25.0234L8.26562 21.0469L3.6875 21.1328Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5234 14.1172L8.98438 16.4141L14.5078 16.6641L14.3047 10.7656L10.5234 14.1172Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.4609 14.1172L17.6328 10.6953L17.5 16.6641L23.0156 16.4141L21.4609 14.1172Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.8359 25.0234L14.1641 23.4062L11.2734 21.1719L10.8359 25.0234Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.8203 23.4062L21.1641 25.0234L20.7109 21.1719L17.8203 23.4062Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.1641 25.0234L17.8203 23.4062L18.0859 25.5703L18.0547 26.4844L21.1641 25.0234Z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.8359 25.0234L13.9453 26.4844L13.9297 25.5703L14.1641 23.4062L10.8359 25.0234Z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 19.8984L11.1953 19.0703L13.1484 18.1562L14 19.8984Z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.9844 19.8984L18.8359 18.1562L20.8047 19.0703L17.9844 19.8984Z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.8359 25.0234L11.2891 21.0469L8.26562 21.1328L10.8359 25.0234Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.7109 21.0469L21.1641 25.0234L23.7344 21.1328L20.7109 21.0469Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23.0156 16.4141L17.5 16.6641L17.9922 19.8984L18.8438 18.1562L20.8125 19.0703L23.0156 16.4141Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.1953 19.0703L13.1641 18.1562L14 19.8984L14.5078 16.6641L8.98438 16.4141L11.1953 19.0703Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.98438 16.4141L11.2734 21.1719L11.1953 19.0703L8.98438 16.4141Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.8125 19.0703L20.7109 21.1719L23.0156 16.4141L20.8125 19.0703Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.5078 16.6641L14 19.8984L14.6328 23.0781L14.7812 18.4141L14.5078 16.6641Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.5 16.6641L17.2344 18.3984L17.3516 23.0781L17.9922 19.8984L17.5 16.6641Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.9922 19.8984L17.3516 23.0781L17.8203 23.4062L20.7109 21.1719L20.8125 19.0703L17.9922 19.8984Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.1953 19.0703L11.2734 21.1719L14.1641 23.4062L14.6328 23.0781L14 19.8984L11.1953 19.0703Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.0547 26.4844L18.0859 25.5703L17.8438 25.3594H14.1406L13.9297 25.5703L13.9453 26.4844L10.8359 25.0234L11.9141 25.9062L14.1094 27.4453H17.875L20.0859 25.9062L21.1641 25.0234L18.0547 26.4844Z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.8203 23.4062L17.3516 23.0781H14.6328L14.1641 23.4062L13.9297 25.5703L14.1406 25.3594H17.8438L18.0859 25.5703L17.8203 23.4062Z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M27.6953 11.6094L28.5 7.67188L27.2656 4.03125L17.8203 11.0078L21.4609 14.1172L26.6094 15.5859L27.7422 14.2656L27.2578 13.9141L28.0547 13.1875L27.4531 12.7188L28.25 12.1094L27.6953 11.6094Z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.5 7.67188L4.30469 11.6094L3.73438 12.1094L4.53125 12.7188L3.94531 13.1875L4.74219 13.9141L4.25781 14.2656L5.375 15.5859L10.5234 14.1172L14.1641 11.0078L4.71875 4.03125L3.5 7.67188Z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26.6094 15.5859L21.4609 14.1172L23.0156 16.4141L20.7109 21.1719L23.7344 21.1328H28.3281L26.6094 15.5859Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5234 14.1172L5.375 15.5859L3.6875 21.1328H8.26562L11.2734 21.1719L8.98438 16.4141L10.5234 14.1172Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.5 16.6641L17.8203 11.0078L19.4219 6.89191H12.5938L14.1641 11.0078L14.5078 16.6641L14.6172 18.4297L14.6328 23.0781H17.3516L17.3828 18.4297L17.5 16.6641Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// OKX 图标
export function OKXIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#000000"/>
      <rect x="6" y="6" width="8" height="8" rx="1.5" fill="white"/>
      <rect x="18" y="6" width="8" height="8" rx="1.5" fill="white"/>
      <rect x="12" y="12" width="8" height="8" rx="1.5" fill="white"/>
      <rect x="6" y="18" width="8" height="8" rx="1.5" fill="white"/>
      <rect x="18" y="18" width="8" height="8" rx="1.5" fill="white"/>
    </svg>
  );
}

// Binance 图标
export function BinanceIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
      <path d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002L16 13.706 14.295 15.41l-.195.195-.61.61-.004.004.004.003L16 18.706l2.293-2.293.001-.001-.002-.414z" fill="white"/>
    </svg>
  );
}

// TokenPocket 图标
export function TokenPocketIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#2980FE"/>
      <path d="M8 10h16v2H8v-2z" fill="white"/>
      <path d="M14 10h4v14h-4V10z" fill="white"/>
      <path d="M10 12h12v2H10v-2z" fill="white" fillOpacity="0.6"/>
    </svg>
  );
}

// WalletConnect 图标
export function WalletConnectIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#3B99FC"/>
      <path d="M10.5 12.5C13.5376 9.46243 18.4624 9.46243 21.5 12.5L21.9 12.9C22.0657 13.0657 22.0657 13.3343 21.9 13.5L20.7 14.7C20.6172 14.7828 20.4828 14.7828 20.4 14.7L19.9 14.2C17.7909 12.0909 14.2091 12.0909 12.1 14.2L11.6 14.7C11.5172 14.7828 11.3828 14.7828 11.3 14.7L10.1 13.5C9.93431 13.3343 9.93431 13.0657 10.1 12.9L10.5 12.5ZM24 14.9L25.1 16C25.2657 16.1657 25.2657 16.4343 25.1 16.6L19.6 22.1C19.4343 22.2657 19.1657 22.2657 19 22.1L15.1 18.2C15.0586 18.1586 14.9914 18.1586 14.95 18.2L11.05 22.1C10.8843 22.2657 10.6157 22.2657 10.45 22.1L4.9 16.6C4.73431 16.4343 4.73431 16.1657 4.9 16L6 14.9C6.16569 14.7343 6.43431 14.7343 6.6 14.9L10.5 18.8C10.5414 18.8414 10.6086 18.8414 10.65 18.8L14.55 14.9C14.7157 14.7343 14.9843 14.7343 15.15 14.9L19.05 18.8C19.0914 18.8414 19.1586 18.8414 19.2 18.8L23.1 14.9C23.2657 14.7343 23.5343 14.7343 23.7 14.9L24 14.9Z" fill="white"/>
    </svg>
  );
}

// 钱包品牌配置
export interface WalletBrand {
  icon: (props: { size?: number }) => JSX.Element;
  primaryColor: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  glowClass: string;
}

export const WALLET_BRANDS: Record<WalletType, WalletBrand> = {
  metamask: {
    icon: MetaMaskIcon,
    primaryColor: '#E2761B',
    bgClass: 'bg-[#E2761B]/10',
    borderClass: 'border-[#E2761B]/60',
    textClass: 'text-[#E2761B]',
    glowClass: 'shadow-[0_0_12px_rgba(226,118,27,0.3)]',
  },
  okx: {
    icon: OKXIcon,
    primaryColor: '#000000',
    bgClass: 'bg-white/10',
    borderClass: 'border-white/60',
    textClass: 'text-white',
    glowClass: 'shadow-[0_0_12px_rgba(255,255,255,0.2)]',
  },
  binance: {
    icon: BinanceIcon,
    primaryColor: '#F3BA2F',
    bgClass: 'bg-[#F3BA2F]/10',
    borderClass: 'border-[#F3BA2F]/60',
    textClass: 'text-[#F3BA2F]',
    glowClass: 'shadow-[0_0_12px_rgba(243,186,47,0.3)]',
  },
  tokenpocket: {
    icon: TokenPocketIcon,
    primaryColor: '#2980FE',
    bgClass: 'bg-[#2980FE]/10',
    borderClass: 'border-[#2980FE]/60',
    textClass: 'text-[#2980FE]',
    glowClass: 'shadow-[0_0_12px_rgba(41,128,254,0.3)]',
  },
  walletconnect: {
    icon: WalletConnectIcon,
    primaryColor: '#3B99FC',
    bgClass: 'bg-[#3B99FC]/10',
    borderClass: 'border-[#3B99FC]/60',
    textClass: 'text-[#3B99FC]',
    glowClass: 'shadow-[0_0_12px_rgba(59,153,252,0.3)]',
  },
  unknown: {
    icon: MetaMaskIcon,
    primaryColor: '#888888',
    bgClass: 'bg-muted/10',
    borderClass: 'border-border/60',
    textClass: 'text-muted-foreground',
    glowClass: '',
  },
};

// 获取钱包品牌信息
export function getWalletBrand(walletType: WalletType): WalletBrand {
  return WALLET_BRANDS[walletType] || WALLET_BRANDS.unknown;
}
