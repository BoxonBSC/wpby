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
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(180deg, #1a1510 0%, #0f0c07 100%)',
        borderBottom: '3px solid transparent',
        borderImage: 'linear-gradient(90deg, transparent 0%, #C9A347 20%, #FFD700 50%, #C9A347 80%, transparent 100%) 1',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(201, 163, 71, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 顶部金边装饰线 */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(201, 163, 71, 0.5) 20%, rgba(255, 215, 0, 0.8) 50%, rgba(201, 163, 71, 0.5) 80%, transparent 100%)',
        }}
      />
      
      {/* 皮革纹理背景 */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(201, 163, 71, 0.03) 2px,
              rgba(201, 163, 71, 0.03) 4px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 2px,
              rgba(139, 114, 48, 0.03) 2px,
              rgba(139, 114, 48, 0.03) 4px
            )
          `,
        }}
      />
      
      {/* 左右角装饰 */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 left-4 w-8 h-8 hidden lg:block"
        style={{
          background: 'radial-gradient(circle, rgba(201, 163, 71, 0.3) 0%, transparent 70%)',
        }}
      >
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            border: '1px solid rgba(201, 163, 71, 0.4)',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>
      <div 
        className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 hidden lg:block"
        style={{
          background: 'radial-gradient(circle, rgba(201, 163, 71, 0.3) 0%, transparent 70%)',
        }}
      >
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            border: '1px solid rgba(201, 163, 71, 0.4)',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              className="relative"
              style={{ perspective: '1000px' }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {/* 外层光环 - 旋转的金色光圈 */}
              <motion.div
                className="absolute -inset-3 rounded-full pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 215, 0, 0.4) 25%, transparent 50%, rgba(201, 163, 71, 0.3) 75%, transparent 100%)',
                  filter: 'blur(4px)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 内层光晕脉动 */}
              <motion.div
                className="absolute -inset-2 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, transparent 60%)',
                  filter: 'blur(6px)',
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* 3D卡牌容器 */}
              <motion.div
                className="relative w-11 h-11"
                style={{
                  transformStyle: 'preserve-3d',
                }}
                animate={{ 
                  rotateY: [0, 15, 0, -15, 0],
                  rotateX: [0, -8, 0, 8, 0],
                  rotateZ: [0, 2, 0, -2, 0],
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: [0.45, 0.05, 0.55, 0.95],
                }}
              >
                {/* 卡牌主体 - 正面 */}
                <motion.div
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(145deg, #1a1510 0%, #0f0c07 50%, #1a1510 100%)',
                    border: '2px solid transparent',
                    borderImage: 'linear-gradient(135deg, #FFD700, #C9A347, #8B7230, #C9A347, #FFD700) 1',
                    boxShadow: `
                      0 0 20px rgba(255, 215, 0, 0.4),
                      0 4px 15px rgba(0, 0, 0, 0.6),
                      inset 0 1px 0 rgba(255, 215, 0, 0.3),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.5)
                    `,
                  }}
                >
                  {/* 金色边框装饰 */}
                  <div 
                    className="absolute inset-[2px] rounded-md"
                    style={{
                      border: '1px solid rgba(201, 163, 71, 0.4)',
                    }}
                  />
                  
                  {/* Logo图片 */}
                  <motion.img
                    src={aceCardIcon}
                    alt="王牌博弈"
                    className="w-full h-full object-contain p-1"
                    animate={{ 
                      filter: [
                        'drop-shadow(0 0 8px rgba(201, 163, 71, 0.5)) brightness(1)',
                        'drop-shadow(0 0 15px rgba(255, 215, 0, 0.9)) brightness(1.15)',
                        'drop-shadow(0 0 8px rgba(201, 163, 71, 0.5)) brightness(1)',
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* 动态光线反射 */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%, rgba(255, 215, 0, 0.1) 100%)',
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* 扫光效果 */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                  >
                    <motion.div
                      className="absolute w-[200%] h-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 215, 0, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 100%)',
                        transform: 'skewX(-20deg)',
                      }}
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        repeatDelay: 2,
                      }}
                    />
                  </motion.div>
                </motion.div>
                
                {/* 立体阴影层 */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    transform: 'translateZ(-4px)',
                    background: 'linear-gradient(135deg, #8B7230 0%, #5a4a20 100%)',
                    opacity: 0.6,
                  }}
                />
              </motion.div>
              
              {/* 底部反光 */}
              <motion.div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full"
                style={{
                  background: 'radial-gradient(ellipse, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                  filter: 'blur(3px)',
                }}
                animate={{
                  scaleX: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <motion.span 
                className="text-xl font-black uppercase"
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
              <span 
                className="text-[10px] tracking-wider"
                style={{
                  fontFamily: '"Orbitron", sans-serif',
                  color: 'rgba(201, 163, 71, 0.7)',
                  letterSpacing: '0.1em',
                  marginTop: '-2px',
                }}
              >
                GAMEFi燃烧通缩协议
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-5 py-2.5 flex items-center gap-2 transition-all duration-300 group"
                  style={{
                    fontFamily: '"Cinzel", "Noto Serif SC", serif',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: isActive ? '#FFD700' : 'rgba(201, 163, 71, 0.85)',
                    textShadow: isActive ? '0 0 20px rgba(255, 215, 0, 0.8)' : 'none',
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  
                  {/* 底部装饰线 */}
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px]"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: isActive ? '80%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Hover 效果 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, rgba(201, 163, 71, 0.1) 0%, transparent 70%)',
                    }}
                  />
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0"
                      style={{ 
                        zIndex: -1,
                        background: 'linear-gradient(180deg, rgba(201, 163, 71, 0.08) 0%, rgba(255, 215, 0, 0.05) 100%)',
                        borderTop: '1px solid rgba(201, 163, 71, 0.3)',
                        borderBottom: '1px solid rgba(201, 163, 71, 0.2)',
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
        className="md:hidden overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg, #1a1510 0%, #0f0c07 100%)',
          borderTop: '2px solid rgba(201, 163, 71, 0.4)',
        }}
      >
        {/* 移动端菜单皮革纹理 */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(201, 163, 71, 0.05) 2px,
                rgba(201, 163, 71, 0.05) 4px
              )
            `,
          }}
        />
        
        <div className="container mx-auto px-4 py-3 relative">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 transition-all duration-300 relative"
                style={{
                  fontFamily: '"Cinzel", "Noto Serif SC", serif',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isActive ? '#FFD700' : 'rgba(201, 163, 71, 0.85)',
                  textShadow: isActive ? '0 0 15px rgba(255, 215, 0, 0.7)' : 'none',
                  borderBottom: index < navItems.length - 1 ? '1px solid rgba(201, 163, 71, 0.15)' : 'none',
                }}
              >
                {isActive && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6"
                    style={{
                      background: 'linear-gradient(180deg, #FFD700 0%, #C9A347 100%)',
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                    }}
                  />
                )}
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
