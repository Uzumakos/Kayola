import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { KayolaLogo } from './KayolaLogo';
import {
  Menu,
  X,
  Compass,
  Lock,
  Globe,
  Search,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { locale, setLocale, t, currentPath, navigate } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.home, path: `/${locale}` },
    { label: t.nav.gallery, path: `/${locale}/gallery` },
    { label: t.nav.about, path: `/${locale}/about` },
    { label: t.nav.contact, path: `/${locale}/contact` },
  ];

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return currentPath === `/${locale}` || currentPath === `/${locale}/`;
    }
    return currentPath.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#1A1A1A]/10'
          : 'bg-[#FAF9F6] border-b border-[#1A1A1A]/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div onClick={() => handleNavClick(`/${locale}`)}>
            <KayolaLogo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-[0.18em]">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`transition-colors relative py-1.5 ${
                    active
                      ? 'text-[#1A1A1A] font-bold border-b-2 border-[#1A1A1A]'
                      : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Language Switcher, Track Order, Admin */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Language Switcher FR | EN (Artistic Flair pill design) */}
            <div className="flex items-center bg-[#F0EFEC] rounded-full p-1 text-[10px] font-bold tracking-wider">
              <button
                type="button"
                onClick={() => setLocale('fr')}
                className={`px-3 py-1 rounded-full transition-all duration-200 ${
                  locale === 'fr'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
                }`}
                aria-label="Passer en Français"
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-3 py-1 rounded-full transition-all duration-200 ${
                  locale === 'en'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('ht')}
                className={`px-3 py-1 rounded-full transition-all duration-200 ${
                  locale === 'ht'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
                }`}
                aria-label="Switch to Kreyòl"
              >
                HT
              </button>
            </div>

            {/* Track Order Button */}
            <button
              onClick={() => handleNavClick(`/${locale}/order/track`)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase border transition-all ${
                currentPath.includes('/order/track')
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/10 hover:border-[#1A1A1A]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#EF5A33]" />
              <span>{t.nav.trackOrder}</span>
            </button>

          </div>

          {/* Mobile Right Bar: Language Switch + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Language Switcher Mobile */}
            <div className="flex items-center bg-[#F0EFEC] p-0.5 rounded-full text-[10px] font-bold mr-1">
              <button
                onClick={() => setLocale('fr')}
                className={`px-2.5 py-1 rounded-full ${
                  locale === 'fr' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#1A1A1A]/40'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 rounded-full ${
                  locale === 'en' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#1A1A1A]/40'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('ht')}
                className={`px-2.5 py-1 rounded-full ${
                  locale === 'ht' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#1A1A1A]/40'
                }`}
              >
                HT
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1A1A] hover:bg-[#F0EFEC] rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-[#E8E6E2] bg-[#FAF9F6] px-4 pt-2 pb-6 space-y-3"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between transition-colors ${
                    isActive(link.path)
                      ? 'bg-[#EF5A33]/10 text-[#EF5A33] font-semibold'
                      : 'text-[#171717] hover:bg-[#E8E6E2]/40'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))}

              <button
                onClick={() => handleNavClick(`/${locale}/order/track`)}
                className="w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between text-[#171717] hover:bg-[#E8E6E2]/40"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#EF5A33]" />
                  {t.nav.trackOrder}
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>

            <div className="pt-3 border-t border-[#E8E6E2] flex items-center justify-center px-2">
              <span className="text-xs text-[#737373]">
                KAYOLA © 2026
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
