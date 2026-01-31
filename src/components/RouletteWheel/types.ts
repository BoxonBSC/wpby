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

// Vegas Casino Color Palette
export const VEGAS_COLORS = {
  black: '#0f0c07',
  gold: '#C9A347',
  goldLight: '#E8D5A3',
  goldDark: '#8B7432',
  wine: '#4A0E1E',
  wineLight: '#6a1e2e',
  platinum: '#E0E0E0',
  platinumDark: '#B0B0B0',
};

export const THEME_PRESETS = {
  gold: {
    primary: '#C9A347',
    secondary: '#8B7432',
    accent: '#E8D5A3',
    glow: '#C9A347',
    rim: ['#E8D5A3', '#C9A347', '#8B7432'],
    dark: '#0f0c07',
  },
  platinum: {
    primary: '#E0E0E0',
    secondary: '#B0B0B0',
    accent: '#FFFFFF',
    glow: '#E0E0E0',
    rim: ['#FFFFFF', '#E0E0E0', '#808080'],
    dark: '#0f0c07',
  },
  rose: {
    primary: '#C9A347',
    secondary: '#4A0E1E',
    accent: '#E8D5A3',
    glow: '#C9A347',
    rim: ['#E8D5A3', '#C9A347', '#4A0E1E'],
    dark: '#0f0c07',
  },
  emerald: {
    primary: '#2D8B5F',
    secondary: '#1A5A3D',
    accent: '#4AE89A',
    glow: '#2D8B5F',
    rim: ['#4AE89A', '#2D8B5F', '#1A5A3D'],
    dark: '#0f0c07',
  },
} as const;
