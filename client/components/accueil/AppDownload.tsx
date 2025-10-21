"use client"

import React from 'react';
import { useTranslations } from 'next-intl';

interface AppDownloadProps {
  isRTL: boolean;
}

export default function AppDownload({ isRTL }: AppDownloadProps) {
  const t = useTranslations();

  // Define the background style for the entire section using the requested image
  const sectionBackgroundStyle = {
    backgroundImage: `url('/images/mobile-back.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    // Removed fixed background to avoid conflicts with other elements if they use it
  };

  return (
    // Replaced solid background with image background style
    <div 
      className="py-12 md:py-20 text-white relative overflow-hidden" 
      style={sectionBackgroundStyle}
    >
      
      {/* Removed the absolute overlay with repeating linear gradient pattern */}
      
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Adjusted inner card background to match the dark blue of the image */}
        {/* Added h-full and w-full to the image to ensure it scales correctly */}
        <div className={`max-w-[1300px] mx-auto bg-[#02355E] rounded-[38px] px-8 md:px-16 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''} shadow-2xl`}>
          
          {/* Left Content Section */}
          <div className={`flex-1 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'} max-w-[737px]`}>
            {/* Title style matching the image's clear, bold, white/gradient text */}
            <h2 className="text-2xl md:text-[40px] font-bold mb-3 md:mb-4 leading-tight bg-gradient-to-r from-white via-white to-emerald-400 bg-clip-text text-transparent">
              {t('download.title') || 'Explore Fez with GPS Guidance and 360° Tours'}
            </h2>
            {/* Description text */}
            <p className="text-white text-base md:text-xl mb-6 md:mb-8 leading-relaxed opacity-80">
              {t('download.description') || 'Experience Fez through interactive routes, GPS guidance, and immersive stories.'}
            </p>
            
{/* Download Buttons - Using Font Awesome */}
<div className={`flex flex-wrap gap-4 justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'}`}>
  <button className="h-12 md:h-14 px-6 bg-white rounded-xl hover:bg-gray-100 transition flex items-center gap-2 shadow-md">
    <i className="fab fa-apple text-xl" /> {/* Font Awesome Apple icon */}
    <span className="text-black text-sm md:text-base font-semibold">
      {t('download.appStore') || 'Download on the App Store'}
    </span>
  </button>

  <button className="h-12 md:h-14 px-6 bg-white rounded-xl hover:bg-gray-100 transition flex items-center gap-2 shadow-md">
    <i className="fab fa-google-play text-xl" /> {/* Font Awesome Google Play icon */}
    <span className="text-black text-sm md:text-base font-semibold">
      {t('download.googlePlay') || 'Get it on Google Play'}
    </span>
  </button>
</div>

          </div>
          
{/* Right Phone Mockup Section - Show top half only */}
<div className="flex-shrink-0 relative w-full lg:w-auto mt-12 lg:mt-0">
  <div className="relative w-full lg:w-[430px] h-[50%] lg:h-[215px] mx-auto overflow-hidden">
    <img 
      src="/images/mobile-app-photo.png" 
      alt="Mobile App Screenshots"
      className="absolute top-0 left-0 w-full h-auto object-contain"
    />
  </div>
</div>



        </div>
      </div>
    </div>
  );
}
