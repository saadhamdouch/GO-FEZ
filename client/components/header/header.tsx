"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import LanguageSelector from './LanguageSelector';
import Login from '../auth/Login';
import SignUp from '../auth/SignUp';
import ForgotPassword from '../auth/ForgotPassword';

interface HeaderProps {
  locale: string;
  isRTL: boolean;
  onLanguageChange: (lang: 'en' | 'fr' | 'ar') => void;
}

export default function Header({ locale, isRTL, onLanguageChange }: HeaderProps) {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false); // ✨ 1. Add new state for scroll effect
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hide top banner after scrolling 50px
      setShowTopBanner(window.scrollY <= 50);
      // ✨ 2. Add blur effect after scrolling just a little (e.g., > 10px)
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    // Cleanup function to remove the event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <>
    {/* ✨ 3. Apply a transition to the entire nav for smooth color/blur changes */}
    <nav className="fixed top-0 w-full z-50 transition-all duration-300">

      {/* Top Banner */}
      {showTopBanner && (
        <div className="border-b border-white/10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col lg:flex-row items-center justify-center lg:justify-between">
            {/* ... (content of top banner is unchanged) ... */}
            <p className="hidden sm:block text-white text-xs md:text-sm font-semibold lg:text-left">
              Explore Fez like never before —{' '}
              <a href="#" className="underline hover:text-emerald-300 transition">
                Download the GO-FEZ App today!
              </a>
            </p>
            <p className="sm:hidden text-white text-xs md:text-sm font-semibold text-center">
              <a href="#" className="underline hover:text-emerald-300 transition">
                Download the GO-FEZ App today!
              </a>
            </p>
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
      {/* ✨ 4. Conditionally apply classes for the blur/transparent effect */}
      <div className={`
        border-b transition-all duration-300
        ${isScrolled 
            ? 'border-white/20 bg-[#02355E]/80 backdrop-blur-lg' // Scrolled state: semi-transparent, blurred
            : 'border-white/10 bg-transparent' // Top of page state: fully transparent
        }
      `}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16 md:h-18">
            {/* ... (rest of the header content is unchanged) ... */}

            {/* Mobile layout only */}
            <div className="flex lg:hidden justify-between items-center w-full">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
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
            <button onClick={() => setIsSignUpOpen(true)} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-semibold">
                {t('auth.signup')}
              </button>
            </div>

            {/* Desktop & md screens */}
            <div className="hidden md:flex items-center justify-between w-full relative">
              <div className="flex items-center gap-6">
                <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.home')}</a>
                <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.routes')}</a>
                <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.pois')}</a>
                <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.rewards')}</a>
                <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.partners')}</a>
                <a href="#" className="text-white hover:text-emerald-400 transition text-sm font-medium">{t('nav.contact')}</a>
                <a href="/admin" className="text-emerald-400 hover:text-white font-semibold text-sm transition">go to Admin </a>
              </div>
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
              <div className="flex items-center gap-3">
                <LanguageSelector locale={locale} onLanguageChange={onLanguageChange} />
                <button onClick={() => setIsLoginOpen(true)} className="px-4 py-2 text-sm text-white font-semibold hover:bg-white/10 transition rounded-lg">
                  {t('auth.login')}
                </button>
                <button onClick={() => setIsSignUpOpen(true)} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-semibold">
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
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-0 left-0 h-full w-64 bg-[#02355E] z-50 flex flex-col shadow-2xl overflow-y-auto">
            {/* ... (sidebar content is unchanged) ... */}
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
            <div className="flex-1 px-6 py-6 space-y-1">
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">{t('nav.home')}</a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">{t('nav.routes')}</a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">{t('nav.pois')}</a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">{t('nav.rewards')}</a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">{t('nav.partners')}</a>
              <a href="#" className="block text-white font-medium py-3 hover:text-emerald-400 transition">{t('nav.contact')}</a>
            </div>
            <div className="p-6 space-y-4 border-t border-white/10">
              <button onClick={() => setIsSignUpOpen(true)} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition">{t('auth.signup')}</button>
              <button onClick={() => setIsLoginOpen(true)} className="w-full px-6 py-3 text-white font-semibold border border-white/30 rounded-lg hover:bg-white/10 transition">{t('auth.login')}</button>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition"><i className="fab fa-facebook-f text-[#02355E] text-sm"></i></a>
                <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition"><i className="fab fa-telegram-plane text-[#02355E] text-sm"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition"><i className="fab fa-instagram text-[#02355E] text-sm"></i></a>
                <div className="ml-1">
                  <LanguageSelector dropUp={true} locale={locale} onLanguageChange={onLanguageChange} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </nav>
    {isLoginOpen && (
      <Login
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => {
          setIsLoginOpen(false);
          setIsSignUpOpen(true);
        }}
        onSwitchToForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotOpen(true);
        }}
      />
    )}
    {isSignUpOpen && (
      <SignUp
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToLogin={() => {
          setIsSignUpOpen(false);
          setIsLoginOpen(true);
        }}
      />
    )}
    {isForgotOpen && (
      <ForgotPassword
        onClose={() => setIsForgotOpen(false)}
        onSwitchToLogin={() => {
          setIsForgotOpen(false);
          setIsLoginOpen(true);
        }}
      />
    )}
    </>
  );
}