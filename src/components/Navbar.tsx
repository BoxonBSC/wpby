import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, History, FileText, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { AudioControls } from './AudioControls';
import { useLanguage } from '@/contexts/LanguageContext';
import cardIcon from '@/assets/card-icon.png';

export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { path: '/', label: t('nav.game'), icon: Gamepad2 },
    { path: '/history', label: t('nav.history'), icon: History },
    { path: '/rules', label: t('nav.rules'), icon: FileText },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.img
              src={cardIcon}
              alt="王牌博弈"
              className="w-8 h-8 object-contain"
              animate={{ rotateY: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span 
              className="font-display text-xl hidden sm:block tracking-widest font-bold"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #C9A347 50%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(201, 163, 71, 0.3)',
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))',
              }}
              animate={{
                textShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(201, 163, 71, 0.3)',
                  '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(201, 163, 71, 0.5)',
                  '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(201, 163, 71, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              王牌博弈
            </motion.span>
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
                    font-display text-sm transition-colors
                    ${isActive 
                      ? 'text-neon-blue' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 neon-border rounded-lg bg-neon-blue/10"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Audio Controls & Language & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs font-display text-foreground">
                {language === 'zh' ? 'EN' : '中'}
              </span>
            </motion.button>

            <AudioControls />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
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
        className="md:hidden overflow-hidden border-t border-border bg-background"
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
                  font-display transition-colors
                  ${isActive 
                    ? 'text-neon-blue bg-neon-blue/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
