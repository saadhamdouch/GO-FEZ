"use client"

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

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBanner(window.scrollY <= 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent">

      {/* Top Banner */}
      {showTopBanner && (
        <div className="bg-[#02355E]/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col lg:flex-row items-center justify-center lg:justify-between">

            {/* Text: hide on small screens, show on md and up */}
            <p className="hidden sm:block text-white text-xs md:text-sm font-semibold lg:text-left">
              Explore Fez like never before —{' '}
              <a href="#" className="underline hover:text-emerald-300 transition">
                Download the GO-FEZ App today!
              </a>
            </p>

            {/* Small screens only: show centered download link */}
            <p className="sm:hidden text-white text-xs md:text-sm font-semibold text-center">
              <a href="#" className="underline hover:text-emerald-300 transition">
                Download the GO-FEZ App today!
              </a>
            </p>

            {/* Desktop social icons */}
            <div className="hidden lg:flex items-center gap-3 mt-2 lg:mt-0">
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
  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
    <div className="flex justify-between items-center h-16 md:h-18">

      {/* Mobile layout only */}
      <div className="flex lg:hidden justify-between items-center w-full">
        {/* Menu left */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo center */}
        <div className="flex-1 flex justify-center">
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

        {/* Sign up right */}
        <button className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-semibold">
          {t('auth.signup')}
        </button>
      </div>

      {/* Desktop & md screens */}
      <div className="hidden md:flex items-center justify-between w-full relative">
        {/* Left Nav Links */}
        <div className="flex items-center gap-6">
          <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.home')}</a>
          <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.routes')}</a>
          <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.pois')}</a>
          <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.rewards')}</a>
          <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.partners')}</a>
          <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.contact')}</a>

        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
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

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <LanguageDropdown locale={locale} onLanguageChange={onLanguageChange} />
          <button className="px-4 py-2 text-sm text-white font-semibold hover:bg-white/10 transition rounded-lg">
            {t('auth.login')}
          </button>
          <button className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-semibold">
            {t('auth.signup')}
          </button>
        </div>
      </div>

    </div>
  </div>
</div>


      {/* Mobile Sidebar Menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="lg:hidden fixed top-0 left-0 h-full w-64 bg-[#02355E] z-50 flex flex-col shadow-2xl">
            {/* Logo Section */}
            <div className="p-6 border-b border-white/10">
              <div className="w-16 h-16 mx-auto flex items-center justify-center">
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

            {/* Navigation Links */}
            <div className="flex-1 px-6 py-6 space-y-1">
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">
                {t('nav.home')}
              </a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">
                {t('nav.routes')}
              </a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">
                {t('nav.pois')}
              </a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">
                {t('nav.rewards')}
              </a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">
                {t('nav.partners')}
              </a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">
                {t('nav.contact')}
              </a>
            </div>

            {/* Bottom Section */}
            <div className="p-6 space-y-4 border-t border-white/10">
              {/* Sign up Button */}
              <button className="w-full px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition">
                {t('auth.signup')}
              </button>
              
              {/* Login Button */}
              <button className="w-full px-6 py-3 text-white font-semibold border border-white/30 rounded-lg hover:bg-white/10 transition">
                {t('auth.login')}
              </button>

              {/* Social Icons & Language */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition">
                  <i className="fab fa-facebook-f text-[#02355E] text-sm"></i>
                </a>
                <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition">
                  <i className="fab fa-telegram-plane text-[#02355E] text-sm"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition">
                  <i className="fab fa-instagram text-[#02355E] text-sm"></i>
                </a>
                <div className="ml-1">
                  <LanguageDropdown locale={locale} onLanguageChange={onLanguageChange} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </nav>
  );
}