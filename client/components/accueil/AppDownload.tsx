"use client"

import React from 'react';
import { useTranslations } from 'next-intl';

interface AppDownloadProps {
  isRTL: boolean;
}

export default function AppDownload({ isRTL }: AppDownloadProps) {
  const t = useTranslations();

  return (
    <div className="py-12 md:py-20 bg-[#02355E] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 w-[491px] h-full opacity-30`}>
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)`,
            }}
          />
        </div>
      </div>
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-[1300px] mx-auto bg-[#02355E] rounded-[38px] px-8 md:px-16 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          <div className={`flex-1 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'} max-w-[737px]`}>
            <h2 className="text-2xl md:text-[32px] font-bold mb-3 md:mb-4 leading-tight bg-gradient-to-r from-white to-emerald-600 bg-clip-text text-transparent">
              {t('download.title')}
            </h2>
            <p className="text-white text-base md:text-xl mb-6 md:mb-8 leading-relaxed">
              {t('download.description')}
            </p>
            <div className={`flex flex-wrap gap-3 justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'}`}>
              <button className="h-12 md:h-14 px-6 bg-white rounded-lg hover:bg-gray-100 transition flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-black text-sm md:text-base font-semibold">{t('download.appStore')}</span>
              </button>
              <button className="h-12 md:h-14 px-6 bg-white rounded-lg hover:bg-gray-100 transition flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <span className="text-black text-sm md:text-base font-semibold">{t('download.googlePlay')}</span>
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 relative">
            <div className="relative w-48 md:w-64">
              <div className="relative z-10">
                <div className="w-full aspect-[9/19] bg-gray-900 rounded-[3rem] shadow-2xl p-2 md:p-3 border-4 md:border-8 border-gray-800">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-[2.5rem] flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 text-white">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-3 md:mb-4">
                        <span className="text-blue-600 font-bold text-2xl md:text-3xl">G</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-2">GO FEZ</h3>
                      <p className="text-blue-100 text-xs md:text-sm text-center">
                        {t('download.appPreview')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 md:h-7 bg-gray-900 rounded-b-2xl" />
              </div>
              <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}