"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface HeroProps {
  dir: string;
  isRTL: boolean;
}

export default function Hero({ dir, isRTL }: HeroProps) {
  const t = useTranslations();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative pt-[90px] md:pt-[100px] text-white overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* Background Image */}
      <div className="">
        {!imgError ? (
<Image
  src="/images/hero.jpg"
  alt="Fez Background"
  fill
  className="object-cover"
  priority
  onError={(e) => {
    console.error('Hero background image failed to load:', e);
  }}
/>

        ) : (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-white">
            Image failed to load
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-[#02355E]/70 via-[#02355E]/60 to-[#02355E]/80" />
      </div>


      {/* Hero Content */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold mb-5 md:mb-6 leading-tight">
            {t('hero.discover')} <span className="text-emerald-400">{t('hero.fez')}</span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{t('hero.through')}</span>
          </h1>
          <p className="text-base md:text-xl text-gray-100 mb-8 md:mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="max-w-[600px] mx-auto mb-6">
            <div className={`relative bg-white rounded-full px-5 md:px-7 py-3.5 md:py-4 flex items-center gap-3 shadow-2xl ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Search className="text-gray-400 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder={t('hero.search')}
                className={`flex-1 bg-transparent text-gray-700 text-sm md:text-base focus:outline-none placeholder:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                dir={dir}
              />
              <button className="bg-emerald-600 text-white px-5 md:px-7 py-2 md:py-2.5 rounded-full font-semibold hover:bg-emerald-700 transition text-sm md:text-base whitespace-nowrap shadow-lg">
                {t('hero.searchButton')}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <button className="px-5 md:px-6 py-2 md:py-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-sm md:text-base font-medium border border-white/30">
              {t('filters.museums')}
            </button>
            <button className="px-5 md:px-6 py-2 md:py-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-sm md:text-base font-medium border border-white/30">
              {t('filters.restaurants')}
            </button>
            <button className="px-5 md:px-6 py-2 md:py-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-sm md:text-base font-medium border border-white/30">
              {t('filters.monuments')}
            </button>
            <button className="px-5 md:px-6 py-2 md:py-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-sm md:text-base font-medium border border-white/30">
              {t('filters.markets')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
