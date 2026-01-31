export type ThemeType = 'gold' | 'roseGold' | 'platinum';

export interface WheelSector {
  id: string;
  label: string;
  emoji: string;
  probability: number;
  poolPercent: number;
}

export interface CinematicWheelProps {
  sectors: WheelSector[];
  prizePool: number;
  theme?: ThemeType;
  onSpinComplete?: (sector: WheelSector, payout: number) => void;
  /** 演示模式：无需连接钱包即可旋转 */
  demoMode?: boolean;
}

export const THEME_COLORS: Record<ThemeType, {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  gradient: string[];
}> = {
  gold: {
    primary: 'hsl(45, 100%, 50%)',
    secondary: 'hsl(45, 80%, 35%)',
    accent: 'hsl(45, 100%, 70%)',
    glow: 'hsl(45, 100%, 50%)',
    gradient: ['hsl(45, 100%, 60%)', 'hsl(45, 80%, 40%)', 'hsl(35, 100%, 30%)'],
  },
  roseGold: {
    primary: 'hsl(15, 70%, 60%)',
    secondary: 'hsl(15, 50%, 40%)',
    accent: 'hsl(350, 80%, 70%)',
    glow: 'hsl(350, 80%, 60%)',
    gradient: ['hsl(15, 80%, 70%)', 'hsl(350, 60%, 50%)', 'hsl(330, 50%, 35%)'],
  },
  platinum: {
    primary: 'hsl(220, 20%, 70%)',
    secondary: 'hsl(220, 15%, 40%)',
    accent: 'hsl(200, 100%, 70%)',
    glow: 'hsl(200, 100%, 60%)',
    gradient: ['hsl(220, 30%, 80%)', 'hsl(220, 20%, 50%)', 'hsl(220, 15%, 25%)'],
  },
};
