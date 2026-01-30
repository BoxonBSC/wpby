import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, History, FileText, Menu, X, Flame } from 'lucide-react';
import { useState } from 'react';
import { AudioControls } from './AudioControls';

const navItems = [
  { path: '/', label: '游戏', icon: Gamepad2 },
  { path: '/history', label: '记录', icon: History },
  { path: '/rules', label: '规则', icon: FileText },
];

export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-fire-crimson/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <Flame className="w-6 h-6 text-fire-ember flame-flicker" />
              <div className="absolute inset-0 blur-sm bg-fire-orange/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <span className="font-display text-lg md:text-xl fire-text hidden sm:block">
              BURN SLOTS
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative px-4 py-2 rounded-lg flex items-center gap-2
                    font-display text-sm transition-all duration-200
                    ${isActive 
                      ? 'text-fire-ember' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-fire-crimson/15 border border-fire-crimson/30"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Audio Controls & Mobile Menu */}
          <div className="flex items-center gap-3">
            <AudioControls />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-fire-crimson/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ 
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        className="md:hidden overflow-hidden border-t border-fire-crimson/20 bg-background/95 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  font-display transition-all duration-200
                  ${isActive 
                    ? 'text-fire-ember bg-fire-crimson/15' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-fire-crimson/10'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
