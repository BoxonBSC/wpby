export interface RouletteItem {
  id: string;
  label: string;
  color: string;
  icon?: string;
  probability?: number;
}

export interface RouletteWheelProps {
  items: RouletteItem[];
  onWin?: (item: RouletteItem, index: number) => void;
  onSpinStart?: () => void;
  onSpinEnd?: () => void;
  spinning?: boolean;
  disabled?: boolean;
  size?: number;
  theme?: 'gold' | 'platinum' | 'rose' | 'emerald';
}

export interface SoundEffects {
  tick?: () => void;
  spinStart?: () => void;
  spinEnd?: () => void;
  win?: () => void;
}

export const THEME_PRESETS = {
  gold: {
    primary: 'hsl(45, 100%, 50%)',
    secondary: 'hsl(35, 100%, 40%)',
    accent: 'hsl(50, 100%, 70%)',
    glow: 'hsl(45, 100%, 60%)',
    rim: ['hsl(45, 100%, 65%)', 'hsl(40, 90%, 45%)', 'hsl(35, 80%, 30%)'],
  },
  platinum: {
    primary: 'hsl(220, 20%, 75%)',
    secondary: 'hsl(220, 15%, 50%)',
    accent: 'hsl(200, 100%, 75%)',
    glow: 'hsl(200, 80%, 70%)',
    rim: ['hsl(220, 25%, 85%)', 'hsl(220, 20%, 60%)', 'hsl(220, 15%, 35%)'],
  },
  rose: {
    primary: 'hsl(350, 80%, 65%)',
    secondary: 'hsl(340, 70%, 45%)',
    accent: 'hsl(330, 100%, 80%)',
    glow: 'hsl(350, 90%, 70%)',
    rim: ['hsl(15, 80%, 75%)', 'hsl(350, 70%, 55%)', 'hsl(340, 60%, 35%)'],
  },
  emerald: {
    primary: 'hsl(150, 80%, 45%)',
    secondary: 'hsl(160, 70%, 35%)',
    accent: 'hsl(140, 100%, 70%)',
    glow: 'hsl(150, 90%, 55%)',
    rim: ['hsl(150, 80%, 60%)', 'hsl(155, 70%, 40%)', 'hsl(160, 60%, 25%)'],
  },
} as const;
