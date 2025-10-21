"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageDropdown from './LanguageDropdown';
import Image from 'next/image';

interface HeaderProps {
  locale: string;
  isRTL: boolean;
  onLanguageChange: (lang: 'en' | 'fr' | 'ar') => void;
}

export default function Header({ locale, isRTL, onLanguageChange }: HeaderProps) {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);

  // Listen to scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) { // hide banner after scrolling 50px
        setShowTopBanner(false);
      } else {
        setShowTopBanner(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent">
      {/* Top Banner */}
      {showTopBanner && (
<div className="bg-[#02355E]/80 backdrop-blur-md border-b border-white/10">
  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
    <p className="text-white text-xs md:text-sm font-semibold">
      Explore Fez like never before —{' '}
      <a href="#" className="underline hover:text-emerald-300 transition">
        Download the GO-FEZ App today!
      </a>
    </p>

    <div className="flex items-center gap-3">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition">
        <i className="fab fa-facebook-f text-[#02355E] text-sm"></i>
      </a>
      <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition">
        <i className="fab fa-telegram-plane text-[#02355E] text-sm"></i>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition">
        <i className="fab fa-instagram text-[#02355E] text-sm"></i>
      </a>
    </div>
  </div>
</div>


      )}
      
      {/* Main Navigation */}
      <div className="bg-[#02355E]/60 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            <div className={`hidden lg:flex items-center gap-6 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.home')}</a>
              <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.routes')}</a>
              <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.pois')}</a>
              <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.rewards')}</a>
              <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.partners')}</a>
              <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.contact')}</a>
            </div>
            <div className="flex-shrink-0">
<div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
  <Image
    src="/images/logo.png"
    alt="GO-FEZ Logo"
    width={64}
    height={64}
    className="object-contain"
    priority
  />
</div>
            </div>
            <div className={`hidden lg:flex items-center gap-3 flex-1 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
              <LanguageDropdown locale={locale} onLanguageChange={onLanguageChange} />
              <button className="px-4 py-2 text-sm text-white font-semibold hover:bg-white/10 transition rounded-lg">
                {t('auth.login')}
              </button>
              <button className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-semibold">
                {t('auth.signup')}
              </button>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-white">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#02355E]/95 backdrop-blur-md border-b border-white/10">
          <div className="px-4 py-4 space-y-2">
            <a href="#" className="block text-white font-medium py-2">{t('nav.home')}</a>
            <a href="#" className="block text-white font-medium py-2">{t('nav.routes')}</a>
            <a href="#" className="block text-white font-medium py-2">{t('nav.pois')}</a>
            <a href="#" className="block text-white font-medium py-2">{t('nav.rewards')}</a>
            <a href="#" className="block text-white font-medium py-2">{t('nav.partners')}</a>
            <a href="#" className="block text-white font-medium py-2">{t('nav.contact')}</a>
            <div className="pt-3 border-t border-white/20">
              <LanguageDropdown locale={locale} onLanguageChange={onLanguageChange} />
            </div>
            <button className="w-full px-6 py-2.5 text-white font-semibold border border-white rounded-lg mt-3">
              {t('auth.login')}
            </button>
            <button className="w-full px-6 py-2.5 bg-emerald-600 text-white rounded-full font-semibold mt-2">
              {t('auth.signup')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
