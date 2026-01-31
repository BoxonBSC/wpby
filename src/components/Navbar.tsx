import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, History, FileText, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { AudioControls } from './AudioControls';
import { useLanguage } from '@/contexts/LanguageContext';
import aceCardIcon from '@/assets/ace-card-icon.png';

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
    <nav 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 12, 7, 0.95) 0%, rgba(15, 12, 7, 0.85) 100%)',
        borderBottom: '1px solid rgba(201, 163, 71, 0.3)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(201, 163, 71, 0.2) inset',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              className="relative"
              style={{ perspective: '600px' }}
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                className="relative"
                style={{
                  transformStyle: 'preserve-3d',
                }}
                animate={{ 
                  rotateY: [0, 180, 360],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                }}
              >
                {/* 正面 */}
                <motion.img
                  src={aceCardIcon}
                  alt="王牌博弈"
                  className="w-10 h-10 object-contain"
                  style={{
                    backfaceVisibility: 'hidden',
                    filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))',
                  }}
                  animate={{ 
                    filter: [
                      'drop-shadow(0 0 15px rgba(201, 163, 71, 0.6))',
                      'drop-shadow(0 0 25px rgba(255, 215, 0, 1))',
                      'drop-shadow(0 0 15px rgba(201, 163, 71, 0.6))',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* 背面 */}
                <div
                  className="absolute inset-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #C9A347 0%, #8B7230 50%, #C9A347 100%)',
                    border: '2px solid #FFD700',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  <span 
                    className="text-xl font-bold"
                    style={{ 
                      color: '#0f0c07',
                      textShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
                    }}
                  >
                    ♠
                  </span>
                </div>
              </motion.div>
              
              {/* 光晕效果 */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                  zIndex: -1,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <motion.span 
              className="text-xl hidden sm:block font-black uppercase"
              style={{
                fontFamily: '"Orbitron", "Noto Sans SC", sans-serif',
                letterSpacing: '0.15em',
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 40%, #C9A347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.4)',
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))',
              }}
              animate={{
                textShadow: [
                  '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.4)',
                  '0 0 50px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 165, 0, 0.6), 0 0 120px rgba(201, 163, 71, 0.3)',
                  '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.4)',
                ],
                filter: [
                  'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))',
                  'drop-shadow(0 0 15px rgba(255, 215, 0, 1))',
                  'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))',
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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
                  className="relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300"
                  style={{
                    fontFamily: '"Orbitron", sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: isActive ? '#FFD700' : 'rgba(201, 163, 71, 0.7)',
                    textShadow: isActive ? '0 0 15px rgba(255, 215, 0, 0.6)' : 'none',
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg"
                      style={{ 
                        zIndex: -1,
                        background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)',
                        border: '1px solid rgba(201, 163, 71, 0.4)',
                        boxShadow: '0 0 15px rgba(201, 163, 71, 0.2), inset 0 1px 0 rgba(255, 215, 0, 0.2)',
                      }}
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors"
              style={{
                background: 'rgba(201, 163, 71, 0.1)',
                border: '1px solid rgba(201, 163, 71, 0.3)',
              }}
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe className="w-4 h-4" style={{ color: '#C9A347' }} />
              <span 
                className="text-xs font-display"
                style={{ color: '#C9A347' }}
              >
                {language === 'zh' ? 'EN' : '中'}
              </span>
            </motion.button>

            <AudioControls />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{
                color: '#C9A347',
                background: isMobileMenuOpen ? 'rgba(201, 163, 71, 0.1)' : 'transparent',
              }}
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
        className="md:hidden overflow-hidden"
        style={{
          background: 'rgba(15, 12, 7, 0.98)',
          borderTop: '1px solid rgba(201, 163, 71, 0.2)',
        }}
      >
        <div className="container mx-auto px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-display transition-all duration-300"
                style={{
                  color: isActive ? '#FFD700' : 'rgba(201, 163, 71, 0.7)',
                  background: isActive ? 'rgba(201, 163, 71, 0.1)' : 'transparent',
                  textShadow: isActive ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
                }}
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
